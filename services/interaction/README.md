# Interaction Service

## What it is

A FastAPI microservice that owns the **marketplace core**: client orders, insider matches, and the paid insights that insiders write in response to matched orders. It is the only backend service that holds order, match, and insight data.

## Why it exists

The system is split into small services by domain:

- **Identity** owns users and sessions.
- **Interaction** (this service) owns what users are doing on the platform.
- **Semantic** will own embeddings and insider-to-order matching.
- **Ledger** will own balances, transactions, and purchases.

The reason Interaction is its own service: the order → match → insight flow is one transaction-shaped pipeline. It needs a single database to keep referential integrity, and it is read and written from many other surfaces (the web app, the Semantic matcher, the Ledger purchase flow). Pulling it out as a microservice keeps the rest of the system decoupled and lets it evolve without touching Identity or Ledger.

## What it does (today)

Exposes a versioned REST API for:

- **Orders** — create, list, get, update, delete.
- **Matches** — bulk create (from the Semantic matcher), list by insider.
- **Insights** — create, list by order, get by id, update (set `transaction_id` when paid).

The full OpenAPI spec is in `contract.yml` at the project root and is regenerated on every startup (see `main.py:save_openapi_yaml`).

## Tech stack

- **Python 3.11** (per `devenv.nix`)
- **FastAPI** with async route handlers
- **SQLAlchemy 2.0** (async, `asyncpg` driver) with `Mapped[...]` typed ORM models
- **Alembic** for schema migrations
- **Pydantic v2** for request/response schemas
- **uvicorn** as the ASGI server
- **PostgreSQL 16** (one DB per service, named `interaction`)

## File structure

```
services/interaction/
├── app/
│   ├── main.py                 # FastAPI app, router wiring, /health, OpenAPI dump
│   ├── database.py             # async engine + SessionLocal + DeclarativeBase
│   ├── dependencies.py         # get_db() generator
│   ├── api/
│   │   └── v1/
│   │       ├── api.py          # APIRouter that mounts orders, matches, insights
│   │       └── endpoints/
│   │           ├── orders.py
│   │           ├── matches.py
│   │           └── insights.py
│   ├── models/
│   │   ├── order.py            # Order ORM
│   │   ├── match.py            # Match ORM
│   │   └── insight.py          # Insight ORM
│   ├── schemas/
│   │   ├── order.py            # OrderCreate / OrderRead / OrderUpdate
│   │   ├── match.py            # MatchCreate / MatchRead
│   │   └── insight.py          # InsightCreate / InsightRead / InsightUpdate
│   ├── crud/
│   │   ├── order.py
│   │   ├── match.py
│   │   └── insight.py
│   └── middlewares/
│       └── logging.py          # X-Process-Time header on every response
├── migrations/                 # Alembic
│   └── versions/               # 4 revisions, see "Schema" below
├── alembic.ini
├── contract.yml                # Auto-regenerated OpenAPI 3.1 doc
├── Dockerfile
├── docker-compose.yml
├── devenv.nix                  # Nix shell: Python 3.11, local Postgres on 5433
├── entrypoint.sh
└── README.md
```

## API surface

All routes are mounted under `/api/v1`.

### Orders

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/orders/` | Body `{ title, text }`. `user_id` is a required query param and is the client who placed the order. Returns `OrderRead`. |
| `GET` | `/api/v1/orders/` | Lists the caller's orders. `user_id` required, `limit` (1–20, default 20), `offset` (0–10, default 0). |
| `GET` | `/api/v1/orders/{order_id}` | Returns one order, but only if it belongs to the requesting `user_id`. 404 otherwise. |
| `PATCH` | `/api/v1/orders/{order_id}` | Update `title` and/or `text`. `user_id` required. |
| `DELETE` | `/api/v1/orders/{order_id}` | 204 on success. Cascades to its matches and insights. |

### Matches

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/matches/` | Body is a list of `MatchCreate` (`{ order_id, insider_id, score, score_id? }`). 204. **This is the endpoint Semantic calls** once it has ranked insiders for a new order. |
| `GET` | `/api/v1/matches/` | Lists matches for the requesting insider. `user_id` required, `limit` (1–50, default 20), `offset` (0–10, default 0). Sorted by `score` descending. |

### Insights

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/insights/` | Body `{ match_id, text, price }`. `user_id` required (the insider). Verifies the match exists and belongs to this insider. |
| `GET` | `/api/v1/insights/` | Lists insights for one of the caller's orders. Query: `orderId` (camelCase alias) and `user_id`. |
| `GET` | `/api/v1/insights/{insight_id}` | One insight, ownership-checked against the requesting `user_id`. |
| `PATCH` | `/api/v1/insights/{insight_id}` | Body `{ transaction_id }`. Marks the insight paid and links it to a Ledger transaction. Called by the Ledger purchase flow. |

### Misc

- `GET /health` → `{"status": "up"}`
- `GET /api/v1/openapi.json` → generated OpenAPI doc
- Every response gets an `X-Process-Time` header from `ProcessTimeMiddleware`.

## Database schema

Three tables, all in the `interaction` Postgres database. Owned and migrated solely by this service.

```
orders
  id              int PK
  title           varchar(120)
  text            text
  client_id       varchar(64)   -- the user's UUID from Identity
  inquiry_id      int?          -- (planned) link to Semantic's inquiry
  status          varchar(16)   -- 'pending' | 'has_responses' | 'completed'
  created_at      timestamptz

matches
  id              int PK
  order_id        int FK -> orders.id  ON DELETE CASCADE
  insider_id      varchar(64)  -- the insider's UUID from Identity
  score           float        -- ranking score from Semantic
  score_id        int?         -- link to Semantic's score row
  is_synced       bool         -- pushed-back marker

insights
  id              int PK
  order_id        int FK -> orders.id  ON DELETE CASCADE
  match_id        int FK -> matches.id ON DELETE CASCADE
  insider_id      varchar(64)
  text            text
  price           int          -- in minor units (cents/satang)
  transaction_id  int?         -- set when the client pays via Ledger
  is_paid         bool         default false
```

Migrations, in order: `93221fa5a287` (orders) → `5ec09920cc5f` (matches) → `1805d5b92ae6` (insights) → `c692437a330f` (add `score_id` to matches).

## How it talks to other services

| Direction | Peer | What happens |
| --- | --- | --- |
| Inbound | **Web** | The web app calls `/api/v1/orders`, `/api/v1/insights`, `/api/v1/matches` from its server actions. |
| Inbound | **Semantic** | Will call `POST /api/v1/matches/` with a ranked list of (order, insider, score) tuples after it processes a new inquiry. The endpoint accepts an array — that's why it's `list[MatchCreate]`. |
| Outbound | **Semantic** | When an order is created, Interaction is supposed to `POST /inquiries` with the order text and receive an `inquiry_id` back, then store it on the order. (Stubbed — see TODO in `crud/order.py:create_order`.) |
| Outbound | **Ledger** | The "mark paid" path is initiated by Ledger, not Interaction. After Ledger processes a purchase, it `PATCH`es the matching insight with a `transaction_id`, which Interaction then links to the insight row. |
| Identity | (none) | This service does **not** verify JWTs itself. It trusts that the caller (web or another service) has already authenticated, and the caller passes `user_id` in the query string. The eventual move is for Interaction to verify its own tokens using Identity's JWKS, like the web app already does. |

## Running locally

```bash
# In the Nix devenv shell
devenv up                  # starts Postgres on :5433 and runs alembic + uvicorn on :4013

# Or manually
uvicorn app.main:app --reload --port 4013
```

`DATABASE_URL` is set automatically by `devenv.nix` and points at the local Postgres on port 5433. In Docker, the entrypoint script reads the password from `/run/secrets/postgres_identity_pass` (the secret name is a leftover from copy-paste; it should be renamed to `postgres_interaction_pass` — see "Known issues").

## Build & ship

`Dockerfile` is a two-stage build based on `node:20-alpine` and exposes port 3000 (also a leftover label; the service actually runs on `INTERACTION_PORT=4013` per `.env`). `docker-compose.yml` at this service level is wired to be included from the root `docker-compose.yml` when interaction is uncommented.

## Known issues / TODOs

- `Dockerfile` and `entrypoint.sh` were clearly copied from Identity and still reference `prisma migrate` / `dist/main` even though this is a Python service. They need to be rewritten to use `alembic upgrade head` + `uvicorn app.main:app`.
- `docker-compose.yml` lists the wrong `container_name`, `DB_USER`, and `DB_NAME` — they say `interaction` / `interaction` but the YAML says `interaction` / `interaction_user` / `identity`. Needs to be aligned.
- `crud/order.py:create_order` has a commented-out call out to Semantic (`/inquiries`) to create the embedding and back-fill `Order.inquiry_id`. Once Semantic's matching endpoint is stable, that needs to be implemented.
- No JWT verification on any endpoint. `user_id` is trusted from the query string. Acceptable for the in-cluster hackathon build; production should validate the access token against Identity's JWKS.

## Endpoints summary (TL;DR)

```
POST   /api/v1/orders/                  create order
GET    /api/v1/orders/?user_id=...      list my orders
GET    /api/v1/orders/{id}?user_id=...  one of my orders
PATCH  /api/v1/orders/{id}?user_id=...  edit my order
DELETE /api/v1/orders/{id}?user_id=...  delete my order
POST   /api/v1/matches/                 bulk-create matches (called by Semantic)
GET    /api/v1/matches/?user_id=...     list my matches (insider view)
POST   /api/v1/insights/?user_id=...    create insight (insider)
GET    /api/v1/insights/?orderId=...    list insights for my order
GET    /api/v1/insights/{id}?user_id=.. one of my insights
PATCH  /api/v1/insights/{id}            mark paid, attach transaction_id (called by Ledger)
GET    /health                          liveness
```

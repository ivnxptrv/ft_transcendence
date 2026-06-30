# Ledger Service

## What it is

A FastAPI microservice that owns the **financial layer** of the platform: transactions, balances, and purchases. It is the authoritative record of value moving between users and the only service that holds monetary data.

## Why it exists

The system is split into small services by domain:

- **Identity** owns users and sessions.
- **Interaction** owns orders, matches, and insights.
- **Semantic** owns embeddings and insider-to-order matching.
- **Ledger** (this service) owns everything related to money.

Keeping financial data in its own service isolates the audit trail, prevents accidental coupling between user actions and payment logic, and makes it possible to add compliance or billing features without touching the rest of the stack.

## What it does (today)

Exposes a REST API for:

- **Transactions** — create a debit or credit, list history per user.
- **Balances** — read the net balance for a user (computed on-the-fly as `SUM(amount)` of all their transactions).
- **Purchases** — the core business flow: debit a client to pay an insider for an insight. This involves checking the balance, reserving the insight in Interaction, creating paired debit/credit transactions, and finalising the payment.

## Tech stack

- **Python 3.12** (runtime), **3.11** (local devenv)
- **FastAPI** with async route handlers
- **SQLAlchemy 2.0** (async, `asyncpg` driver)
- **Alembic** for schema migrations
- **Pydantic v2** for request/response schemas
- **uvicorn** (4 workers in production)
- **httpx** (AsyncClient) for inter-service HTTP calls
- **PostgreSQL 16** (one DB per service, named `ledger`)

## File structure

```
services/ledger/
├── app/
│   ├── main.py                 # FastAPI app, router wiring, startup event, /health
│   ├── database.py             # Async engine, session factory, Base, INTERACTION_URL
│   ├── dependencies.py         # get_db() — unused, database.py is the canonical source
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── health.py          # GET /health
│   │           ├── transactions.py    # POST /, GET /
│   │           ├── balances.py        # GET /{user_id}
│   │           └── purchases.py       # POST /, GET /{user_id}
│   ├── crud/
│   │   ├── transaction.py     # create_transaction(), get_transactions()
│   │   ├── balance.py         # get_balance()
│   │   └── purchase.py        # create_purchase(), get_purchases_by_user()
│   ├── models/
│   │   ├── transaction.py     # Transaction ORM
│   │   └── purchase.py        # Purchase ORM
│   ├── schemas/
│   │   ├── transaction.py     # TransactionCreate / TransactionRead
│   │   ├── balance.py         # BalanceResponse
│   │   └── purchase.py        # PurchaseCreate / PurchaseRead
│   └── middlewares/
│       └── logging.py         # ProcessTimeMiddleware (not yet registered on the app)
├── migrations/
│   ├── env.py                 # Async-compatible Alembic env
│   ├── script.py.mako
│   └── versions/              # Empty — no migration files exist yet
├── alembic.ini
├── Dockerfile                 # Two-stage build (python:3.12-slim)
├── docker-compose.yml
├── entrypoint.sh              # Reads secrets, sets URLs, runs migrations, starts uvicorn
└── devenv.nix
```

## API surface

All endpoints are mounted directly in `app/main.py`.

### Health

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Returns `{"status": "healthy", "timestamp": "..."}`. |

### Transactions

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/transactions/` | Create a debit (`amount < 0`) or credit (`amount > 0`). Body: `{ user_id, amount }`. Returns `TransactionRead`. |
| `GET` | `/api/v1/transactions/` | List transactions for a user. Query: `user_id` (required), `limit` (1–100, default 20), `offset` (default 0). |

### Balances

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/balances/{user_id}` | Returns `{ user_id, balance }`. Balance is computed as `SUM(amount)` of all transactions for that user. |

### Purchases

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/purchases/` | Purchase an insight (see flow below). Body: `{ client_id, insight_id }`. Returns `PurchaseRead`. |
| `GET` | `/api/v1/purchases/{user_id}` | List purchases for a user. Query: `limit` (1–100, default 20), `offset` (0–10, default 0). |

## Database schema

Two tables in the `ledger` Postgres database. Owned and migrated solely by this service.

```
transactions
  transaction_id   int PK
  user_id          varchar(64)     indexed — the user's UUID from Identity
  amount           numeric(10,2)   positive = credit, negative = debit
  created_at       timestamptz     server-default now()

purchases
  purchase_id      int PK
  client_id        varchar(64)     indexed
  insider_id       varchar(64)     indexed
  insight_id       int             indexed — links to Interaction's insight
  amount           numeric(10,2)   the price paid
  transaction_id   int FK → transactions.transaction_id
```

**Balance is not stored** — it is calculated on-the-fly: `SELECT SUM(amount) FROM transactions WHERE user_id = :user_id`.

## Purchase flow (end-to-end)

The purchase endpoint (`POST /api/v1/purchases/`) is the most involved operation in the service. It spans multiple steps across Ledger and Interaction:

1. **Receive request** — `{ client_id, insight_id }`.
2. **Fetch insight** — `GET /api/v1/insights/{insight_id}` from Interaction to get `price` and `insider_id`.
3. **Check balance** — if `client_balance < price`, return `409 Insufficient funds`.
4. **Reserve insight** — `PATCH /api/v1/insights/{insight_id}` with `{ is_paid: true, transaction_id: null }`. If not `204`, return `409` (already purchased).
5. **Debit client** — create a `Transaction` with `amount = -price` for the client.
6. **Credit insider** — create a `Transaction` with `amount = +price` for the insider.
7. **Record purchase** — create a `Purchase` linking client, insider, insight, amount, and the debit `transaction_id`.
8. **Commit** — `db.commit()`.
9. **Finalize** — `PATCH /api/v1/insights/{insight_id}` with `{ is_paid: true, transaction_id }` to confirm.
10. **Return** `PurchaseRead`.

On failure (steps 5–9), the DB transaction is rolled back and a compensating `PATCH` resets the insight to `{ is_paid: false, transaction_id: null }`, releasing the reservation.

## How it talks to other services

| Direction | Peer | What happens |
| --- | --- | --- |
| Inbound | **Web / Identity** | Call `GET /api/v1/balances/{user_id}` and `GET /api/v1/transactions/` for wallet views. |
| Inbound | **Web** | Call `POST /api/v1/purchases/` to complete a purchase flow. |
| Outbound | **Interaction** | During a purchase: `GET /api/v1/insights/{id}` to fetch price, then `PATCH /api/v1/insights/{id}` to reserve and later finalise. |

Interaction service URL is configured via the `INTERACTION_URL` environment variable (default: `http://localhost:4013`).

## Running locally

```bash
# In the Nix devenv shell
devenv up                  # starts Postgres on :5433 and runs alembic + uvicorn on :4012

# Or manually
uvicorn app.main:app --reload --port 4012
```

`DATABASE_URL` is set automatically by `devenv.nix` and points at the local Postgres on port 5433.

## Known issues / TODOs

- **No migration files exist** — `migrations/versions/` is empty. Schema creation currently relies on `Base.metadata.create_all` in the startup event. Alembic migrations should be added for production.
- **Unused `api_router`** — `app/api/v1/api.py` is dead code; `main.py` includes endpoint routers directly.
- **No authentication** — no JWT or API-key verification. The caller provides `user_id` directly. Acceptable for the in-cluster build; production should validate tokens against Identity's JWKS.
- **No idempotency** — duplicate purchase requests could create duplicate transactions. A `request_id` field on purchases would prevent this.
- **`ProcessTimeMiddleware`** is defined but not registered on the app (`main.py` does not import or add it).
- **`dependencies.py` vs `database.py`** — both define `get_db()`; only `database.py`'s is actually used. The file should be removed.
- **Offset cap** — `GET /purchases/{user_id}` limits `offset` to `≤ 10`, which is very restrictive.
- **Typo** — `app/crud/purchase.py` comment says "puplic API" instead of "public".

## Endpoints summary (TL;DR)

```
GET    /health                                    liveness
GET    /api/v1/balances/{user_id}                 read balance
POST   /api/v1/transactions/                      create debit/credit
GET    /api/v1/transactions/?user_id=...          list transactions
POST   /api/v1/purchases/                         buy an insight
GET    /api/v1/purchases/{user_id}                list purchases
```

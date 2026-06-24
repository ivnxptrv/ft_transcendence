*This project has been created as part of the 42 curriculum by ipetrov, vvoronts, mmaksimo, jichompo, juhtoo-h.*

# Vekko — A Marketplace for Expertise

## Description
(A “Description” section that clearly presents the project, including its goal and a
brief overview. The “Description” section should also contain a clear name for the project and its key features.)

**Vekko** is a web marketplace that connects clients who have questions with insiders who have answers. The platform matches each order to the insiders best suited to answer it. The client browses the surfaced insights and unlocks the ones they want; the insider is paid on unlock.

Key features:

- **Client role** post *orders* — a question or problem they need help with.
- **Insider role** publish a *legend* — a profile of what they know — and answer matched orders with priced *insights*.
- **Orders** — clients post questions
- **Insights** — priced expert answers, unlocked by the client
- **Matches** — client orders matched to relevant insiders
- **Wallet** — in-app balance and payments

## Instructions 
(An “Instructions” section containing any relevant information about compilation,
installation, and/or execution, The “Instructions” section should mention all the needed prerequisites (software, tools, versions, configuration like .env setup, etc.), and step-by-step instructions to run the project.)
> **Note:** UPDATE AFTER SWITCH TO PROD DEV.

Prerequisites: **Nix** with flakes enabled (the `Makefile` installs Nix on first run if missing). Linux / macOS / WSL2. No system PostgreSQL needed — `devenv` provisions PostgreSQL 16 locally.

1. Configure environment — set the service host/port map and the web app's Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`) in the `.env` files.
2. `make develop` — enter the Nix development shell.
3. `devenv up` — boot PostgreSQL, run Alembic migrations, and start all four services + the web app.
4. Open `http://localhost:4009` in Chrome. Public API docs (Swagger): `http://localhost:4009/docs`.

## Technical Overview

- **backend** (:4009) — fronend + backend, entrypoint to all other microservices
- **identity** (:4010) — auth authority: RS256 JWT issue/verify (JWKS), refresh rotation/revocation, Google OAuth, TOTP 2FA, API keys, and the public API gateway proxying to interaction & ledger.
- **interaction** (:4013) — marketplace core: orders, matches, insights
- **semantic** (:4012) — embeds legends & orders, scores by cosine similarity, posts the top match back to interaction.
- **ledger** (:4011) — balances, transactions, purchases; marks an insight paid on unlock.

### Technical Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 16 (App Router, React 19, Server Actions) + TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Backend | FastAPI (Python 3.11) — one app per service |
| Database | PostgreSQL 16 (one database per service) |
| ORM / migrations | SQLAlchemy 2 (async, asyncpg) + Alembic |
| AI / matching | sentence-transformers (`BAAI/bge-m3`) + PyTorch (CPU) |
| Auth | RS256 JWT (access + refresh), bcrypt, pyotp (TOTP), Google OAuth 2.0 |
| Tooling | Nix + devenv, Make |

**Justification**

- **Next.js + FastAPI** — App Router gives SSR and a server-action data layer, so the browser never touches internal services; FastAPI gives async, typed services with first-class OpenAPI.
- **PostgreSQL + SQLAlchemy/Alembic** — relational data fits the domain (users, orders, matches, insights, transactions); per-service databases keep services decoupled; Alembic gives reproducible schemas.
- **`bge-m3` + cosine similarity** — open-source dense embeddings give language-agnostic semantic matching without an external API.
- **Nix + devenv** — one command provisions Postgres, migrations, and all five processes reproducibly.

### Database Schema

PostgreSQL 16, one database per service. Cross-service references use the user's stable `sub` (UUID), never an internal primary key.

**identity**

| Table | Key columns |
| :--- | :--- |
| `users` | `sub` (UUID, unique), `email` (unique), `password` (bcrypt, nullable), `role`, `google_id`, `twofa_secret`, `recovery_codes_hashed` |
| `tokens` | `jti` (unique), `user_id`→users, `expires_at`, `revoked_at`, `rotated_at` |
| `api_keys` | `id` (UUID), `owner_sub`, `key_hash` (SHA-256), `prefix`, `revoked_at` |

**interaction**

| Table | Key columns |
| :--- | :--- |
| `orders` | `client_id`, `title`, `text`, `status`, `inquiry_id` |
| `matches` | `order_id`→orders, `insider_id`, `score`, `score_id` |
| `insights` | `order_id`, `match_id`→matches, `insider_id`, `legend`, `text`, `price`, `is_paid`, `transaction_id` |
| `idempotency_keys` | `key` (PK), `method`, `path`, `status_code`, `response_body` |

**semantic**

| Table | Key columns |
| :--- | :--- |
| `souls` | `insider_id` (unique), `text`, `soul` (embedding), `credibility_score` |
| `inquiries` | `client_id`, `order_id`, `text`, `query` (embedding) |
| `scores` | `soul_id`→souls, `inquiry_id`→inquiries, `score_value` |

**ledger**

| Table | Key columns |
| :--- | :--- |
| `transactions` | `transaction_id` (PK), `user_id`, `amount`, `created_at` |
| `purchases` | `client_id`, `insider_id`, `insight_id`, `amount`, `transaction_id`→transactions |

**Cross-service links** — `orders.inquiry_id`↔`semantic.inquiries`, `matches.score_id`↔`semantic.scores`, `insights.transaction_id`↔`ledger.transactions`, `purchases.insight_id`↔`interaction.insights`. Users are referenced everywhere by `sub`.

## Contributors

### Team Information

| Member | Role | Responsibilities |
| :--- | :--- | :--- |
| ipetrov | Product Owner + Architect | Owns product vision and DevOps; designed the microservices architecture and infrastructure. |
| vvoronts | Project Manager + Tech Lead + Developer | Team coordination, task assignment, deadlines; identity service and backend; business-logic design decisions. |
| mmaksimo | Developer | Backend, interaction and ledger services. |
| jichompo | Developer | Semantic service. |
| juhtoo-h | Developer | Ledger service. |

### Project Management

- **Communication:** Discord — updates and coordination.
- **Task management:** Notion — backlog, task board, meeting logs, project dashboard.
- **Version control:** GitHub — per-member branches → central *dev* branch -> final *main* branch.
- **Work split** Mainly by service + DevOps

### Individual Contributions

**ipetrov — Product Owner + Architect**
- Defined the product concept and the four-service architecture.
- Built the Nix/devenv orchestration: per-service PostgreSQL, migrations, readiness ordering, single-command boot.
- Cross-service wiring and environment/secrets management.
- *Challenge:* coordinating microservices under one reproducible dev environment.

**vvoronts — Project Manager + Tech Lead + Developer**
- Identity service: progressive-OTP login, 2FA UX, API-key management, public-API client integration.
- Backend: auth on backend side, typed error-handling layer, part of UI.
- Team coordination, task assignment, deadlines; business-logic design decisions.
- *Challenge: auth design and team coordination*.

**mmaksimo — Developer**
- Backend: app UI, language support.
- Interaction service: orders, matches, insights, and the status model across both roles.
- Ledger service: .
- *Challenge:* keeping order/match/insight statuses consistent end-to-end across services.

**jichompo — Developer**
- Semantic service: `bge-m3` embeddings, cosine-similarity scoring, souls/inquiries lifecycle, top-match notification to interaction.
- *Challenge:* embedding-model cold-start latency and keeping scoring off the request hot path.

**juhtoo-h — Developer**
- Ledger service: balances, transactions, purchases.
- *Challenge:* deriving correct running balances from the transaction log.

## Features List

**Authentication & accounts** (vvoronts)
- Email/password signup & login, bcrypt-hashed; RS256 JWT access + refresh with rotation/revocation.
- 2FA (TOTP): QR enrolment, verification, disable, single-use recovery codes.
- Google OAuth 2.0 with post-OAuth role onboarding.

**Marketplace** (mmaksimo, vvoronts)
- Orders: create / list / detail, validated forms, status tracking.
- Legend: set-once insider expertise profile.
- Insights: insiders submit priced answers; clients unlock to reveal.

**Semantic matching** (jichompo)
- Embeds legends and orders; cosine-similarity ranking; posts top match to interaction.

**Wallet / ledger** (juhtoo-h, mmaksimo)
- Balance, transaction history, paid unlocks, top-up / withdraw.

**Public API & developer tools** (vvoronts)
- X-API-Key auth, rate limiting, OpenAPI/Swagger docs; create/revoke keys in settings.

**Accessibility & internationalization** (vvoronts, mmaksimo)
- i18n with in-UI language switcher and 3+ translations; right-to-left (RTL) layout support with seamless LTR↔RTL switching.

**Infrastructure** (ipetrov)
- Four microservices, per-service PostgreSQL, single-command Nix/devenv boot.

## Modules

**Total: 15 points** (14 required to pass).

| Pts | Type | Owner | Module |
| :--- | :--- | :--- | :--- |
| 1 | Minor | mmaksimo | Web — Frontend framework (React) |
| 1 | Minor | mmaksimo | Web — Backend framework (Next.js + FastAPI) |
| 1 | Minor | ipetrov | Web — ORM (SQLAlchemy) |
| 1 | Minor | vvoronts | User Management — Google OAuth 2.0 (identity) |
| 1 | Minor | vvoronts | User Management — 2FA (identity) |
| 2 | Major | vvoronts | Web — Public API (OpenAPI, identity) |
| 1 | Minor | mmaksimo | Accessibility — Multiple languages (i18n) |
| 1 | Minor | mmaksimo | Accessibility — Right-to-left (RTL) |
| 1 | Minor | mmaksimo | Accessibility — Browser compatibility (Chrome, Firefox) |
| 2 | Major | ipetrov | DevOps — Log management (Elasticsearch) |
| 2 | Major | ipetrov | DevOps — Monitoring (Prometheus + Grafana) |
| 2 | Major | ipetrov | DevOps — Backend as microservices |
| 2 | Major | jichompo | AI — Recommendation system (semantic matching) |
| 2 | Major | vvoronts | User Management — Permissions / roles |
| **20** | | | **Total** |

### Justification and implementation

- **Web — Frontend framework (Minor)** — React (Next.js App Router) single-page UI.
- **Web — Backend framework (Minor)** — FastAPI backend services behind the Next.js BFF.
- **Web — ORM (Minor)** — SQLAlchemy 2 async across all services, migrated with Alembic.
- **Web — Public API (Major)** — identity gateway: X-API-Key auth, fixed-window rate limiting (60/60s), OpenAPI/Swagger, 5 endpoints proxying to interaction & ledger.
- **User — Google OAuth 2.0 (Minor)** — browser OAuth via the web BFF + identity.
- **User — 2FA (Minor)** — TOTP enrol/verify/disable with hashed single-use recovery codes.
- **User — Permissions / roles (Major)** — client and insider roles enforced across the app and the public API; every resource scoped to its owner.
- **Accessibility — Multiple languages (Minor)** — i18n system with an in-UI language switcher and at least three complete translations.
- **Accessibility — RTL (Minor)** — at least one right-to-left language (Arabic/Hebrew) with RTL-specific layout adjustments and seamless LTR↔RTL switching.
- **Accessibility — Browser compatibility (Minor)** — verified across Chrome and Firefox.
- **DevOps — Log management (Major)** — centralized logging with Elasticsearch (ELK) for ingestion and search across services.
- **DevOps — Monitoring (Major)** — Prometheus metrics scraped from each service, visualized in Grafana dashboards.
- **DevOps — Microservices (Major)** — four loosely-coupled FastAPI services, REST over httpx, single responsibility each.
- **AI — Recommendation system (Major)** — content-based matching: `bge-m3` embeddings + cosine-similarity ranking of insiders to orders.

## Resources
A “Resources” section listing classic references related to the topic (documen-
tation, articles, tutorials, etc.), as well as a description of how AI was used —
specifying for which tasks and which parts of the project.

### Documentation used

- [Next.js](https://nextjs.org/docs) · [React](https://react.dev) · [Tailwind CSS](https://tailwindcss.com/docs)
- [FastAPI](https://fastapi.tiangolo.com/) · [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/) · [Alembic](https://alembic.sqlalchemy.org/)
- [sentence-transformers](https://www.sbert.net/) · [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [RFC 6749 — OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) · [RFC 6238 — TOTP](https://datatracker.ietf.org/doc/html/rfc6238) · [RFC 7519 — JWT](https://datatracker.ietf.org/doc/html/rfc7519)
- [devenv](https://devenv.sh/) · [Nix flakes](https://nixos.wiki/wiki/Flakes)

### Use of AI

AI tooling (Claude Code) supported development; all output was reviewed and owned by the integrating member.

- **Code assistance** — scaffolding UI components and data flows, refactoring, and filling in boilerplate.
- **Debugging** — reproducing issues, reading stack traces, and narrowing down root causes.
- **Security review** — reviewing auth and data-handling code for common weaknesses and suggesting hardening.
- **Design & architecture** — discussing app structure, service boundaries, and trade-offs between approaches.
- **Documentation** — drafting and structuring this README and developer notes.
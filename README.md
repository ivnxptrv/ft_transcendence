*This project has been created as part of the 42 curriculum by ipetrov, vvoronts, mmaksimo, jichompo, juhtoo-h.*

# Vekko — A Marketplace for Expertise

## Description
(A “Description” section that clearly presents the project, including its goal and a
brief overview. The “Description” section should also contain a clear name for the project and its key features.)

**Vekko** is a web marketplace that connects clients who have questions with insiders who have answers. The platform provides dashboard for client and insider, matches each order to the best suited insider, 

Key features:

- **Client dashboard** — to create orders and purchase insights
- **Insider dashboard** — to fill legend and manage matches
- **Admin panel** — role-based user management, add/edit/delete user profile
- **Matching** — ai based math to rank each insider via score for each order 
- **Wallet** — in-app balance and payments
- **Expert tools** — puplic api

## Instructions 
(An “Instructions” section containing any relevant information about compilation,
installation, and/or execution, The “Instructions” section should mention all the needed prerequisites (software, tools, versions, configuration like .env setup, etc.), and step-by-step instructions to run the project.)
> **Note:** UPDATE AFTER SWITCH TO PROD DEV.


``` bash
git clone https://github.com/ivnxptrv/ft_transcendence.git && cd ./ft_transcendence
```

``` bash
make develop 
```

Open `http://localhost:4009` in Chrome. Public API docs (Swagger): `http://localhost:4009/docs`.

> **Admin console:** a bootstrap admin is seeded on first boot from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (dev defaults: `admin@vekko.local` / `admin12345`). Sign in with those at the normal login — you're routed to `/admin`.

## Technical Overview

nginx 443 -> backend (:4009) -> all other microservices, backend is gateway

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
| Tooling | Nix + devenv, Make | Nix for development

**Justification**

- **Next.js + FastAPI** — App Router gives SSR and a server-action data layer, so the browser never touches internal services; FastAPI gives async, typed services with first-class OpenAPI.
- **PostgreSQL + SQLAlchemy/Alembic** — relational data fits the domain (users, orders, matches, insights, transactions); per-service databases keep services decoupled; Alembic gives reproducible schemas.
- **`bge-m3` + cosine similarity** — open-source dense embeddings give language-agnostic semantic matching without an external API.

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

## Contribution

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

## Features List

**Authentication & accounts** (vvoronts)
- Email/password signup & login, bcrypt-hashed; RS256 JWT access + refresh with rotation/revocation.
- 2FA (TOTP): QR enrolment, verification, disable, single-use recovery codes.
- Google OAuth 2.0 with post-OAuth role onboarding.

**Marketplace** (mmaksimo, vvoronts)
- Orders: create / list / detail, validated forms, status tracking.
- Legend: set-once insider expertise profile.
- Insights: insiders submit priced answers; clients unlock to reveal.

**Admin & permissions** (vvoronts)
- Role-based access (client / insider / admin) enforced server-side on the signed JWT claim.
- Admin panel: view, edit (email / name), and delete any user.

**Semantic matching** (jichompo)
- Embeds legends and orders; cosine-similarity ranking; posts top match to interaction.

**Wallet / ledger** (juhtoo-h, mmaksimo)
- Balance, transaction history, paid unlocks, top-up / withdraw.

**Public API & developer tools** (vvoronts)
- X-API-Key auth, rate limiting, OpenAPI/Swagger docs; create/revoke keys in settings.

**Accessibility & internationalization** (mmaksimo)
- i18n with in-UI language switcher and 3+ translations.
- Cross-browser compatibility verified across Chrome, Firefox, and Edge.

**Infrastructure** (ipetrov)
- Four microservices, per-service PostgreSQl

## Modules

**Total: 21 points** (14 required)

| Category | Pts | Type | Owner | Module |
| :--- | :--- | :--- | :--- | :--- |
| Web | 1 | Minor | mmaksimo | Use a frontend framework (React) |
| Web | 1 | Minor | mmaksimo | Use a backend framework (Next.js + FastAPI) |
| Web | 1 | Minor | ipetrov | Use an ORM for the database (SQLAlchemy) |
| Web | 2 | Major | vvoronts | A public API to interact with the database (OpenAPI, identity) |
| Web | 1 | Minor | mmaksimo / vvoronts | Server-Side Rendering (SSR) |
| Web | 1 | Minor | vvoronts | Advanced search with filters, sorting, pagination |
| User Management | 1 | Minor | vvoronts | Remote authentication with OAuth 2.0 (Google) |
| User Management | 1 | Minor | vvoronts | Complete 2FA system |
| User Management | 2 | Major | vvoronts | Advanced permissions system (roles) |
| Accessibility | 1 | Minor | mmaksimo | Support for multiple languages (i18n) |
| Accessibility | 1 | Minor | mmaksimo | Support for additional browsers (Chrome, Firefox, Edge) |
| Devops | 2 | Major | ipetrov | Log management using ELK (Elasticsearch) |
| Devops | 2 | Major | ipetrov | Monitoring with Prometheus + Grafana |
| Devops | 2 | Major | ipetrov | Backend as microservices |
| Modules of choice | 2 | Major | jichompo | Custom AI matching module in semantic service |
| **Total** | **21** | | | |

### Justification and implementation

**Web**

- **Use a frontend framework** (Minor) — React via the Next.js App Router; single-page UI built with React 19 and Server Actions.
- **Use a backend framework** (Minor) — FastAPI services behind the Next.js BFF; async, typed, and OpenAPI-native.
- **Use an ORM for the database** (Minor) — SQLAlchemy 2 (async) across all services, migrated with Alembic.
- **A public API to interact with the database** (Major) — identity gateway with X-API-Key auth, fixed-window rate limiting (60/60s), OpenAPI/Swagger docs, and 5 endpoints (GET/POST/PUT/DELETE) proxying to interaction & ledger.
- **Server-Side Rendering (SSR)** (Minor) — pages are async Server Components that fetch data on the server and stream complete HTML to the browser; no client-side fetch waterfall and fast first paint. SSR also keeps internal services hidden — the browser only ever sees rendered HTML, never the microservice APIs.
- **Advanced search** (Minor) — the orders and matches lists each support filtering, sorting, pagination, and case-insensitive text search, with all state held in URL query params (SSR-friendly and shareable). Orders filter by status + date range, sort by date, and search title/text; matches filter by status + match-score range, sort by score, and search the order text. Params flow page (`searchParams`) → server action → interaction API → SQLAlchemy, where filter/sort/search compose into a single `WHERE` shared by both the page query and the `X-Total-Count` total so the pager stays accurate. Text search uses Postgres `ILIKE` (parameterized); filter/sort/search are independent toolbar toggles.

**User Management**

- **Implement remote authentication with OAuth 2.0** (Minor) — Google OAuth 2.0 via the web BFF + identity, with post-OAuth role onboarding.
- **Implement a complete 2FA system** (Minor) — TOTP enrol/verify/disable with hashed single-use recovery codes.
- **Advanced permissions system** (Major) — role-gated access (client / insider / admin) enforced server-side on the signed JWT claim; an admin console to view, edit (email / name), and delete any user, plus per-resource owner scoping across the app and public API.

**Accessibility and Internationalization**

- **Support for multiple languages** (Minor) — i18n system with an in-UI language switcher and at least three complete translations; all user-facing text is translatable.
- **Support for additional browsers** (Minor) — full compatibility verified across Chrome plus two additional browsers, Firefox and Edge.

**Devops**

- **Infrastructure for log management using ELK** (Major) — centralized logging with Elasticsearch (ELK) for ingestion and search across services.
- **Monitoring system with Prometheus and Grafana** (Major) — Prometheus metrics scraped from each service, visualized in Grafana dashboards.
- **Backend as microservices** (Major) — four loosely-coupled FastAPI services communicating over REST (httpx), each with a single responsibility.

**Modules of choice**

- **Custom AI matching module in semantic service** (Major) — <why this custom module was chosen, what technical challenge it addresses, how it adds value, and why it deserves Major status: bge-m3 embeddings + cosine-similarity scoring engine that ranks insiders against orders, with the souls/inquiries/scores lifecycle and top-match notification to interaction>.

### Individual Contributions

Scopes of contribution: PO, Management, Design, Docs, DevOps, backend, identity, interaction, semantic, ledger service
 
(Detailed breakdown of what each team member contributed.
◦Specific features, modules, or components implemented by each person.
◦Any challenges faced and how they were overcome.)

**👤 ipetrov — Product Owner + Architect**

*PO*
- Defined the Vekko concept and key features.
- Designed bussiness idea and provided uml-diagrams of product

*Architect*
- Defined the microservise architecture.
- Defined technical stack

*DevOps*
- Set up Nix/devenv for the development infrastructure.
- Built Docker containers and HTTPS-only nginx proxy for production.
- Configured the ELK for centralized logs.
- Configured Prometheus + Grafana with `postgres_exporter` and alerting.
- Automated Alembic migrations on startup.
- Managed environment variables and secrets across services.

*Challenge*
- Coordinating microservices under one reproducible dev environment.

**👤 vvoronts — Project Manager + Tech Lead + Developer**

*identity service*
- Implemented RS256 JWT issue/verify with refresh rotation/revocation.
- Built progressive-OTP login.
- Built TOTP 2FA enrol/verify/disable.
- Integrated Google OAuth with post-auth role onboarding.
- Built API-key management.
- Added the admin role and per-role guards on the public API.
- Built the public API gateway (X-API-Key auth, rate limiting, OpenAPI/Swagger) proxying to interaction & ledger.

*backend service*
- Integrated auth on the backend side.
- Built the centralized typed error-handling architecture.
- Built the admin panel and admin-table UI.
- Built the user settings tab, expert tools, password form.
- Contributed in UI

*Management*
- Coordinated the team in Discord and during meetings.
- Assigned tasks and tracked deadlines in Notion.
- Made business-logic design decisions.

*Tech Lead*
- Overseed technical decisions

*Challenge*
- Auth design and team coordination.

**👤 mmaksimo — Developer**

*interaction*
- Built the orders, matches, and insights endpoints.
- Added the insight-read and ledger-update endpoint.
- Implemented the order-completion status flow across interaction & semantic.

*ledger*
- Implemented `GET /transactions` and `/purchases` with pagination.
- Fixed `transaction_id` persistence and insufficient-funds handling.
- Implemented withdrawal sign handling in the wallet.

*backend*
- Build core app UI
- Wired server actions to backend schemas and removed mock data.
- Built the wallet modal, bonus-claim, and order-validation UI.
- Implemented i18n (3+ languages) with a language switcher.
- Added cross-browser compatibility.

*Challenge*
-!TODO

**👤 jichompo — Developer**

*semantic*
- Built the souls / inquiries / scores tables and schema.
- Integrated sentence-transformer (`bge-m3`) embeddings for souls and inquiries.
- Implemented two-way cosine-similarity score calculation.
- Added a background task to score on inquiry receipt.
- Connected semantic match posting to interaction.

*ledger*
- Implemented withdrawal and topup in wallet.

*Challenge*
- !TODO

**👤 juhtoo-h — Developer**

*ledger*
- Built the ledger service (balances, transactions, purchases).
- Implemented the `create_purchase` flow.
- Added the `GET /health` endpoint.
- Aligned the schema with the Hoppscotch API contract.

*Docs*
- Authored the Privacy Policy and Terms of Service pages.
- Contributed in README.md

*Challenge*
- Deriving correct running balances from the transaction log.

## Resources

### Documentation used

- [Next.js](https://nextjs.org/docs) · [React](https://react.dev) · [Tailwind CSS](https://tailwindcss.com/docs)
- [FastAPI](https://fastapi.tiangolo.com/) · [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/) · [Alembic](https://alembic.sqlalchemy.org/)
- [sentence-transformers](https://www.sbert.net/) · [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [RFC 6749 — OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) · [RFC 6238 — TOTP](https://datatracker.ietf.org/doc/html/rfc6238) · [RFC 7519 — JWT](https://datatracker.ietf.org/doc/html/rfc7519)
- [devenv](https://devenv.sh/) · [Nix flakes](https://nixos.wiki/wiki/Flakes)

### Use of AI

- **Code assistance** — scaffolding UI components and data flows, refactoring, and filling in boilerplate.
- **Debugging** — reproducing issues, reading stack traces, and narrowing down root causes.
- **Security review** — reviewing auth and data-handling code for common weaknesses and suggesting hardening.
- **Design & architecture** — discussing app structure, service boundaries, and trade-offs between approaches.
- **Documentation** — drafting and structuring this README and developer notes.
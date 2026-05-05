# Identity Service — Initial Implementation Plan (FastAPI)

Scope of the **initial** version: §1 Registration, §2 Login (password only, no 2FA branch yet), §3 Token issuance + rotation + revocation, §4 public-key export for Backend verification.
Deferred to follow-ups: §5 Google OAuth, §6 2FA enrollment/verification, §7 api-key issuance. Their folders/stubs are created now so later PRs only fill files in.
  - Inputs: email/password for registration & login; refresh token for rotate/logout.
  - Outputs: user record on register; signed RS256 token pair on login/refresh; public JWKS for
  verifiers; 204/4xx/501 otherwise.
---

## Folder & file tree

```
identity/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, router mounting, CORS off (gateway handles), /healthz;
│   │                            # lifespan: fail-fast RuntimeError if RSA key files missing
│   ├── config.py                # pydantic-settings: DB URL, key paths, token TTLs, ISS/AUD
│   ├── database.py              # SQLAlchemy engine + SessionLocal + Base
│   │
│   ├── models/                  # ORM — mirrors design's `users` + `tokens`
│   │   ├── __init__.py
│   │   ├── user.py              # User: id, sub, first_name, last_name, email, password,
│   │   │                        #       google_id (nullable, initial=NULL), twofa_secret (nullable)
│   │   │                        # NOTE: Python attr = twofa_secret; DB column also twofa_secret
│   │   │                        # (design doc's "2fa_secret" is not a valid Python identifier)
│   │   └── token.py             # Token: id, user_id, jti, expires_at, revoked_at;
│   │                            # Index(unique jti), Index(user_id, revoked_at) — see Concurrency section
│   │
│   ├── schemas/                 # Pydantic I/O contracts (validation layer per §Security checklist)
│   │   ├── __init__.py
│   │   ├── user.py              # UserCreate, UserRead, UserLogin (email + password policy)
│   │   └── token.py             # TokenPair, RefreshIn, AccessClaims
│   │
│   ├── core/                    # Security primitives — no DB, no HTTP
│   │   ├── __init__.py
│   │   ├── hashing.py           # bcrypt hash/verify, cost ≥ 12 ................ §1, §2
│   │   ├── jwt.py               # RS256 sign/verify, load PEM keys, JWKS export  §3, §4
│   │   └── validation.py        # email regex, password policy (len, classes)   §Security checklist
│   │
│   ├── services/                # Business logic, orchestrates core + models
│   │   ├── __init__.py
│   │   ├── user_service.py      # register_user(), get_by_email()                §1
│   │   └── token_service.py     # issue_pair(), rotate_refresh(), revoke(),
│   │                            # cleanup_expired(db, user_id) — called lazily in issue_pair()
│   │                            # Known limitation: tokens of never-returning users accumulate  §2, §3
│   │
│   ├── api/                     # HTTP layer only — thin, delegates to services
│   │   ├── __init__.py
│   │   ├── deps.py              # get_db() yields request-scoped Session in try/finally;
│   │   │                        # get_current_user() decodes access token            §4
│   │   ├── users.py             # POST /users (register)                          §1
│   │   ├── tokens.py            # POST /tokens (login + 2FA guard stub → 501),
│   │   │                        # POST /tokens/refresh, DELETE /tokens (logout)   §2, §3
│   │   ├── keys.py              # GET /.well-known/jwks.json (public key)          §4
│   │   └── health.py            # GET /healthz (liveness, no auth)
│   │
│   └── db/
│       └── migrations/          # Alembic — schema owned by Identity
│           ├── env.py
│           └── versions/
│               └── 0001_init.py # users + tokens tables
│
├── keys/                        # RS256 keypair (gitignored; generated via openssl — see Build & run)
│   ├── private.pem              # Identity only
│   └── public.pem               # Shipped to Backend for verification
│
├── tests/
│   ├── conftest.py              # test DB, client fixture, key fixture
│   ├── test_register.py         # §1 happy + duplicate email + weak password
│   ├── test_login.py            # §2 happy + wrong password + unknown email
│   └── test_tokens.py           # §3 rotation + revocation + expired access
│
├── .env.example                 # DB_URL, JWT_PRIVATE_KEY_PATH, JWT_PUBLIC_KEY_PATH,
│                                # ACCESS_TTL_MIN=15, REFRESH_TTL_DAYS=14, ISS, AUD
├── .gitignore                   # keys/*.pem, .env, __pycache__, .venv
├── alembic.ini
├── Dockerfile                   # python:3.12-slim, uvicorn, non-root user
├── pyproject.toml               # fastapi, uvicorn, sqlalchemy, alembic, psycopg2,
│                                # pyjwt[crypto], bcrypt, pydantic-settings
└── README.md
```

---

## How the pieces wire together

**Request → response path** for `POST /tokens` (login, auth.md §2 + §3):

```
client → Gateway (TLS + rate-limit)
       → Backend (Next.js, /auth route)
       → Identity /tokens
           api/tokens.py            # parses UserLogin schema
             → services/token_service.issue_pair(email, password)
                 → user_service.get_by_email()          # models/user.py
                 → core/hashing.verify()                # §2 bcrypt.compare
                 → core/jwt.sign_access() / sign_refresh()  # §3 RS256
                 → models/token.py insert row (jti, exp) # §3 revocable refresh
             → returns TokenPair (access + refresh)
```

**Verification path** (auth.md §4) lives in **Backend**, not Identity. Identity only exposes the public key at `GET /.well-known/jwks.json` (`api/keys.py`); Backend caches it and verifies every inbound JWT itself. This keeps Identity off the hot path.

---

## Layer responsibilities

| Layer | Owns | Does NOT do |
|---|---|---|
| `api/` | HTTP parsing, status codes, dep injection | Business logic, DB queries |
| `services/` | Use cases, transactions | HTTP concerns, crypto primitives |
| `core/` | Pure crypto + validation | DB, HTTP |
| `models/` | SQLAlchemy ORM | Validation (that's schemas) |
| `schemas/` | Pydantic validation at boundary | Persistence |

This separation matters because §4 (JWT verification) will be re-used by Backend — `core/jwt.py` is the only module Backend would theoretically copy or depend on via a shared library.

---

## Concurrency & session safety

Subject III.2 mandates multi-user support without data corruption / race conditions. The Identity service enforces this with three mechanisms:

**1. Request-scoped SQLAlchemy sessions.** `SessionLocal` is created per request and guaranteed closed via `try/finally` in a dependency generator. No session is shared across requests or coroutines, so concurrent logins/refreshes never leak transactional state.

```python
# app/api/deps.py
from app.database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Every route declares `db: Session = Depends(get_db)` — FastAPI tears the session down even if the handler raises.

**2. Token table indexes.** Refresh-token lookups and revocation checks happen on every `/tokens/refresh` call; without indexes this is a full table scan under load.

```python
# app/models/token.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from app.database import Base

class Token(Base):
    __tablename__ = "tokens"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    jti        = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_tokens_jti_unique", "jti", unique=True),
        Index("ix_tokens_user_revoked", "user_id", "revoked_at"),
    )
```

The unique index on `jti` also enforces per-token identity at the DB level — a second insert with the same `jti` fails atomically instead of racing.

**Cleanup is lazy-only.** `token_service.cleanup_expired()` runs inside `issue_pair()`, so expired rows are pruned only for users who log in again. Tokens belonging to users who never return remain in the table forever. Acceptable for project scope (no cron, no workers); if DB growth becomes a concern post-launch, a nightly `DELETE WHERE expires_at < now()` job is the drop-in fix.

**3. Alembic parity.** `db/migrations/versions/0001_init.py` MUST declare both indexes via `op.create_index(...)`. If the model and the migration diverge, fresh environments won't have the indexes and the race conditions reappear silently. CI runs `alembic upgrade head` + a model-vs-DB diff check.

---

## Endpoints in the initial version

| Method | Path | auth.md ref | Notes |
|---|---|---|---|
| POST | `/users` | §1 | Registration. Returns token pair on success. |
| POST | `/tokens` | §2 | Login with email + password. **2FA guard**: if `user.twofa_secret is not None`, return **HTTP 501 Not Implemented** until §6 is fully wired — prevents half-enrolled users from bypassing the challenge. |
| POST | `/tokens/refresh` | §3 | Rotate refresh; old `tokens` row marked `revoked_at`. |
| DELETE | `/tokens` | §3 | Logout → revoke current refresh. |
| GET | `/.well-known/jwks.json` | §4 | Public key for Backend verification. |
| GET | `/healthz` | — | Liveness probe for Docker/compose. |

Deferred (folders exist, routers not yet mounted in `main.py`):
- `api/oauth.py` → §5 Google OAuth callback + account-linking logic.
- `api/twofa.py` → §6 `/users/me/2fa/setup`, `/users/me/2fa/verify`.
- `api/apikeys.py` → §7 api-key issuance + hashed storage.

---

## Config & secrets (auth.md §Security checklist)

`config.py` loads from `.env` via `pydantic-settings`:
- `DATABASE_URL`
- `JWT_PRIVATE_KEY_PATH`, `JWT_PUBLIC_KEY_PATH`
- `JWT_ISSUER`, `JWT_AUDIENCE`
- `ACCESS_TTL_MIN=15`, `REFRESH_TTL_DAYS=14`
- `BCRYPT_COST=12`

Keys in `keys/` are gitignored and loaded from disk by `core/jwt.py`. **The Cybersecurity (WAF + Vault) module is NOT claimed in this service's scope** — keys stay on disk for the project's lifetime unless the team later adds that module to the 14-point plan, at which point it becomes a separate service with its own design doc.

---

## Build & run (single command per subject III.3)

**One-time bootstrap** (generate the RS256 keypair before first `docker compose up`):

```bash
mkdir -p identity/keys
openssl genrsa -out identity/keys/private.pem 2048
openssl rsa -in identity/keys/private.pem -pubout -out identity/keys/public.pem
```

Confirm `keys/*.pem` is in `.gitignore` so the private key never reaches the repo. The `main.py` lifespan hook checks both PEM files exist at startup and raises `RuntimeError` with a clear message if either is missing — uvicorn will refuse to serve rather than boot with a broken signing chain. The same check belongs in `.env.example` as a comment pointing to these commands.

**Runtime:**
- `Dockerfile` runs uvicorn on port 8000 as non-root.
- Service is added to the root `docker-compose.yml` behind Gateway.
- First boot runs `alembic upgrade head` via entrypoint so `users` + `tokens` exist before uvicorn starts.
- **Public key distribution**: Backend mounts `public.pem` read-only from the host via compose so JWT verification works on first boot. Identity mounts both keys; Backend mounts only the public one:
  ```yaml
  identity:
    volumes:
      - ./identity/keys:/app/keys:ro
  backend:
    volumes:
      - ./identity/keys/public.pem:/app/keys/public.pem:ro
  ```
  Without this mount, Backend starts but rejects every authenticated request silently — add it before the first `docker compose up`.

**HTTPS posture (subject III.3 "HTTPS everywhere"):** All external traffic is TLS-encrypted at the Gateway (nginx/traefik with a valid cert). Identity runs HTTP internally on port 8000 within the Docker network — this satisfies the subject's "HTTPS everywhere" requirement because no plaintext traffic is exposed outside the container network.

---

## What's explicitly out of this initial PR

- No Google OAuth flow (files reserved, not wired). — §5
- No TOTP enrollment or challenge branch. — §6
- No api-key table or `/api-keys` routes. — §7
- Keys read from disk permanently. The Cybersecurity (WAF + Vault) Major module is **not claimed** by this service — see "Config & secrets" above. — §Security checklist
- No friends/profile/avatar endpoints — those belong to a separate User-Management service per the design, not Identity.

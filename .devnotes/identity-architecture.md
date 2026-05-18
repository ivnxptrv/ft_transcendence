Below is the investigation report on the identity service authentication architecture. This is description, not critique.

---

## 1. Module Map

**Auth-related modules under `services/identity/app/`:**

```
app/
├── main.py                          # FastAPI app instantiation, router wiring, lifespan
├── config.py                        # Settings (env var loading)
├── database.py                      # SQLAlchemy async engine, SessionLocal, Base
├── dependencies.py                  # FastAPI DI: get_db, get_current_user
├── core/
│   ├── hashing.py                   # bcrypt password hash/verify
│   ├── jwt.py                       # RS256 JWT sign/decode, JWKS export, key loading
│   └── validation.py                # Email + password policy validators
├── models/
│   ├── user.py                      # User ORM entity
│   └── token.py                     # Token (refresh) ORM entity
├── schemas/
│   ├── user.py                      # UserCreate, UserRead, UserOut (Pydantic)
│   └── token.py                     # LoginIn, RefreshIn, TokenPair (Pydantic)
├── crud/
│   └── user.py                      # get_user_by_email, create_user
├── services/
│   ├── user_service.py              # register_user, get_by_email
│   └── token_service.py             # issue_pair, mint_for_user, rotate_refresh, revoke, cleanup_expired
├── api/v1/
│   ├── api.py                       # Router aggregator
│   └── endpoints/
│       ├── user.py                  # POST /users, GET /users/me
│       ├── tokens.py                # POST /sessions, POST /sessions/refresh, DELETE /sessions
│       ├── keys.py                  # GET /.well-known/jwks.json
│       ├── oauth.py                 # Empty stub (deferred)
│       ├── twofa.py                 # Empty stub (deferred)
│       └── apikeys.py               # Empty stub (deferred)
└── middlewares/
    └── logging.py                   # Request timing middleware
```

---

## 2. Dependency Diagram (internal modules; A → B means A imports B)

```
main.py                  → api/v1/api.py
main.py                  → api/v1/endpoints/keys.py
main.py                  → core/jwt.py
main.py                  → middlewares/logging.py

api/v1/api.py            → api/v1/endpoints/tokens.py
api/v1/api.py            → api/v1/endpoints/user.py

api/v1/endpoints/user.py    → schemas/user.py
api/v1/endpoints/user.py    → schemas/token.py
api/v1/endpoints/user.py    → services/user_service.py
api/v1/endpoints/user.py    → services/token_service.py
api/v1/endpoints/user.py    → dependencies.py
api/v1/endpoints/user.py    → models/user.py

api/v1/endpoints/tokens.py  → schemas/token.py
api/v1/endpoints/tokens.py  → services/token_service.py
api/v1/endpoints/tokens.py  → dependencies.py
api/v1/endpoints/tokens.py  → models/user.py

api/v1/endpoints/keys.py    → core/jwt.py

dependencies.py          → core/jwt.py
dependencies.py          → database.py
dependencies.py          → models/user.py

services/user_service.py → crud/user.py
services/user_service.py → core/hashing.py
services/user_service.py → core/validation.py
services/user_service.py → models/user.py
services/user_service.py → schemas/user.py

services/token_service.py → config.py
services/token_service.py → core/jwt.py
services/token_service.py → core/hashing.py
services/token_service.py → models/token.py
services/token_service.py → models/user.py
services/token_service.py → services/user_service.py

crud/user.py             → models/user.py

models/user.py           → database.py
models/token.py          → database.py

core/hashing.py          → config.py
core/jwt.py              → config.py
core/validation.py       → (none internal)
```

External libs by layer: protocol (fastapi, starlette), service (sqlalchemy, pydantic), core (jwt, cryptography, bcrypt).

---

## 3. Auth Flow Call Chains

### Registration — `POST /api/v1/users`
```
api/v1/endpoints/user.py:register_user
  → services/user_service.py:register_user
      → core/validation.py:is_valid_email
      → core/validation.py:validate_password
      → services/user_service.py:get_by_email
          → crud/user.py:get_user_by_email          # raises 409 if exists
      → core/hashing.py:hash_password
      → crud/user.py:create_user                    # db.add / commit / refresh
  → services/token_service.py:mint_for_user
      → core/jwt.py:sign_access
      → core/jwt.py:sign_refresh
      → db.add(Token(...)); db.commit()             # raw SQLAlchemy in service
  → returns schemas/token.py:TokenPair
```

### Login — `POST /api/v1/sessions`
```
api/v1/endpoints/tokens.py:login
  → services/token_service.py:issue_pair
      → services/user_service.py:get_by_email → crud/user.py:get_user_by_email
      → core/hashing.py:verify_password             # 401 on mismatch / null password
      → guard: if user.twofa_secret is not None → 501 (deferred)
      → services/token_service.py:cleanup_expired   # db.execute(delete(Token)...)
      → services/token_service.py:mint_for_user     # (chain as above)
```

### Token refresh — `POST /api/v1/sessions/refresh`
```
api/v1/endpoints/tokens.py:refresh
  → services/token_service.py:rotate_refresh
      → core/jwt.py:decode(token, expected_type="refresh")
      → db.execute(select(Token).where(jti == payload["jti"]))   # 401 if revoked/missing
      → db.execute(select(User).where(sub == payload["sub"]))    # 401 if missing
      → set existing.revoked_at = now(utc)                       # rotate
      → services/token_service.py:mint_for_user                  # new pair
```

### Logout — `DELETE /api/v1/sessions`
```
api/v1/endpoints/tokens.py:logout
  ← Depends(dependencies.py:get_current_user)
        → core/jwt.py:decode(access_token)
        → db.execute(select(User).where(sub == payload["sub"]))
  → services/token_service.py:revoke
      → core/jwt.py:decode(refresh, expected_type="refresh")
      → ownership check: payload["sub"] == current_user.sub      # 401 if not
      → db.execute(update(Token).values(revoked_at=now(utc)))
```

### Get me — `GET /api/v1/users/me`
```
api/v1/endpoints/user.py:get_me ← Depends(get_current_user)
  → returns schemas/user.py:UserOut(id=user.sub, email, role, first_name, last_name)
```

### JWKS — `GET /.well-known/jwks.json`
```
api/v1/endpoints/keys.py:jwks → core/jwt.py:public_jwks
```

**Password reset:** not present.

---

## 4. Persistence Pattern

**Hybrid: thin CRUD module + direct ORM access from services.**

- `app/crud/user.py` exposes `get_user_by_email` and `create_user` — a thin repository for `User` only.
- `app/services/user_service.py` goes through `crud/user.py`.
- `app/services/token_service.py` does **not** have a corresponding `crud/token.py`. It calls SQLAlchemy directly:
  - `token_service.py:mint_for_user` — `db.add(Token(...))`, `db.commit()`
  - `token_service.py:cleanup_expired` — `db.execute(delete(Token)...)`
  - `token_service.py:rotate_refresh` — `db.execute(select(Token)...)`, mutates `existing.revoked_at`
  - `token_service.py:revoke` — `db.execute(update(Token)...values(revoked_at=...))`
- Sessions are injected as `AsyncSession` via `dependencies.py:get_db`, then threaded through service → CRUD.

There is no formal Repository class; the closest name for the actual pattern is **"thin CRUD functions + Active-Record-style direct session access from services."** The abstraction is partial and asymmetric (User has it, Token does not).

---

## 5. Where the Concerns Live

| Concern | Location |
|---|---|
| Password hashing | `core/hashing.py:hash_password`, `verify_password` (bcrypt, cost from `config.BCRYPT_COST`) |
| Password policy | `core/validation.py:validate_password` (≥8 chars, ≥1 letter, ≥1 digit; returns list of errors) |
| Email validation | `core/validation.py:is_valid_email` (basic regex) |
| Access token generation | `core/jwt.py:sign_access` (RS256; `sub, email, role, iss, aud, iat, exp, jti, typ="access"`) |
| Refresh token generation | `core/jwt.py:sign_refresh` (RS256; returns token, jti, exp datetime) |
| Token validation/expiry | `core/jwt.py:decode(token, expected_type)` (signature, iss, aud, exp, typ) |
| RSA key loading | `core/jwt.py:_private_key`, `_public_key` (read PEMs from disk via `@lru_cache`); preflighted in `main.py` lifespan via `core/jwt.py:ensure_keys_loadable` |
| JWKS export | `core/jwt.py:public_jwks` served by `api/v1/endpoints/keys.py:jwks` |
| Refresh token storage | `models/token.py:Token` (`user_id`, `jti` unique-indexed, `expires_at`, `revoked_at`); written/read directly by `services/token_service.py` |
| Refresh rotation | `services/token_service.py:rotate_refresh` (revokes old, mints new) |
| Refresh revocation | `services/token_service.py:revoke` |
| Lazy expired-token cleanup | `services/token_service.py:cleanup_expired` (called in `issue_pair`) |
| Auth context for handlers | `dependencies.py:get_current_user` (Bearer extraction + `decode` + DB lookup by `sub`) |
| Ownership check on revoke | `services/token_service.py:revoke` compares `payload["sub"]` vs `current_user.sub` |
| Duplicate email | `services/user_service.py:register_user` (raises 409) |
| 2FA gate | `services/token_service.py:issue_pair` raises 501 if `user.twofa_secret is not None` (feature otherwise deferred) |
| Rate limiting | **Not present** |
| Audit logging | **Not present** (only `middlewares/logging.py` for request timing) |
| Password reset | **Not present** |

---

## 6. Mapping to Intended Layers

| Intended layer | Current modules |
|---|---|
| **Protocol** | `api/v1/endpoints/{user,tokens,keys}.py`, `api/v1/api.py`, `main.py`, `middlewares/logging.py` |
| **Service** | `services/user_service.py`, `services/token_service.py` |
| **Core** | `core/hashing.py`, `core/validation.py`, most of `core/jwt.py` |
| **Repository** | `crud/user.py` (User only); `models/user.py`, `models/token.py` (ORM entities) |
| **Other / infra** | `database.py` (engine, session factory), `config.py`, `dependencies.py` (DI wiring) |

**Modules that do not fit cleanly:**

- `dependencies.py:get_current_user` — straddles protocol (Authorization header parsing), core (`jwt.decode`), and repository (User lookup by `sub`). Conventional FastAPI placement, but not a single-layer concern.
- `core/jwt.py` — mostly pure, but `_private_key` / `_public_key` perform filesystem I/O. Pulls RSA keys from disk inside the "core" layer.
- `services/token_service.py` — orchestration logic mixed with direct ORM writes (no Token CRUD).
- `models/*.py` — ORM entities are imported by service, dependencies, and CRUD; standard for SQLAlchemy but not strictly "repository-only."

---

## 7. Layering Violations

1. **Core does filesystem I/O.** `core/jwt.py:_private_key` and `_public_key` call `Path(settings.JWT_*_KEY_PATH).read_text()` (cached). Core depends on disk + config rather than receiving keys from a higher layer.
2. **Service writes SQL directly.** `services/token_service.py` performs `db.add(Token(...))`, `db.execute(delete/update(Token)...)`, and direct attribute mutation of `existing.revoked_at` — no repository layer for Token. Asymmetric with User, which goes through `crud/user.py`.
3. **Service-to-service import.** `services/token_service.py` imports `services/user_service.py` and calls `get_by_email` (orchestration coupling, not a strict layer break but a horizontal dependency inside the service tier).
4. **Core imports config.** `core/hashing.py` and `core/jwt.py` both read `app.config.settings` (BCRYPT_COST, JWT_*). Core is not parameter-pure; it reaches for ambient config.
5. **Protocol-adjacent module does business work.** `dependencies.py:get_current_user` performs a DB query (`select(User).where(sub == ...)`) — a repository concern executed at the protocol boundary.

---

## 8. Concerns Spread Across Layers / Unclear

- **Token lifecycle** is split: signing in core (`core/jwt.py`), persistence/rotation/revocation in service (`services/token_service.py`) without a Token repository. The "where does Token state live" answer is two layers, not one.
- **Auth context construction** (`dependencies.py:get_current_user`) sits in DI wiring but combines transport, core, and persistence steps.
- **Key material** (`core/jwt.py`): unclear whether the design intends keys to be a core concern or infra. They are loaded inside core, but preflighted from `main.py` lifespan.
- **`config.py`** is consumed by every layer including core; it is not classified by the intended design.
- **2FA** is half-wired: a `twofa_secret` column exists on `User`, `issue_pair` has a guard that raises 501, and `endpoints/twofa.py` is an empty stub. Unclear whether the partial guard counts as "service logic" or scaffolding.
- **`oauth.py`, `apikeys.py`** — empty router stubs; no behavior to classify.

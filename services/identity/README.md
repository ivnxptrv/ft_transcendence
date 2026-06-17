add # Identity Service

Authentication and account authority for Vekko. Issues and verifies JWTs, stores
users and credentials, and exposes the project's public API as a secured,
rate-limited gateway.

## Data (PostgreSQL, SQLAlchemy async + Alembic)

- **users** — `sub` (UUID external id, placed in the JWT `sub`; the integer PK
  never leaves the service), `email` (unique), `password` (bcrypt hash; null for
  OAuth-only accounts), `role` (`client` | `insider`), `google_id` (nullable,
  unique), `twofa_secret`, `recovery_codes_hashed` (SHA-256 digests),
  `twofa_enrolled_at`, `first_name`, `last_name`.
- **tokens** — refresh-token store: `jti`, `user_id`, `expires_at`, `revoked_at`,
  `rotated_at`. Access tokens are stateless (not stored); only refresh tokens are
  persisted, for rotation and revocation.
- **api_keys** — `owner_sub`, `key_hash` (SHA-256; plaintext never stored),
  `prefix` (display only), `name`, `created_at`, `last_used_at`, `revoked_at`.

CRUD: users (create / read / set-password / delete), refresh tokens (create /
rotate / revoke), API keys (create / list / revoke).

## Endpoints

All under `/api/v1`. Internal routes are hidden from the OpenAPI schema; the
public API is the only documented surface.

### Auth & users (internal)
- `POST /users` — register; returns a token pair
- `GET /users/{user_id}` — own account only (403 otherwise)
- `PUT /users/{user_id}/password` — set a password on an OAuth-only account
- `POST /tokens` — `grant_type=password` (email, password, otp?) or `refresh_token`
- `DELETE /tokens/{jti}` — logout (revoke a refresh token)
- `POST /users/{user_id}/totp` — begin TOTP enrollment
- `POST /users/{user_id}/totp/verification` — confirm code, finalize (recovery codes, once)
- `DELETE /users/{user_id}/totp` — disable TOTP (password + code)
- `POST /oauth/google` — provision/link a Google-verified profile; returns a token pair

### API-key lifecycle (internal, user JWT)
- `POST /api-keys` — issue a key; plaintext `vk_…` returned once
- `GET /api-keys` — list own keys (metadata only)
- `DELETE /api-keys/{key_id}` — revoke

### Public API (documented; `X-API-Key`, rate-limited)
- `POST /public/orders` — create an order → interaction
- `GET /public/orders/{order_id}` — read own order → interaction
- `GET /public/account` — own account info (local)
- `DELETE /public/account` — delete own account (local)
- `GET /public/balance` — own ledger balance → ledger

### Discovery (`/.well-known`, internal)
- `GET /.well-known/jwks.json` — public keys for JWT verification
- `GET /.well-known/auth-config` — issuer, audience, refresh TTL, endpoint paths

Swagger UI at `/docs`, schema at `/api/v1/openapi.json` — both expose only the
public API.

## Functionalities

- **Public API** — secured API key, rate limiting, documentation, ≥5 endpoints.
  Identity owns `X-API-Key` auth and per-key rate limiting (429 over the window)
  and forwards each call to the resource owner (orders → interaction, balance →
  ledger, account → local). 5 endpoints; documented via OpenAPI/Swagger.
- **OAuth 2.0 remote authentication (Google).** The web BFF runs the browser flow;
  identity provisions/links the user and mints its own JWT pair.
- **2FA.** TOTP (pyotp) with one-time recovery codes, enforced inline on the
  password grant: a missing/invalid `otp` returns 401 `{"totp_required": true}`
  and the client re-POSTs the same grant with `otp` (single round-trip, no
  challenge cookie).
- **ORM.** SQLAlchemy (async) with Alembic migrations.
- **JWT auth.** RS256 access + refresh tokens; public keys published via JWKS so
  peers verify locally. Refresh rotation with a grace window (tolerates concurrent
  refreshes); logout revokes by `jti`.
- **Credential security.** Passwords hashed with bcrypt; API keys stored as
  SHA-256 digests, never in plaintext.

## Technical notes

- FastAPI · SQLAlchemy (async) · Alembic · PostgreSQL 16 · PyJWT (RS256) · bcrypt
  · pyotp · httpx (gateway forwarding).
- JWT signing keys are RSA PEM files (`keys/private.pem`, `keys/public.pem`); the
  app refuses to start if they are missing.
- Rate limit defaults to 60 requests / 60 s per key (`PUBLIC_API_RATE_LIMIT`,
  `PUBLIC_API_RATE_WINDOW_SECONDS`); active keys per user capped by
  `MAX_API_KEYS_PER_USER`.
- Peer base URLs are required env vars (`INTERACTION_URL`, `LEDGER_URL`).

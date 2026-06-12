# Endpoints

- POST   /api/v1/users                              Register (returns a token pair)
- GET    /api/v1/users/{user_id}                    User info (own account only; 403 otherwise)
- POST   /api/v1/tokens                             Create tokens — grant_type=password (email,password,otp?) or refresh_token
- DELETE /api/v1/tokens/{jti}                       Logout (revoke a refresh token by jti; bearer required)
- POST   /api/v1/users/{user_id}/totp              Begin TOTP enrollment
- POST   /api/v1/users/{user_id}/totp/verification Confirm code + finalize (returns recovery codes once)
- DELETE /api/v1/users/{user_id}/totp              Disable TOTP (password + code)
- GET    /.well-known/jwks.json                     Public keys for JWT verification
- GET    /.well-known/auth-config                   Service discovery (issuer, audience, endpoint paths)

TOTP at login is single-request: enroll/verify first, then POST /tokens with
grant_type=password; if 2FA is on and `otp` is absent or wrong, identity replies
401 `{"totp_required": true}` and the client re-POSTs the same grant with `otp`.

# Public API (Major module — secured API key, rate limiting, docs, ≥5 endpoints)

A secured gateway over the database. Identity owns the API-key + rate-limit
concern and forwards each call to the service that owns the resource
(orders → interaction, inquiries → semantic, users → local).

## API-key lifecycle (authenticated with the user JWT)

- POST   /api/v1/api-keys           Issue a key — plaintext `vk_…` returned ONCE
- GET    /api/v1/api-keys           List my keys (metadata only, no secret)
- DELETE /api/v1/api-keys/{key_id}  Revoke a key

Keys are stored as SHA-256 digests (never plaintext), scoped to the owner,
revocable, and stamped with `last_used_at`.

## Public surface (authenticated with `X-API-Key`, rate-limited → 429)

- GET    /api/v1/public/orders/{id}     → interaction  GET   /api/v1/orders/{id}
- POST   /api/v1/public/orders          → interaction  POST  /api/v1/orders/
- PUT    /api/v1/public/orders/{id}     → interaction  PATCH /api/v1/orders/{id}
- POST   /api/v1/public/inquiries       → semantic     POST  /inquiries
- DELETE /api/v1/public/users/{id}      → local (self-service: a key may only delete its own owner; 403 otherwise)

Covers GET / POST / PUT / DELETE. Auth via the `X-API-Key` header; each key is
rate-limited (default 60 req / 60 s, env `PUBLIC_API_RATE_LIMIT` /
`PUBLIC_API_RATE_WINDOW_SECONDS`). Interactive docs + the `X-API-Key` security
scheme are served at `/docs` (OpenAPI at `/api/v1/openapi.json`).


## Required peer endpoints

- interaction:  GET `/api/v1/orders/{id}`, POST `/api/v1/orders/`,
- semantic:     POST `/inquiries`  (request body `{inquiry_text, uid, order_id}`)
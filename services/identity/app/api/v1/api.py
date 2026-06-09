from fastapi import APIRouter

from app.api.v1.endpoints import apikeys, public, tokens, totp, user

api_router = APIRouter()

# --- Internal, service-to-service surface ---
# These are deliberately hidden from the OpenAPI schema (include_in_schema=False)
# so /docs and /openapi.json advertise ONLY the public API. The routes still
# work for the web BFF and peer services — they're just not documented/exposed.
api_router.include_router(
    user.router, prefix="/users", tags=["users"], include_in_schema=False
)
# OAuth 2.0 token endpoint: POST /tokens (password/refresh grants),
# DELETE /tokens/{jti} (logout).
api_router.include_router(
    tokens.router, prefix="/tokens", tags=["tokens"], include_in_schema=False
)
# TOTP lifecycle under the user's own account. The login-time code rides the
# password grant's `otp` param (see tokens.py) — no separate challenge step.
api_router.include_router(
    totp.router,
    prefix="/users/{user_id}/totp",
    tags=["users/totp"],
    include_in_schema=False,
)

# --- Public API (subject IV.1, Major) — the only documented surface ---
# JWT-bootstrapped key management + the X-API-Key-secured, rate-limited gateway.
api_router.include_router(apikeys.router, prefix="/api-keys", tags=["api-keys"])
api_router.include_router(public.router, prefix="/public", tags=["public-api"])

# Deferred router — file exists, not wired yet. See auth.md §5.
# from app.api.v1.endpoints import oauth
# api_router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])

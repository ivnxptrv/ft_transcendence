from fastapi import APIRouter

from app.api.v1.endpoints import admin, apikeys, oauth, public, tokens, totp, user

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

# --- Public API (subject IV.1, Major) ---
# The X-API-Key-secured, rate-limited gateway is the ONLY documented surface.
# Mounted under /public so its resources never collide with identity's internal
# routes that share /api/v1 (e.g. the Bearer-authed GET /users/{user_id}).
api_router.include_router(public.router, prefix="/public", tags=["public-api"])
# Key lifecycle is a dashboard concern (minted by the logged-in user via the
# web settings UI, JWT-authed), not part of the public API — so it's kept out
# of the public OpenAPI schema, like the rest of the internal surface.
api_router.include_router(
    apikeys.router, prefix="/api-keys", tags=["api-keys"], include_in_schema=False
)

# Google OAuth provisioning. Internal (include_in_schema=False): the web BFF
# runs the browser-facing flow and calls POST /oauth/google → token pair.
api_router.include_router(
    oauth.router, prefix="/oauth", tags=["oauth"], include_in_schema=False
)

# Admin user management (advanced permissions, subject IV.2). Bearer-authed with
# an admin-role token (require_admin), driven by the web admin console. Internal,
# so kept out of the public OpenAPI schema like the rest of the non-public surface.
api_router.include_router(
    admin.router, prefix="/admin", tags=["admin"], include_in_schema=False
)

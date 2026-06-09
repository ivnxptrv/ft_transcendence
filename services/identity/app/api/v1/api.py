from fastapi import APIRouter

from app.api.v1.endpoints import apikeys, public, tokens, twofa, user

api_router = APIRouter()
api_router.include_router(user.router, prefix="/users", tags=["users"])
# tokens.py implements the sessions endpoints; file kept under its old name
# to minimise rename churn — paths and tags follow the contract.
api_router.include_router(tokens.router, prefix="/sessions", tags=["sessions"])
# Enrollment + disable lives under the user's own account; the login-time
# challenge handoff lives in /sessions (see tokens.py).
api_router.include_router(twofa.router, prefix="/users/me/2fa", tags=["2fa"])

# Public API (subject IV.1, Major): JWT-bootstrapped key management +
# the X-API-Key-secured, rate-limited gateway surface.
api_router.include_router(apikeys.router, prefix="/api-keys", tags=["api-keys"])
api_router.include_router(public.router, prefix="/public", tags=["public-api"])

# Deferred router — file exists, not wired yet. See auth.md §5.
# from app.api.v1.endpoints import oauth
# api_router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])

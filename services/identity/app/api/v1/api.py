from fastapi import APIRouter

from app.api.v1.endpoints import tokens, user

api_router = APIRouter()
api_router.include_router(user.router, prefix="/users", tags=["users"])
# tokens.py implements the sessions endpoints; file kept under its old name
# to minimise rename churn — paths and tags follow the contract.
api_router.include_router(tokens.router, prefix="/sessions", tags=["sessions"])

# Deferred routers — files exist, not wired yet. See auth.md §5/§6/§7.
# from app.api.v1.endpoints import apikeys, oauth, twofa
# api_router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])
# api_router.include_router(twofa.router, prefix="/2fa", tags=["2fa"])
# api_router.include_router(apikeys.router, prefix="/api-keys", tags=["api-keys"])

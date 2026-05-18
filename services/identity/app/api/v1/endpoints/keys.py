from fastapi import APIRouter

from app.config import settings
from app.core import jwt as jwt_core

router = APIRouter()


@router.get(
    "/jwks.json",
    operation_id="getJwks",
    summary="JSON Web Key Set",
)
async def jwks():
    """Public keys used by other services to verify access tokens locally."""
    return jwt_core.public_jwks()

@router.get(
    "/auth-config",
    operation_id="getAuthConfig",
    summary="Identity service discovery: issuer, audience, refresh TTL, endpoint paths",
)
async def auth_config():
    """Single source of truth for token claims consumers must verify, the
    refresh-cookie lifetime, and the canonical endpoint paths. Other services
    fetch this at startup instead of hardcoding."""
    return {
        "issuer": settings.JWT_ISSUER,
        "audience": settings.JWT_AUDIENCE,
        "refresh_ttl_seconds": settings.REFRESH_TTL_DAYS * 24 * 60 * 60,
        "register_endpoint": "/api/v1/users",
        "login_endpoint": "/api/v1/sessions",
        "refresh_endpoint": "/api/v1/sessions/refresh",
        "logout_endpoint": "/api/v1/sessions",
        "me_endpoint": "/api/v1/users/me",
    }

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
        # POST creates tokens (password/refresh grants); DELETE {jti} logs out.
        "token_endpoint": "/api/v1/tokens",
        "revoke_endpoint": "/api/v1/tokens/{jti}",
        # POST: provision/link a Google-authenticated user, returns a token pair.
        "oauth_google_endpoint": "/api/v1/oauth/google",
        "user_endpoint": "/api/v1/users/{user_id}",
        # PUT: set a password on a password-less (OAuth) account.
        "set_password_endpoint": "/api/v1/users/{user_id}/password",
        "totp_enroll_endpoint": "/api/v1/users/{user_id}/totp",
        "totp_verify_endpoint": "/api/v1/users/{user_id}/totp/verification",
        "totp_disable_endpoint": "/api/v1/users/{user_id}/totp",
    }

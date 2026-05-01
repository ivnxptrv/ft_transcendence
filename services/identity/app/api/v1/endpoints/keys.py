from fastapi import APIRouter

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

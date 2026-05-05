from fastapi import APIRouter

from app.core import jwt as jwt_core

router = APIRouter()


@router.get("/jwks.json")
async def jwks():
    """Public key for Backend to verify JWTs (auth.md §4)."""
    return jwt_core.public_jwks()

from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import token_service

router = APIRouter()


@router.post(
    "",
    response_model=schemas.TokenPair,
    operation_id="createToken",
    summary="Create tokens (password or refresh_token grant)",
)
async def create_token(
    body: schemas.TokenCreateIn = Body(...), db: AsyncSession = Depends(get_db)
):
    # One endpoint, two RFC 6749 grants, discriminated on grant_type.
    if body.grant_type == "password":
        return await token_service.issue_pair(
            db, email=body.email, password=body.password, otp=body.otp
        )
    return await token_service.rotate_refresh(db, refresh_token=body.refresh_token)


@router.delete(
    "/{jti}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="revokeToken",
    summary="Revoke a refresh token by its jti (logout)",
)
async def revoke_token(
    jti: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await token_service.revoke(db, jti=jti, owner_user_id=current_user.id)
    return None

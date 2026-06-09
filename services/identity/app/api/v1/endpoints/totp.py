"""TOTP (2FA) lifecycle endpoints.

Mounted at /api/v1/users/{user_id}/totp. Every call is authenticated with the
user's access token and authorized by get_owned_user (user_id == token.sub).
The TOTP code at *login* is not here — it rides the password grant's `otp`
parameter (see endpoints/tokens.py).
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_db, get_owned_user
from app.models.user import User
from app.services import totp_service

router = APIRouter()


@router.post(
    "",
    response_model=schemas.EnrollOut,
    operation_id="enrollTotp",
    summary="Begin TOTP enrollment (no state persisted yet)",
)
async def enroll(user: User = Depends(get_owned_user)):
    return totp_service.enroll(user)


@router.post(
    "/verification",
    response_model=schemas.VerifyOut,
    operation_id="verifyTotp",
    summary="Confirm first TOTP code and finalize enrollment",
)
async def verify(
    body: schemas.VerifyIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_owned_user),
):
    return await totp_service.verify_and_enable(
        db, user=user, secret=body.secret, code=body.code
    )


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="disableTotp",
    summary="Disable TOTP (requires password + current code)",
)
async def disable(
    body: schemas.DisableIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_owned_user),
):
    await totp_service.disable(
        db, user=user, password=body.password, code=body.code
    )
    return None

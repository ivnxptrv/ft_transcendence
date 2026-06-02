"""2FA (TOTP) endpoints — auth.md §6.

Mounted at /users/me/2fa. The login challenge handoff lives in
/sessions and /sessions/2fa (see tokens.py).
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import twofa_service

router = APIRouter()


@router.post(
    "/enroll",
    response_model=schemas.EnrollOut,
    operation_id="twofaEnroll",
    summary="Begin 2FA enrollment (no state persisted yet)",
)
async def enroll(current_user: User = Depends(get_current_user)):
    return twofa_service.enroll(current_user)


@router.post(
    "/verify",
    response_model=schemas.VerifyOut,
    operation_id="twofaVerify",
    summary="Confirm first TOTP code and finalize enrollment",
)
async def verify(
    body: schemas.VerifyIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await twofa_service.verify_and_enable(
        db, user=current_user, secret=body.secret, code=body.code
    )


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="twofaDisable",
    summary="Disable 2FA (requires password + current code)",
)
async def disable(
    body: schemas.DisableIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await twofa_service.disable(
        db, user=current_user, password=body.password, code=body.code
    )
    return None

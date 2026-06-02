from typing import Union

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import token_service

router = APIRouter()


@router.post(
    "",
    response_model=Union[schemas.TokenPair, schemas.ChallengeOut],
    operation_id="login",
    summary="Log in (create a session). Returns a 2FA challenge instead if enrolled.",
)
async def login(credentials: schemas.LoginIn, db: AsyncSession = Depends(get_db)):
    # Two shapes: TokenPair on success, ChallengeOut when 2FA is enrolled.
    # The web caller discriminates on `twofa_required`.
    return await token_service.issue_pair(
        db, email=credentials.email, password=credentials.password
    )


@router.post(
    "/2fa",
    response_model=schemas.TokenPair,
    operation_id="login2fa",
    summary="Exchange a 2FA challenge + TOTP/recovery code for a token pair",
)
async def login_2fa(
    body: schemas.TwoFAChallengeIn, db: AsyncSession = Depends(get_db)
):
    return await token_service.issue_pair_after_2fa(
        db, challenge_token=body.challenge_token, code=body.code
    )


@router.post(
    "/refresh",
    response_model=schemas.TokenPair,
    operation_id="refreshSession",
    summary="Rotate refresh token for a new token pair",
)
async def refresh(body: schemas.RefreshIn, db: AsyncSession = Depends(get_db)):
    return await token_service.rotate_refresh(db, refresh_token=body.refresh_token)


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="logout",
    summary="Log out (revoke refresh token)",
)
async def logout(
    body: schemas.RefreshIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await token_service.revoke(
        db, refresh_token=body.refresh_token, owner_sub=current_user.sub
    )
    return None

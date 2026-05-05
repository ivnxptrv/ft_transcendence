from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import token_service

router = APIRouter()


@router.post("/", response_model=schemas.TokenPair)
async def login(credentials: schemas.LoginIn, db: AsyncSession = Depends(get_db)):
    return await token_service.issue_pair(
        db, email=credentials.email, password=credentials.password
    )


@router.post("/refresh", response_model=schemas.TokenPair)
async def refresh(body: schemas.RefreshIn, db: AsyncSession = Depends(get_db)):
    return await token_service.rotate_refresh(db, refresh_token=body.refresh_token)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: schemas.RefreshIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await token_service.revoke(
        db, refresh_token=body.refresh_token, owner_sub=current_user.sub
    )
    return None

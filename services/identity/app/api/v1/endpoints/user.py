from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_db
from app.services import token_service, user_service

router = APIRouter()


@router.post(
    "/",
    response_model=schemas.TokenPair,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    user_in: schemas.UserCreate, db: AsyncSession = Depends(get_db)
):
    user = await user_service.register_user(db, user_in)
    return await token_service.mint_for_user(db, user)

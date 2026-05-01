from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import token_service, user_service

router = APIRouter()


@router.post(
    "",
    response_model=schemas.TokenPair,
    status_code=status.HTTP_201_CREATED,
    operation_id="registerUser",
    summary="Register a new user",
)
async def register_user(
    user_in: schemas.UserCreate, db: AsyncSession = Depends(get_db)
):
    user = await user_service.register_user(db, user_in)
    return await token_service.mint_for_user(db, user)


@router.get(
    "/me",
    response_model=schemas.UserOut,
    operation_id="getCurrentUser",
    summary="Get the currently authenticated user",
)
async def get_me(current_user: User = Depends(get_current_user)):
    # Map User.sub → contract `id` (UUID). Internal autoincrement PK never
    # leaves the service.
    return schemas.UserOut(
        id=current_user.sub,
        email=current_user.email,
        role=current_user.role,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
    )

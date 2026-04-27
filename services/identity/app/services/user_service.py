from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.core.hashing import hash_password
from app.core.validation import is_valid_email, validate_password
from app.models.user import User
from app.schemas.user import UserCreate


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    return await crud.get_user_by_email(db, email=email)


async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
    if not is_valid_email(user_in.email):
        raise HTTPException(status_code=422, detail={"email": "invalid format"})

    errors = validate_password(user_in.password)
    if errors:
        raise HTTPException(status_code=422, detail={"password": errors})

    existing = await get_by_email(db, email=user_in.email)
    if existing is not None:
        raise HTTPException(status_code=400, detail="User already registered")

    return await crud.create_user(
        db,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
    )

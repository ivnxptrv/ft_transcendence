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
    # Manual 422s use the same {detail:[ValidationError]} shape as
    # FastAPI's RequestValidationError so callers see a single error format.
    if not is_valid_email(user_in.email):
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "loc": ["body", "email"],
                    "msg": "invalid email format",
                    "type": "value_error",
                }
            ],
        )

    errors = validate_password(user_in.password)
    if errors:
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "loc": ["body", "password"],
                    "msg": e,
                    "type": "value_error",
                }
                for e in errors
            ],
        )

    existing = await get_by_email(db, email=user_in.email)
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    return await crud.create_user(
        db,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
    )

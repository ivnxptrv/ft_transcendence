from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.core.hashing import hash_password
from app.core.validation import is_valid_email, validate_password
from app.models.user import User
from app.schemas.user import UserCreate


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    return await crud.get_user_by_email(db, email=email)


async def get_by_sub(db: AsyncSession, sub: str) -> User | None:
    return await crud.get_user_by_sub(db, sub=sub)


async def delete_by_sub(db: AsyncSession, sub: str) -> bool:
    return await crud.delete_user_by_sub(db, sub=sub)


async def upsert_google_user(
    db: AsyncSession,
    *,
    google_id: str,
    email: str,
    first_name: str | None = None,
    last_name: str | None = None,
) -> User:
    """Resolve or provision the account for a verified Google identity:
    1. match by google_id; 2. else match by email and attach google_id (avoids
    a duplicate account); 3. else create a passwordless account.
    """
    user = await crud.get_user_by_google_id(db, google_id=google_id)
    if user is not None:
        return user

    existing = await crud.get_user_by_email(db, email=email)
    if existing is not None:
        existing.google_id = google_id
        await db.commit()
        await db.refresh(existing)
        return existing

    return await crud.create_user(
        db,
        email=email,
        password_hash=None,
        role="client",
        first_name=first_name,
        last_name=last_name,
        google_id=google_id,
    )


async def set_password(db: AsyncSession, *, user: User, password: str) -> None:
    """Set a password on an account that has none (OAuth-only). Refuses if a
    password already exists — changing an existing password is a separate flow.
    """
    if user.password is not None:
        raise HTTPException(status_code=409, detail="Password already set")

    errors = validate_password(password)
    if errors:
        raise HTTPException(
            status_code=422,
            detail=[
                {"loc": ["body", "password"], "msg": e, "type": "value_error"}
                for e in errors
            ],
        )

    user.password = hash_password(password)
    await db.commit()


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

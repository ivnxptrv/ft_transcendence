from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def get_user_by_sub(db: AsyncSession, sub: str) -> User | None:
    result = await db.execute(select(User).where(User.sub == sub))
    return result.scalars().first()


async def get_user_by_google_id(db: AsyncSession, google_id: str) -> User | None:
    result = await db.execute(select(User).where(User.google_id == google_id))
    return result.scalars().first()


async def list_users(db: AsyncSession, *, limit: int, offset: int) -> list[User]:
    """All users, oldest first, paginated. Admin-only (advanced permissions)."""
    result = await db.execute(
        select(User).order_by(User.id).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def delete_user_by_sub(db: AsyncSession, sub: str) -> bool:
    """Delete the user with this external id. Returns True if a row was
    removed, False if no such user existed."""
    user = await get_user_by_sub(db, sub)
    if user is None:
        return False
    await db.delete(user)
    await db.commit()
    return True


async def create_user(
    db: AsyncSession,
    *,
    email: str,
    password_hash: str | None,
    role: str | None,
    first_name: str | None = None,
    last_name: str | None = None,
    google_id: str | None = None,
) -> User:
    # password_hash is None for OAuth-only accounts (model allows null password).
    db_user = User(
        email=email,
        password=password_hash,
        role=role,
        first_name=first_name,
        last_name=last_name,
        google_id=google_id,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

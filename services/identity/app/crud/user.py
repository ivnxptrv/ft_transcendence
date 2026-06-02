from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def create_user(
    db: AsyncSession,
    *,
    email: str,
    password_hash: str,
    role: str,
    first_name: str | None = None,
    last_name: str | None = None,
) -> User:
    db_user = User(
        email=email,
        password=password_hash,
        role=role,
        first_name=first_name,
        last_name=last_name,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

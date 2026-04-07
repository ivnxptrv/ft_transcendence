from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def create_user(db: AsyncSession, user_in: UserCreate):
    # In a real app, you would hash the password here!
    db_user = User(email=user_in.email)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

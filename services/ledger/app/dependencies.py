from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import SessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that creates a new SQLAlchemy async session for each request
    and ensures it is closed after the request is finished.
    """
    async with SessionLocal() as session:
        yield session
        # The 'async with' block automatically handles session.close()

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase


DATABASE_URL = os.environ.get("DATABASE_URL", "").replace(
    "postgres://", "postgresql+asyncpg://"
)
INTERACTION_URL = os.getenv("INTERACTION_URL", "http://localhost:4013")

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session

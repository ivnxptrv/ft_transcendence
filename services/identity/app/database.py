import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

# Handle the protocol difference between devenv and asyncpg
DATABASE_URL = os.environ.get("DATABASE_URL", "").replace(
    "postgres://", "postgresql+asyncpg://"
)

# pool_pre_ping replaces a stale pooled connection (after a DB restart/idle)
# on checkout instead of throwing — avoids intermittent failures that only a
# service restart would otherwise clear.
engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass

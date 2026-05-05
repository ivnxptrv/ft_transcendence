from typing import AsyncGenerator

import jwt as pyjwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import jwt as jwt_core
from app.database import SessionLocal
from app.models.user import User


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that creates a new SQLAlchemy async session for each request
    and ensures it is closed after the request is finished.
    """
    async with SessionLocal() as session:
        yield session
        # The 'async with' block automatically handles session.close()


async def get_current_user(
    authorization: str = Header(..., alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    token = authorization[len("Bearer "):]
    try:
        payload = jwt_core.decode(token, expected_type="access")
    except pyjwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )
    user = (
        await db.execute(select(User).where(User.sub == payload["sub"]))
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unknown user",
        )
    return user

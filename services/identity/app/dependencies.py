from typing import AsyncGenerator

import jwt as pyjwt
from fastapi import Depends, Header, HTTPException, Response, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core import jwt as jwt_core
from app.core.ratelimit import FixedWindowLimiter
from app.database import SessionLocal
from app.models.user import User
from app.services import apikey_service

# Declaring the scheme here (not inline) makes it appear as a reusable
# security scheme in the OpenAPI docs — the padlock on /docs.
api_key_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)

# One process-wide limiter shared by every public-API request.
_rate_limiter = FixedWindowLimiter(
    limit=settings.PUBLIC_API_RATE_LIMIT,
    window_seconds=settings.PUBLIC_API_RATE_WINDOW_SECONDS,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that creates a new SQLAlchemy async session for each request
    and ensures it is closed after the request is finished.
    """
    async with SessionLocal() as session:
        yield session
        # The 'async with' block automatically handles session.close()


async def get_current_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> User:
    # Header is declared optional so a missing header maps to 401 (RFC 7235),
    # not FastAPI's default 422 for missing-required-header.
    if authorization is None or not authorization.startswith("Bearer "):
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


async def get_owned_user(
    user_id: str, current_user: User = Depends(get_current_user)
) -> User:
    """Resolve a `{user_id}` path segment to the authenticated user, asserting
    the token's `sub` matches it. There is no `me` alias: the caller always
    addresses their own resource by its real id, and touching anyone else's
    is 403."""
    if user_id != current_user.sub:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's resource",
        )
    return current_user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Gate admin endpoints on the admin role. Resolved from the DB (via
    get_current_user), not trusted from the token claim — so a just-revoked
    admin loses access immediately, regardless of an unexpired access token.
    403 for a non-admin caller."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def get_api_key_owner(
    response: Response,
    api_key: str | None = Security(api_key_scheme),
    db: AsyncSession = Depends(get_db),
) -> str:
    """Authenticate a public-API request by its `X-API-Key` header and apply
    per-key rate limiting. Returns the owner's `sub`.

    401 for a missing/invalid/revoked key; 429 once the key exceeds its window.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key"
        )
    key = await apikey_service.resolve(db, plaintext=api_key)
    if key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key",
        )

    allowed, remaining, retry_after = _rate_limiter.check(key.id)
    response.headers["X-RateLimit-Limit"] = str(_rate_limiter.limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(retry_after)},
        )
    return key.owner_sub

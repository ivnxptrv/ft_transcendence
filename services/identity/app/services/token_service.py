from datetime import datetime, timezone

import jwt as pyjwt
from fastapi import HTTPException
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core import jwt as jwt_core
from app.core.hashing import verify_password
from app.models.token import Token
from app.models.user import User
from app.services import user_service


async def cleanup_expired(db: AsyncSession, user_id: int) -> None:
    """Lazy prune of expired refresh rows for this user.

    Runs inside issue_pair(); never-returning users' rows stay behind.
    If DB growth ever becomes a concern, a nightly DELETE-by-time job is
    the drop-in fix — no other code needs to change.
    """
    await db.execute(
        delete(Token).where(
            Token.user_id == user_id,
            Token.expires_at < datetime.now(timezone.utc),
        )
    )


async def issue_pair(db: AsyncSession, *, email: str, password: str) -> dict:
    user = await user_service.get_by_email(db, email=email)

    if (
        user is None
        or user.password is None
        or not verify_password(password, user.password)
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.twofa_secret is not None:
        # 2FA guard (§6): block half-enrolled users from bypassing the challenge.
        raise HTTPException(
            status_code=501, detail="2FA required but not yet implemented"
        )

    await cleanup_expired(db, user.id)
    return await mint_for_user(db, user)


async def rotate_refresh(db: AsyncSession, *, refresh_token: str) -> dict:
    try:
        payload = jwt_core.decode(refresh_token, expected_type="refresh")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    existing = (
        await db.execute(select(Token).where(Token.jti == payload["jti"]))
    ).scalar_one_or_none()
    if existing is None or existing.revoked_at is not None:
        raise HTTPException(
            status_code=401, detail="Refresh token revoked or unknown"
        )

    user = (
        await db.execute(select(User).where(User.sub == payload["sub"]))
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="Unknown user")

    existing.revoked_at = datetime.now(timezone.utc)
    return await mint_for_user(db, user)


async def revoke(db: AsyncSession, *, refresh_token: str, owner_sub: str) -> None:
    try:
        payload = jwt_core.decode(refresh_token, expected_type="refresh")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("sub") != owner_sub:
        # Bearer access token must belong to the same user as the refresh token
        # being revoked — prevents one user from invalidating another's session.
        raise HTTPException(status_code=403, detail="Refresh token does not belong to caller")

    await db.execute(
        update(Token)
        .where(Token.jti == payload["jti"], Token.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    await db.commit()


async def mint_for_user(db: AsyncSession, user: User) -> dict:
    access, _ = jwt_core.sign_access(sub=user.sub, email=user.email)
    refresh, refresh_jti, refresh_exp = jwt_core.sign_refresh(sub=user.sub)

    db.add(Token(user_id=user.id, jti=refresh_jti, expires_at=refresh_exp))
    await db.commit()

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "Bearer",
        "expires_in": settings.ACCESS_TTL_MIN * 60,
    }

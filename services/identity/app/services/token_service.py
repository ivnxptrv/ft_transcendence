from datetime import datetime, timedelta, timezone

import jwt as pyjwt
from fastapi import HTTPException
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core import jwt as jwt_core
from app.core.exceptions import TotpRequired
from app.core.hashing import verify_password
from app.models.token import Token
from app.models.user import User
from app.services import totp_service, user_service


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


async def issue_pair(
    db: AsyncSession, *, email: str, password: str, otp: str | None = None
) -> dict:
    user = await user_service.get_by_email(db, email=email)

    if (
        user is None
        or user.password is None
        or not verify_password(password, user.password)
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.twofa_secret is not None:
        # 2FA gate: the password is valid, but a TOTP/recovery code must come
        # in the same request. Absent or wrong → TotpRequired (401 marker), so
        # the web client prompts and re-POSTs the same grant with `otp`.
        if otp is None or not await totp_service.verify_code(db, user=user, code=otp):
            raise TotpRequired()

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
    if existing is None:
        raise HTTPException(status_code=401, detail="Refresh token unknown")

    now = datetime.now(timezone.utc)

    if existing.rotated_at is not None:
        # Already used for a rotation. Allowed again iff still inside the
        # grace window — this is what makes concurrent multi-tab refreshes
        # survive instead of dropping all-but-one to /login.
        rotated_at = existing.rotated_at
        # SQLite hands back tz-naive datetimes; coerce so the subtraction
        # below doesn't raise "can't subtract offset-naive and offset-aware".
        if rotated_at.tzinfo is None:
            rotated_at = rotated_at.replace(tzinfo=timezone.utc)
        grace = timedelta(seconds=settings.REFRESH_GRACE_SECONDS)
        if now - rotated_at > grace:
            raise HTTPException(
                status_code=401, detail="Refresh token reuse outside grace"
            )
    elif existing.revoked_at is not None:
        # Explicitly revoked (logout) but never rotated → no grace, hard no.
        raise HTTPException(status_code=401, detail="Refresh token revoked")
    else:
        # First rotation of this token: mark the grace window start.
        existing.rotated_at = now
        existing.revoked_at = now

    user = (
        await db.execute(select(User).where(User.sub == payload["sub"]))
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="Unknown user")

    return await mint_for_user(db, user)


async def revoke(db: AsyncSession, *, jti: str, owner_user_id: int) -> None:
    """Revoke the refresh token identified by `jti` (logout).

    404 if no such token, 403 if it isn't the caller's, idempotent otherwise.
    The jti is an identifier (not a secret), so DELETE /tokens/{jti} is
    REST-correct; ownership is proven by the caller's access token.
    """
    existing = (
        await db.execute(select(Token).where(Token.jti == jti))
    ).scalar_one_or_none()
    if existing is None:
        raise HTTPException(status_code=404, detail="Token not found")
    if existing.user_id != owner_user_id:
        raise HTTPException(status_code=403, detail="Token does not belong to caller")
    if existing.revoked_at is None:
        await db.execute(
            update(Token)
            .where(Token.jti == jti)
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await db.commit()


async def mint_for_user(db: AsyncSession, user: User) -> dict:
    access, _ = jwt_core.sign_access(sub=user.sub, email=user.email, role=user.role)
    refresh, refresh_jti, refresh_exp = jwt_core.sign_refresh(sub=user.sub)

    db.add(Token(user_id=user.id, jti=refresh_jti, expires_at=refresh_exp))
    await db.commit()

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "Bearer",
        "expires_in": settings.ACCESS_TTL_MIN * 60,
        "jti": refresh_jti,
    }

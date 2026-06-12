import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.api_key import ApiKey

KEY_PREFIX = "vk_"
# url-safe random; 32 bytes ≈ 43 chars of base64 → ~256 bits of entropy.
_SECRET_BYTES = 32
# Chars of the plaintext kept for display (prefix + a few of the random tail).
_DISPLAY_LEN = 10


def _hash(plaintext: str) -> str:
    return hashlib.sha256(plaintext.encode("utf-8")).hexdigest()


async def create(
    db: AsyncSession, *, owner_sub: str, name: str | None
) -> tuple[ApiKey, str]:
    """Mint a new key. Returns (row, plaintext) — plaintext is shown once.

    Enforces a per-owner cap on active (non-revoked) keys; revoking one frees
    a slot. 409 once the limit is reached.
    """
    active = (
        await db.execute(
            select(func.count())
            .select_from(ApiKey)
            .where(ApiKey.owner_sub == owner_sub, ApiKey.revoked_at.is_(None))
        )
    ).scalar_one()
    if active >= settings.MAX_API_KEYS_PER_USER:
        raise HTTPException(
            status_code=409,
            detail="API key limit reached — revoke one before creating another",
        )

    plaintext = f"{KEY_PREFIX}{secrets.token_urlsafe(_SECRET_BYTES)}"
    row = ApiKey(
        owner_sub=owner_sub,
        name=name,
        key_hash=_hash(plaintext),
        prefix=plaintext[:_DISPLAY_LEN],
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row, plaintext


async def list_for_owner(db: AsyncSession, owner_sub: str) -> list[ApiKey]:
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.owner_sub == owner_sub)
        .order_by(ApiKey.created_at.desc())
    )
    return list(result.scalars().all())


async def revoke(db: AsyncSession, *, key_id: str, owner_sub: str) -> None:
    """Revoke a key. 404 if unknown, 403 if not the caller's, idempotent."""
    row = (
        await db.execute(select(ApiKey).where(ApiKey.id == key_id))
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="API key not found")
    if row.owner_sub != owner_sub:
        raise HTTPException(status_code=403, detail="Not your API key")
    if row.revoked_at is None:
        row.revoked_at = datetime.now(timezone.utc)
        await db.commit()


async def resolve(db: AsyncSession, *, plaintext: str) -> ApiKey | None:
    """Look up a live key by its plaintext, stamping last_used_at. Returns
    None for unknown or revoked keys."""
    row = (
        await db.execute(
            select(ApiKey).where(
                ApiKey.key_hash == _hash(plaintext),
                ApiKey.revoked_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if row is not None:
        row.last_used_at = datetime.now(timezone.utc)
        await db.commit()
    return row

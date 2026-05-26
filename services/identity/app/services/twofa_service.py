"""TOTP-based 2FA enrollment, verification, and disable.

Lifecycle:
  - enroll()             → returns secret + otpauth URI. Nothing persisted.
  - verify_and_enable()  → user submits the secret echoed back + a code from
                           their app. Confirms the secret round-tripped to
                           the app before we persist, so a failed scan can't
                           silently lock the user out of subsequent logins.
                           Persists the secret, generates + hashes recovery
                           codes, returns the plaintext codes (shown once).
  - disable()            → requires password + current code (TOTP or recovery).
  - verify_code()        → used by the login-time /sessions/2fa endpoint.

Recovery codes use SHA-256 (not bcrypt) because the codes are high-entropy
random secrets — bcrypt's slowdown buys nothing against random inputs and
would make recovery-code login noticeably laggy when we serially probe up
to N hashes.
"""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timezone
from urllib.parse import quote, urlencode

import pyotp
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.hashing import verify_password
from app.models.user import User


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _new_recovery_code() -> str:
    # 10 hex chars (40 bits) formatted "xxxxx-xxxxx" — copy-pastable, low
    # ambiguity, and ~10^12 search space per code with N codes valid.
    raw = secrets.token_hex(5)
    return f"{raw[:5]}-{raw[5:]}"


def _normalize_code(code: str) -> str:
    return code.strip().replace("-", "").replace(" ", "").lower()


def _build_otpauth_uri(*, secret: str, email: str) -> str:
    # otpauth://totp/<label>?secret=...&issuer=...
    # Label format per the Key URI Format spec is "Issuer:Account" so it
    # renders consistently across Google Authenticator, Authy, 1Password.
    label = quote(f"{settings.TWOFA_ISSUER_LABEL}:{email}", safe="")
    params = urlencode(
        {
            "secret": secret,
            "issuer": settings.TWOFA_ISSUER_LABEL,
            "algorithm": "SHA1",
            "digits": "6",
            "period": "30",
        }
    )
    return f"otpauth://totp/{label}?{params}"


def enroll(user: User) -> dict:
    if user.twofa_secret is not None:
        raise HTTPException(status_code=409, detail="2FA already enabled")
    secret = pyotp.random_base32()
    return {
        "secret": secret,
        "otpauth_uri": _build_otpauth_uri(secret=secret, email=user.email),
    }


async def verify_and_enable(
    db: AsyncSession, *, user: User, secret: str, code: str
) -> dict:
    if user.twofa_secret is not None:
        raise HTTPException(status_code=409, detail="2FA already enabled")
    # valid_window=1 → tolerate ±30s clock skew between phone and server.
    if not pyotp.TOTP(secret).verify(code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    plaintext_codes = [_new_recovery_code() for _ in range(settings.TWOFA_RECOVERY_CODE_COUNT)]
    user.twofa_secret = secret
    user.recovery_codes_hashed = [_hash_code(c) for c in plaintext_codes]
    user.twofa_enrolled_at = datetime.now(timezone.utc)
    await db.commit()
    return {"recovery_codes": plaintext_codes}


def _verify_totp(user: User, code: str) -> bool:
    return pyotp.TOTP(user.twofa_secret).verify(code, valid_window=1)


def _consume_recovery_code(user: User, code: str) -> bool:
    """Returns True and removes the code if it matches a stored hash."""
    if not user.recovery_codes_hashed:
        return False
    digest = _hash_code(_normalize_code(code))
    if digest not in user.recovery_codes_hashed:
        return False
    # SQLAlchemy doesn't detect in-place mutation of JSON columns; reassign
    # so the change is flushed.
    user.recovery_codes_hashed = [h for h in user.recovery_codes_hashed if h != digest]
    return True


async def verify_code(db: AsyncSession, *, user: User, code: str) -> bool:
    """Returns True if `code` is a valid TOTP or unused recovery code.

    Recovery codes are consumed (removed) on success. Commits if a recovery
    code was used; caller commits otherwise.
    """
    if user.twofa_secret is None:
        return False
    if _verify_totp(user, code):
        return True
    if _consume_recovery_code(user, code):
        await db.commit()
        return True
    return False


async def disable(
    db: AsyncSession, *, user: User, password: str, code: str
) -> None:
    if user.twofa_secret is None:
        raise HTTPException(status_code=409, detail="2FA not enabled")
    if user.password is None or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not await verify_code(db, user=user, code=code):
        raise HTTPException(status_code=400, detail="Invalid TOTP or recovery code")
    user.twofa_secret = None
    user.recovery_codes_hashed = None
    user.twofa_enrolled_at = None
    await db.commit()

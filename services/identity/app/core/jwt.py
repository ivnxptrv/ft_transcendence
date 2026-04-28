from __future__ import annotations

import json
import time
import uuid
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path

import jwt
from jwt.algorithms import RSAAlgorithm

from app.config import settings

ALGORITHM = "RS256"


@lru_cache(maxsize=1)
def _private_key() -> str:
    return Path(settings.JWT_PRIVATE_KEY_PATH).read_text()


@lru_cache(maxsize=1)
def _public_key() -> str:
    return Path(settings.JWT_PUBLIC_KEY_PATH).read_text()


def _now() -> int:
    return int(time.time())


def sign_access(*, sub: str, email: str, role: str) -> tuple[str, str]:
    jti = str(uuid.uuid4())
    payload = {
        "sub": sub,
        "email": email,
        "role": role,
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
        "iat": _now(),
        "exp": _now() + settings.ACCESS_TTL_MIN * 60,
        "jti": jti,
        "typ": "access",
    }
    token = jwt.encode(
        payload,
        _private_key(),
        algorithm=ALGORITHM,
        headers={"kid": settings.JWT_KID},
    )
    return token, jti


def sign_refresh(*, sub: str) -> tuple[str, str, datetime]:
    jti = str(uuid.uuid4())
    exp_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TTL_DAYS)
    payload = {
        "sub": sub,
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
        "iat": _now(),
        "exp": int(exp_at.timestamp()),
        "jti": jti,
        "typ": "refresh",
    }
    token = jwt.encode(
        payload,
        _private_key(),
        algorithm=ALGORITHM,
        headers={"kid": settings.JWT_KID},
    )
    return token, jti, exp_at


def decode(token: str, *, expected_type: str | None = None) -> dict:
    payload = jwt.decode(
        token,
        _public_key(),
        algorithms=[ALGORITHM],
        audience=settings.JWT_AUDIENCE,
        issuer=settings.JWT_ISSUER,
    )
    if expected_type and payload.get("typ") != expected_type:
        raise jwt.InvalidTokenError(
            f"Expected token type {expected_type}, got {payload.get('typ')}"
        )
    return payload


def public_jwks() -> dict:
    jwk = json.loads(RSAAlgorithm.to_jwk(_public_key()))
    jwk.update({"use": "sig", "alg": ALGORITHM, "kid": settings.JWT_KID})
    return {"keys": [jwk]}


def ensure_keys_loadable() -> None:
    priv = Path(settings.JWT_PRIVATE_KEY_PATH)
    pub = Path(settings.JWT_PUBLIC_KEY_PATH)
    if not priv.is_file():
        raise RuntimeError(
            f"Identity: private key not found at {priv}. "
            f"Generate with: openssl genrsa -out {priv} 2048 && "
            f"openssl rsa -in {priv} -pubout -out {pub}"
        )
    if not pub.is_file():
        raise RuntimeError(
            f"Identity: public key not found at {pub}. "
            f"Generate with: openssl rsa -in {priv} -pubout -out {pub}"
        )

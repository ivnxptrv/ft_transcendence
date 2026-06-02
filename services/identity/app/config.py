import os
from pathlib import Path


class Settings:
    JWT_PRIVATE_KEY_PATH: Path = Path(
        os.environ.get("JWT_PRIVATE_KEY_PATH", "keys/private.pem")
    )
    JWT_PUBLIC_KEY_PATH: Path = Path(
        os.environ.get("JWT_PUBLIC_KEY_PATH", "keys/public.pem")
    )
    JWT_ISSUER: str = os.environ.get("JWT_ISSUER", "identity")
    JWT_AUDIENCE: str = os.environ.get("JWT_AUDIENCE", "ft-transcendence")
    JWT_KID: str = os.environ.get("JWT_KID", "identity-main")
    ACCESS_TTL_MIN: int = int(os.environ.get("ACCESS_TTL_MIN", "15"))
    REFRESH_TTL_DAYS: int = int(os.environ.get("REFRESH_TTL_DAYS", "14"))
    # Window in seconds during which a just-rotated refresh token can be
    # rotated again. Tolerates concurrent refreshes (multi-tab) without
    # logging users out. Past this window, reuse is treated as theft → 401.
    REFRESH_GRACE_SECONDS: int = int(os.environ.get("REFRESH_GRACE_SECONDS", "10"))
    BCRYPT_COST: int = int(os.environ.get("BCRYPT_COST", "12"))
    # 2FA challenge: short-lived JWT minted when password auth succeeds for a
    # user with twofa_secret set. The web caller exchanges it (+ TOTP code) on
    # POST /sessions/2fa for a real token pair.
    TWOFA_CHALLENGE_TTL_SECONDS: int = int(
        os.environ.get("TWOFA_CHALLENGE_TTL_SECONDS", "300")
    )
    # Issuer label shown by authenticator apps (Google Authenticator, etc.)
    # next to the account, alongside the user's email.
    TWOFA_ISSUER_LABEL: str = os.environ.get("TWOFA_ISSUER_LABEL", "ft_transcendence")
    # Recovery codes minted at enrollment, persisted hashed. SHA-256 is safe
    # here because the codes are high-entropy random secrets — bcrypt's cost
    # buys nothing against random inputs and would make login-with-recovery
    # noticeably slow.
    TWOFA_RECOVERY_CODE_COUNT: int = int(
        os.environ.get("TWOFA_RECOVERY_CODE_COUNT", "8")
    )


settings = Settings()

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


settings = Settings()

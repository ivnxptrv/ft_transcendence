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
    # Issuer label shown by authenticator apps (Google Authenticator, etc.)
    # next to the account, alongside the user's email.
    TWOFA_ISSUER_LABEL: str = os.environ.get("TWOFA_ISSUER_LABEL", "vekko")
    # Recovery codes minted at enrollment, persisted hashed. SHA-256 is safe
    # here because the codes are high-entropy random secrets — bcrypt's cost
    # buys nothing against random inputs and would make login-with-recovery
    # noticeably slow.
    TWOFA_RECOVERY_CODE_COUNT: int = int(
        os.environ.get("TWOFA_RECOVERY_CODE_COUNT", "8")
    )

    # --- Public API (secured gateway) ---
    # Peer-service base URLs the public API proxies to. Defaults match the
    # Docker service names used elsewhere (e.g. ledger → http://interaction:8000).
    INTERACTION_URL: str = os.environ.get("INTERACTION_URL", "http://interaction:8000")
    SEMANTIC_URL: str = os.environ.get("SEMANTIC_URL", "http://semantic:8000")
    LEDGER_URL: str = os.environ.get("LEDGER_URL", "http://ledger:8000")
    # Rate limit applied per API key: PUBLIC_API_RATE_LIMIT requests per
    # PUBLIC_API_RATE_WINDOW_SECONDS. Exceeding it returns 429.
    PUBLIC_API_RATE_LIMIT: int = int(os.environ.get("PUBLIC_API_RATE_LIMIT", "60"))
    PUBLIC_API_RATE_WINDOW_SECONDS: int = int(
        os.environ.get("PUBLIC_API_RATE_WINDOW_SECONDS", "60")
    )
    # Max active (non-revoked) API keys a single user may hold at once.
    MAX_API_KEYS_PER_USER: int = int(os.environ.get("MAX_API_KEYS_PER_USER", "5"))


settings = Settings()

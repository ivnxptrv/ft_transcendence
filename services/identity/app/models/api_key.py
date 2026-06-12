import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _new_id() -> str:
    return str(uuid.uuid4())


class ApiKey(Base):
    """A secured API key for the public API.

    The plaintext key (`vk_<random>`) is shown to the owner exactly once at
    creation; only its SHA-256 digest is persisted. SHA-256 (not bcrypt) is
    correct here: the key is a high-entropy random secret, so a slow KDF buys
    nothing and would tax every request that authenticates with the header.
    """

    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    # The owner's external identifier (User.sub). Every public-API call made
    # with this key acts on behalf of this owner.
    owner_sub: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    key_hash: Mapped[str] = mapped_column(String, nullable=False)
    # First chars of the plaintext, kept for display so the owner can tell
    # their keys apart in a list without us ever storing the secret.
    prefix: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_used_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __table_args__ = (
        Index("ix_api_keys_key_hash_unique", "key_hash", unique=True),
        Index("ix_api_keys_owner_sub", "owner_sub"),
    )

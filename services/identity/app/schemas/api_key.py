from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ApiKeyCreate(BaseModel):
    # Optional human label so the owner can tell their keys apart.
    name: Optional[str] = Field(default=None, max_length=80)


class ApiKeyOut(BaseModel):
    """Metadata view of a key — never includes the secret."""

    id: str
    name: Optional[str] = None
    prefix: str
    created_at: datetime
    last_used_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApiKeyIssued(ApiKeyOut):
    """Returned exactly once, at creation. `key` is the plaintext secret —
    the caller must store it now; it is never retrievable again."""

    key: str

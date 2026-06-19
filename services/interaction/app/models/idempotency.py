from datetime import datetime

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column

# pyrefly: ignore [missing-import]
from sqlalchemy import String, Integer, Text, DateTime, func
from app.database import Base


class IdempotencyKey(Base):
    """Reserves an in-flight write and records its response so a retry with the
    same Idempotency-Key replays it instead of executing the write again.

    The row is inserted *before* the handler runs (the primary key is the lock):
    while `status_code` is NULL the write is in progress; once filled in, the
    write is complete and replayable. The (method, path) it was first used on is
    stored so the same token replayed against a different endpoint is rejected
    rather than returning the wrong resource. A failed write deletes its row, so
    it stays retryable.
    """

    __tablename__ = "idempotency_keys"

    key: Mapped[str] = mapped_column(String(255), primary_key=True)
    method: Mapped[str] = mapped_column(String(8), nullable=False)
    path: Mapped[str] = mapped_column(String(255), nullable=False)
    # NULL until the handler completes — marks the row as a pending reservation.
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

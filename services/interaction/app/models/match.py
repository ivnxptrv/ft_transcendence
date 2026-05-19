from sqlalchemy import ForeignKey, String, Float, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    insider_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    score_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    is_synced: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

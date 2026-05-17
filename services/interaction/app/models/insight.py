from sqlalchemy import ForeignKey, String, Text, Boolean, Integer
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column


"""
Conceptually:

  Insight belongs to Order
  Insight belongs to Match
  Insight is written by Insider
  Insight may later connect to Ledger transaction

"""


class Insight(Base):
    __tablename__ = "insights"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    match_id: Mapped[int] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    insider_id: Mapped[str] = mapped_column(String(64), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    transaction_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

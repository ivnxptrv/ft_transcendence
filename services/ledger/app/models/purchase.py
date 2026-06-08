from sqlalchemy import Column, Integer, Boolean, ForeignKey
from app.database import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), unique=True, nullable=False)
    insight_id = Column(Integer, nullable=False)
    is_synced = Column(Boolean, default=False)
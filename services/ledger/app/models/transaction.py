from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

# class Transaction(Base):
#     __tablename__ = "transactions"

#     id = Column(Integer, primary_key=True, index=True)
#     account_id = Column(String, index=True, nullable=False)
#     amount = Column(Float, nullable=False)  # Positive for credit, negative for debit
#     description = Column(String, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, index=True)
    amount = Column(Float)
    transaction_type = Column(String) # e.g., "deposit", "withdrawal"
    description = Column(String)
    created_at = Column(DateTime, default=func.now())
    request_id = Column(String, unique=True, nullable=True) # For idempotency (double-submit)

class Purchase(Base):  # Use whatever base class your Transaction model uses (e.g., Base)
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), unique=True, nullable=False)
    insight_id = Column(Integer, nullable=False)
    is_synced = Column(Boolean, default=False)

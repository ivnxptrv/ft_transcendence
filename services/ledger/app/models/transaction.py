from sqlalchemy import Column, Integer, String, Float, DateTime, func
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

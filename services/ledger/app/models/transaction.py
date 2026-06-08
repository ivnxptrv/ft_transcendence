from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, index=True)
    amount = Column(Float)
    transaction_type = Column(String)
    description = Column(String)
    request_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=func.now())

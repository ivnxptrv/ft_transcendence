from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    amount = Column(Float)
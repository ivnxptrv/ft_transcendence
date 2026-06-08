from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Purchase(Base):
    __tablename__ = "purchases"
    purchase_id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    insight_id = Column(Integer)
    transaction_id = Column(Integer, ForeignKey("transactions.transaction_id"))
    transaction = relationship("Transaction")

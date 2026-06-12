from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from app.database import Base


class Purchase(Base):
    __tablename__ = "purchases"

    purchase_id = Column(Integer, primary_key=True)
    client_id = Column(String, index=True, nullable=False)
    insider_id = Column(String, index=True, nullable=False)
    insight_id = Column(Integer, index=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_id = Column(
        Integer, ForeignKey("transactions.transaction_id"), nullable=False
    )

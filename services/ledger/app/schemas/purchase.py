from pydantic import BaseModel
from .transaction import TransactionCreate

class PurchaseCreate(BaseModel):
    user_id: str
    insight_id: int

class PurchaseRead(PurchaseCreate):
    purchase_id: int
    transaction_id: int
    class Config:
        from_attributes = True
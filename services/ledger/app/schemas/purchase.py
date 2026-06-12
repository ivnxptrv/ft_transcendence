from pydantic import BaseModel
from decimal import Decimal

class PurchaseCreate(BaseModel):
    client_id: str
    insight_id: int

class PurchaseRead(PurchaseCreate):
    purchase_id: int
    insider_id: str
    amount: Decimal
    transaction_id: int

    class Config:
        from_attributes = True

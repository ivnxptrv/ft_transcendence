from pydantic import BaseModel, Field
from decimal import Decimal

class TransactionCreate(BaseModel):
    # The wallet owner
    user_id: str
    # Using Decimal for financial precision at the schema level too
    amount: Decimal = Field(..., decimal_places=2)

class TransactionRead(TransactionCreate):
    transaction_id: int

    class Config:
        from_attributes = True

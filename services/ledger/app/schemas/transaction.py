from pydantic import BaseModel

class TransactionCreate(BaseModel):
    user_id: str
    amount: float

class TransactionRead(TransactionCreate):
    transaction_id: int
    class Config:
        from_attributes = True
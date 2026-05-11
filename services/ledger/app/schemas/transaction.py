from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    account_id: str
    amount: float
    description: str
    transaction_type: str = Field(..., pattern="^(deposit|withdrawal)$")
    request_id: str  # Used to prevent duplicate submissions

class Transaction(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionCreate(TransactionBase):
    @validator('amount')
    def amount_must_be_nonzero(cls, v):
        if v == 0:
            raise ValueError('Transaction amount cannot be zero')
        return v

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    # We generally don't allow updating 'amount' in a ledger to keep the audit trail clean

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BalanceResponse(BaseModel):
    account_id: str
    balance: float
    status: str

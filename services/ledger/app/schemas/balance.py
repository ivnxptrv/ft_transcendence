from pydantic import BaseModel
from typing import Literal

class BalanceResponse(BaseModel):
    account_id: str
    balance: float

    class Config:
        from_attributes = True
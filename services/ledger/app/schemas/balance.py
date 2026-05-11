from pydantic import BaseModel
from typing import Literal

class BalanceResponse(BaseModel):
    account_id: str
    balance: float
    # Literal ensures the status can ONLY be one of these two strings
    status: Literal["active", "overdrawn"]

    class Config:
        from_attributes = True
from pydantic import BaseModel


class InsightCreate(BaseModel):
    match_id: int
    text: str
    price: int


class InsightRead(BaseModel):
    id: int
    order_id: int
    match_id: int
    insider_id: str
    text: str
    price: int
    transaction_id: int | None = None
    is_paid: bool

    class Config:
        from_attributes = True


class InsightUpdate(BaseModel):
    transaction_id: int

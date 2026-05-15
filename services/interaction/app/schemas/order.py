from datetime import datetime
from pydantic import BaseModel


# Fields accepted by API
class OrderCreate(BaseModel):
    title: str
    text: str


# Fields returned by API
class OrderRead(BaseModel):
    id: int
    title: str
    text: str
    client_id: str
    inquiry_id: int | None  # should be int
    status: str
    created_at: datetime

    # For returning ORM objects:
    class Config:
        from_attributes = True

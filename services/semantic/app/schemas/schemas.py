from pydantic import BaseModel
from typing import Optional

class SoulBase(BaseModel):
    text: str
    insider_id: str


class SoulCreate(SoulBase):
    pass

class SoulRead(SoulBase):
    id: int

    class Config:
        from_attributes = True 
        
class InquiryCreate(BaseModel):
    text: str
    client_id:str
    order_id: int

class ScoreRead(BaseModel):
    id: int
    inquiry_id: int
    soul_id: int
    value: float
    class Config:
        from_attributes = True

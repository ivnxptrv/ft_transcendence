from pydantic import BaseModel
from typing import Optional

class SoulBase(BaseModel):
    bio_essay: str
    uid: str


class SoulCreate(SoulBase):
    pass

class SoulRead(SoulBase):
    id: int

    class Config:
        from_attributes = True 
        
class InquiryCreate(BaseModel):
    inquiry_text: str
    uid:str

class ScoreRead(BaseModel):
    id: int
    inquiry_id: int
    soul_id: int
    value: float
    class Config:
        from_attributes = True

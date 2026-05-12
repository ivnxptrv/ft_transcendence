from pydantic import BaseModel
from datetime import datetime

class SoulBase(BaseModel):
    bio_essay: str

class SoulCreate(SoulBase):
    pass

class SoulRead(SoulBase):
    id: int

    class Config:
        from_attributes = True 
        
class InquiryCreate(BaseModel):
    query_text: str

class ScoreRead(BaseModel):
    id: int
    inquiry_id: int
    soul_id: int
    value: float
    class Config:
        from_attributes = True

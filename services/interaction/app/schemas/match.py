from pydantic import BaseModel


# Fields returned by API
class MatchRead(BaseModel):
    id: int
    order_id: int
    insider_id: str
    score: float
    is_synced: bool

    class Config:
        from_attributes = True

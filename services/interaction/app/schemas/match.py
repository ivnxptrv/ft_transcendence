from pydantic import BaseModel


class MatchCreate(BaseModel):
    order_id: int
    insider_id: str
    score: float
    score_id: int | None = None


# Fields returned by API
class MatchRead(BaseModel):
    id: int
    order_id: int
    insider_id: str
    score: float
    is_synced: bool

    class Config:
        from_attributes = True

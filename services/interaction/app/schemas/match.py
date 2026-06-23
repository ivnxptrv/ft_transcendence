from pydantic import BaseModel


class MatchCreate(BaseModel):
    order_id: int
    insider_id: str
    score: float
    # score_id: int | None = None


# Fields returned by API
class MatchRead(BaseModel):
    id: int
    order_id: int
    insider_id: str
    score: float
    is_synced: bool
    text: str
    # Insider-facing lifecycle, derived from the insight for this match:
    # no insight -> "pending"; insight submitted -> "submitted"; paid ->
    # "completed". Mirrors the client order status.
    status: str

    class Config:
        from_attributes = True

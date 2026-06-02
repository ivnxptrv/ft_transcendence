from .user import UserCreate, UserRead
from .schemas import SoulCreate, SoulRead, InquiryCreate, ScoreRead

# Now you can use: from app.schemas import UserCreate
__all__ = [
    "UserCreate", 
    "UserRead", 
    "SoulCreate", 
    "SoulRead", 
    "InquiryCreate", 
    "ScoreRead"
]

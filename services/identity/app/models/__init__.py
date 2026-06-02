# Import Base so it's accessible from this namespace
from app.database import Base

# Import all models so they are "registered" with Base.metadata
from .user import User
from .token import Token

__all__ = ["Base", "User", "Token"]

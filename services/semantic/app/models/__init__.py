# Import the Base so it's accessible from this namespace
from app.database import Base

# Import all models here so they are "registered" with Base.metadata
from .user import User
from .models import Soul, Inquiry, Score

# This allows you to do: from app.models import User, Post
__all__ = ["Base", "User", "Soul", "Inquiry", "Score"]

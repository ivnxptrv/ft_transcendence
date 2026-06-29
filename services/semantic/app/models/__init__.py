# Import the Base so it's accessible from this namespace
from app.database import Base

# Import all models here so they are "registered" with Base.metadata
from .models import Soul, Inquiry, Score

# This allows you to do: from app.models import Soul
__all__ = ["Base", "Soul", "Inquiry", "Score"]

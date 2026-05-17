# Import the Base so it's accessible from this namespace
from app.database import Base

# Import all models here so they are "registered" with Base.metadata
from .order import Order
from .match import Match
from .insight import Insight

# This allows you to do: from app.models import Order
__all__ = ["Base", "Order", "Match", "Insight"]

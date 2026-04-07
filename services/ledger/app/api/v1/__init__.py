from fastapi import APIRouter
from .endpoints import user

# from .endpoints import items  <-- Add more later

api_router = APIRouter()

# This makes your URL: /api/v1/users/
api_router.include_router(user.router, prefix="/users", tags=["users"])

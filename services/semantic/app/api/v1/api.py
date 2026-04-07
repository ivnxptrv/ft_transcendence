from fastapi import APIRouter
from app.api.v1.endpoints import user
from app.api.v1.endpoints import score

api_router = APIRouter()
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(score.router, prefix="/scores", tags=["scores"])

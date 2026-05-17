from fastapi import APIRouter
from app.api.v1.endpoints import orders, matches

api_router = APIRouter()
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])

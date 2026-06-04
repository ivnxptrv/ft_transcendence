from fastapi import APIRouter
from app.api.v1.endpoints import orders, matches, insights

api_router = APIRouter()
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])

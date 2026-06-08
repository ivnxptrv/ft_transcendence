from fastapi import APIRouter
from app.api.v1.endpoints import balances, transactions, purchases, health

api_router = APIRouter()

api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(balances.router, prefix="/balances", tags=["Balances"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["Purchases"])
api_router.include_router(health.router, tags=["System Health"])
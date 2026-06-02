from fastapi import APIRouter
from app.api.v1.endpoints import ledger

api_router = APIRouter()
api_router.include_router(ledger.router, tags=["ledger"])
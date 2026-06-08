from fastapi import FastAPI
from app.api.v1.endpoints import purchases, transactions, balances
from app.database import engine, Base
import asyncio

app = FastAPI()

app.include_router(purchases.router, prefix="/api/v1/purchases")
app.include_router(transactions.router, prefix="/api/v1/transactions")
app.include_router(balances.router, prefix="/api/v1/balances")

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
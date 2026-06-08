from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1.api import api_router
from app.database import engine, Base
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events.
    """
    # 1. Run the automatic table creation safely in its own transaction block
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # 2. Run the ALTER TABLE workaround safely in a separate connection block
    # This prevents SQLAlchemy from throwing a transaction conflict error
    async with engine.connect() as conn:
        await conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS request_id VARCHAR UNIQUE;"))
        await conn.commit()
        
    yield

# Initialize FastAPI with the lifespan handler
app = FastAPI(title="Ledger Service", lifespan=lifespan)

# Connects your newly separated endpoints (transactions, balances, purchases, health)
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}
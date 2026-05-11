from fastapi import FastAPI
from app.api.v1.api import api_router
from app.database import engine, Base
from app.api.v1.endpoints.ledger import router as ledger_router

app = FastAPI(title="Ledger Service")

app.include_router(api_router, prefix="/api/v1")
@app.get("/health")
def health_check():
    return {"status": "ok"}
    
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        # This will create the 'transactions' table if it doesn't exist
        await conn.run_sync(Base.metadata.create_all)

# Check this in main.py
app.include_router(ledger_router, prefix="/api/v1")

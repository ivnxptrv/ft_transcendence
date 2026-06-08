from fastapi import APIRouter

health = APIRouter()

@health.get("/health", tags=["system"])
async def get_health():
    return {"status": "ok"}
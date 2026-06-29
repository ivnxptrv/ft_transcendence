import time
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Simple API status heartbeat check with a timestamp."""
    return {"status": "healthy", "timestamp": int(time.time())}
from fastapi import FastAPI
from app.api.v1.api import api_router
from app.middlewares.logging import ProcessTimeMiddleware

app = FastAPI(
    title="Interaction Service API",
    description="Microservice for Interaction",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",  # You can even change the URL!
)

# Add Middleware
app.add_middleware(ProcessTimeMiddleware)

# Include All Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "up"}


# pyrefly: ignore [untyped-import]
import yaml

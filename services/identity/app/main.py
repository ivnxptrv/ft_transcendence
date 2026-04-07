from fastapi import FastAPI
from app.api.v1.api import api_router
from app.middlewares.logging import ProcessTimeMiddleware

app = FastAPI(
    title="Identity Service API",
    description="Microservice for User Registration and Authentication",
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


import yaml


@app.on_event("startup")
def save_openapi_yaml():
    with open("contract.yml", "w") as f:
        yaml.dump(app.openapi(), f, sort_keys=False)

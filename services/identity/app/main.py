from contextlib import asynccontextmanager

import yaml
from fastapi import FastAPI

from app.api.v1.api import api_router
from app.core import jwt as jwt_core
from app.middlewares.logging import ProcessTimeMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail-fast if RSA keys are missing — uvicorn refuses to boot rather than
    # serve a broken signing chain. See .devnotes/implementation.md.
    jwt_core.ensure_keys_loadable()
    with open("contract.yml", "w") as f:
        yaml.dump(app.openapi(), f, sort_keys=False)
    yield


app = FastAPI(
    title="Identity Service API",
    description="Microservice for User Registration and Authentication",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(ProcessTimeMiddleware)
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "up"}

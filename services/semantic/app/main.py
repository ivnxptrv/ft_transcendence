import yaml
from contextlib import asynccontextmanager
from fastapi import FastAPI

from . import models
from . import schemas
from .database import engine
from .middlewares.logging import ProcessTimeMiddleware
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

        def get_tables(connection):
            from sqlalchemy import inspect
            inspector = inspect(connection)
            return inspector.get_table_names()

        tables = await conn.run_sync(get_tables)
        print(f"--- Database Initialized. Tables found: {tables} ---")
        
    with open("contract.yml", "w") as f:
        yaml.dump(app.openapi(), f, sort_keys=False)
        
    yield

app = FastAPI(
    title="Semantic Service API",
    description="Microservice for User Registration and Authentication",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan
)

app.add_middleware(ProcessTimeMiddleware)

@app.get("/health", tags=["System"])
async def health():
    return {"status": "up"}

app.include_router(api_router, prefix="/api")

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.api import api_router
from app.api.v1.endpoints.keys import router as jwks_router
from app.core import jwt as jwt_core
from app.middlewares.logging import ProcessTimeMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail-fast if RSA keys are missing — uvicorn refuses to boot rather than
    # serve a broken signing chain.
    jwt_core.ensure_keys_loadable()
    yield


app = FastAPI(
    title="Identity Service API",
    description="Microservice for user registration and authentication.",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(ProcessTimeMiddleware)
app.include_router(api_router, prefix="/api/v1")
# JWKS lives at host root per RFC 8615 — keys must not be versioned.
app.include_router(jwks_router, prefix="/.well-known", tags=["keys"])


_ERROR_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    500: "server_error",
}


@app.exception_handler(StarletteHTTPException)
async def _error_envelope(request, exc: StarletteHTTPException):
    # 422 keeps FastAPI's default {detail:[ValidationError…]} shape so it
    # matches the HTTPValidationError schema in the contract.
    if exc.status_code == 422:
        return await http_exception_handler(request, exc)
    code = _ERROR_CODES.get(exc.status_code, "error")
    msg = exc.detail if isinstance(exc.detail, str) else "error"
    return JSONResponse(
        status_code=exc.status_code, content={"code": code, "message": msg}
    )


@app.get("/health")
async def health():
    return {"status": "ok"}

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.api import api_router
from app.api.v1.endpoints.keys import router as jwks_router
from app.core import jwt as jwt_core
from app.core.exceptions import TotpRequired
from app.middlewares.logging import ProcessTimeMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail-fast if RSA keys are missing — uvicorn refuses to boot rather than
    # serve a broken signing chain.
    jwt_core.ensure_keys_loadable()
    yield


_DESCRIPTION = """\
Public, API-key-secured REST API for interacting with Vekko data.

## Authentication

Every endpoint requires an **`X-API-Key`** header.

1. Sign in to the Vekko web app and open **Settings → API keys**.
2. Create a key — the plaintext `vk_…` value is shown **once**; store it safely.
3. Send it on every request: `X-API-Key: vk_…`

A missing, unknown, or revoked key returns **401**. The key identifies its
owner: order reads/writes are scoped to that owner, and a key may only delete
its own account.

## Rate limiting

Each key is limited to **60 requests per 60 seconds**. Every response carries
`X-RateLimit-Limit` and `X-RateLimit-Remaining`; once the window is exhausted
the API returns **429** with a `Retry-After` header.

## Notes

Identity's internal service-to-service endpoints (auth, tokens, TOTP,
discovery) are intentionally omitted from this schema.
"""

app = FastAPI(
    title="Vekko Public API",
    description=_DESCRIPTION,
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(ProcessTimeMiddleware)
app.include_router(api_router, prefix="/api/v1")
# JWKS lives at host root per RFC 8615 — keys must not be versioned. Internal
# (service-to-service), so kept out of the public OpenAPI schema.
app.include_router(
    jwks_router, prefix="/.well-known", tags=["keys"], include_in_schema=False
)


_ERROR_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    429: "rate_limited",
    500: "server_error",
    502: "bad_gateway",
}


@app.exception_handler(StarletteHTTPException)
async def _error_envelope(request, exc: StarletteHTTPException):
    # 422 keeps FastAPI's default {detail:[ValidationError…]} shape so it
    # matches the HTTPValidationError schema in the contract.
    if exc.status_code == 422:
        return await http_exception_handler(request, exc)
    code = _ERROR_CODES.get(exc.status_code, "error")
    msg = exc.detail if isinstance(exc.detail, str) else "error"
    # Preserve headers the raiser set (e.g. Retry-After on a 429).
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": code, "message": msg},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(TotpRequired)
async def _totp_required(request, exc: TotpRequired):
    # Distinct 401 shape the web client keys off of: prompt for the OTP and
    # re-POST the same password grant with `otp` set.
    return JSONResponse(
        status_code=401,
        content={
            "totp_required": True,
            "code": "totp_required",
            "message": "TOTP code required",
        },
    )


@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}

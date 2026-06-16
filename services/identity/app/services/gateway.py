"""Thin HTTP proxy to peer services' internal APIs.

The public API is a *secured gateway*: identity owns the API-key + rate-limit
concern, then forwards the actual data operations to whichever service owns
the resource (orders → interaction, purchases → ledger). This mirrors the
inter-service pattern already used elsewhere (see ledger → interaction).
"""
import httpx
from fastapi import HTTPException

_TIMEOUT = 10.0


async def forward(
    method: str,
    url: str,
    *,
    json: dict | None = None,
    params: dict | None = None,
) -> dict | list | None:
    """Forward a request to a peer service and surface its result.

    Upstream 4xx/5xx are re-raised with the same status so the public caller
    sees a faithful error; a network failure becomes 502 Bad Gateway.
    """
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        try:
            resp = await client.request(method, url, json=json, params=params)
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Upstream service unavailable")

    if resp.status_code >= 400:
        detail: object = "Upstream error"
        try:
            body = resp.json()
            detail = body.get("detail", body) if isinstance(body, dict) else body
        except ValueError:
            if resp.text:
                detail = resp.text
        raise HTTPException(status_code=resp.status_code, detail=detail)

    if resp.status_code == 204 or not resp.content:
        return None
    return resp.json()

"""Idempotency-Key middleware (reusable across every write endpoint).

A client that wants a write to be safely retryable sends a unique
`Idempotency-Key` header. The token is client-generated and globally unique, so
it carries intent: the same composed action reuses one key (deduped), a
genuinely new action gets a fresh key (allowed) — even when the field values
are identical.

Safety does not depend on timing. The key is *reserved* — a row inserted and
committed — **before** the handler runs, and the primary key is the lock:

  * reservation succeeds  → this request owns the key, runs the handler exactly
    once, then records the response;
  * reservation fails (key exists) → the request never runs the handler:
      - row still pending (status_code NULL) → another request is in flight →
        409 In progress;
      - row complete → replay the stored response.

So two overlapping requests with the same key can never both execute — no
duplicate write, regardless of how long the handler takes. A failed (non-2xx)
write deletes its reservation, staying retryable.

Opt-in: requests without the header, and non-write methods, pass through.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

# pyrefly: ignore [missing-import]
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models import IdempotencyKey

_WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
_HEADER = "idempotency-key"


def _replay(row: IdempotencyKey) -> Response:
    return Response(
        content=row.response_body or "",
        status_code=row.status_code,
        media_type="application/json",
    )


class IdempotencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        key = request.headers.get(_HEADER)
        if key is None or request.method not in _WRITE_METHODS:
            return await call_next(request)

        path = request.url.path

        async with SessionLocal() as db:
            # Reserve the key before doing any work — the PK uniqueness is the
            # lock that serializes concurrent requests sharing a key.
            reservation = IdempotencyKey(key=key, method=request.method, path=path)
            db.add(reservation)
            try:
                await db.commit()
            except IntegrityError:
                await db.rollback()
                existing = await db.get(IdempotencyKey, key)
                if existing is None:
                    # Owner released it between the conflict and this read (its
                    # handler failed). Run unprotected — vanishingly rare.
                    reservation = None
                elif existing.method != request.method or existing.path != path:
                    return Response(
                        content='{"detail":"Idempotency-Key reused for a different request"}',
                        status_code=422,
                        media_type="application/json",
                    )
                elif existing.status_code is None:
                    return Response(
                        content='{"detail":"A request with this Idempotency-Key is in progress"}',
                        status_code=409,
                        media_type="application/json",
                        headers={"Retry-After": "1"},
                    )
                else:
                    return _replay(existing)

            # We hold the reservation (or are running unprotected) — execute the
            # handler exactly once.
            try:
                response = await call_next(request)
            except Exception:
                if reservation is not None:
                    await db.delete(reservation)
                    await db.commit()
                raise

            body = b""
            async for chunk in response.body_iterator:
                body += chunk

            if reservation is not None:
                if 200 <= response.status_code < 300:
                    reservation.status_code = response.status_code
                    reservation.response_body = body.decode("utf-8")
                    await db.commit()
                else:
                    # Failed write — release the reservation so it can be retried.
                    await db.delete(reservation)
                    await db.commit()

            # Re-emit with the original headers (content-length still matches —
            # the body is unchanged). content-type rides along in the headers.
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
            )

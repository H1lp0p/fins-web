from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.upstream_runtime import IDEMPOTENCY_KEY_HEADER, upstream_incoming_idempotency_key


class IdempotencyKeyMiddleware(BaseHTTPMiddleware):
    """Сохраняет Idempotency-Key из входящего запроса в ContextVar для upstream httpx."""

    async def dispatch(self, request: Request, call_next) -> Response:
        raw = request.headers.get(IDEMPOTENCY_KEY_HEADER)
        value = (raw or "").strip() or None
        tok = upstream_incoming_idempotency_key.set(value)
        try:
            return await call_next(request)
        finally:
            upstream_incoming_idempotency_key.reset(tok)

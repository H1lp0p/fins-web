from __future__ import annotations
import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("fins.bff.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        t0 = time.perf_counter()
        path = request.url.path
        q = request.url.query
        path_q = f"{path}?{q}" if q else path
        client = request.client.host if request.client else "-"
        try:
            response = await call_next(request)
        except Exception:
            ms = (time.perf_counter() - t0) * 1000
            logger.exception(
                "http %s %s -> error after %.1fms client=%s",
                request.method,
                path_q,
                ms,
                client,
            )
            raise
        ms = (time.perf_counter() - t0) * 1000
        logger.info(
            "http %s %s -> %s %.1fms client=%s",
            request.method,
            path_q,
            response.status_code,
            ms,
            client,
        )
        return response

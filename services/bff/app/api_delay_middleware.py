import asyncio
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.config import get_settings


class ApiDelayMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        settings = get_settings()
        ms = settings.wait_in_millis
        if ms > 0 and request.url.path.startswith("/api"):
            await asyncio.sleep(ms / 1000.0)
        return await call_next(request)

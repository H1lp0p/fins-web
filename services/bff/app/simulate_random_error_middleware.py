import random

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import get_settings
from app.errors import bff_error_response

SIMULATED_RANDOM_ERROR_PROBABILITY = 0.5


class SimulateRandomErrorMiddleware(BaseHTTPMiddleware):
    """С вероятностью из константы возвращает 500 до обработчика (только в режиме моков)."""

    async def dispatch(self, request: Request, call_next) -> Response:
        settings = get_settings()
        if not settings.simulate_random_errors_enabled:
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)
        path = request.url.path
        if not path.startswith("/api"):
            return await call_next(request)
        if "/ws" in path:
            return await call_next(request)
        if random.random() < SIMULATED_RANDOM_ERROR_PROBABILITY:
            return bff_error_response(
                500,
                message="Oh, it's heads",
                code="SIMULATED_RANDOM_ERROR",
            )
        return await call_next(request)

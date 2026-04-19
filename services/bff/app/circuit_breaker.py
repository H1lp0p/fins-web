from __future__ import annotations

import asyncio
import time
from typing import TYPE_CHECKING

import httpx

if TYPE_CHECKING:
    from app.config import Settings


class CircuitBreakerOpenError(Exception):
    """Выбрасывается до сетевого запроса, если цепь разомкнута."""

    def __init__(self, code: str, message: str = "Сервис временно недоступен") -> None:
        self.code = code
        super().__init__(message)


class AsyncCircuitBreaker:
    """Простой async circuit breaker: closed → open → half-open → closed."""

    __slots__ = (
        "_code",
        "_enabled",
        "_failure_threshold",
        "_recovery_seconds",
        "_state",
        "_failures",
        "_opened_at",
        "_lock",
    )

    def __init__(
        self,
        *,
        code: str,
        enabled: bool,
        failure_threshold: int,
        recovery_seconds: float,
    ) -> None:
        self._code = code
        self._enabled = enabled
        self._failure_threshold = max(1, failure_threshold)
        self._recovery_seconds = max(0.1, recovery_seconds)
        self._state: str = "closed"
        self._failures = 0
        self._opened_at: float | None = None
        self._lock = asyncio.Lock()

    @property
    def enabled(self) -> bool:
        return self._enabled

    @classmethod
    def for_upstream(cls, settings: Settings) -> AsyncCircuitBreaker:
        return cls(
            code="UPSTREAM_CIRCUIT_OPEN",
            enabled=settings.upstream_circuit_breaker_enabled,
            failure_threshold=settings.upstream_circuit_failure_threshold,
            recovery_seconds=settings.upstream_circuit_open_seconds,
        )

    @classmethod
    def for_notifications(cls, settings: Settings) -> AsyncCircuitBreaker:
        return cls(
            code="NOTIFICATION_CIRCUIT_OPEN",
            enabled=settings.notification_circuit_breaker_enabled,
            failure_threshold=settings.notification_circuit_failure_threshold,
            recovery_seconds=settings.notification_circuit_open_seconds,
        )

    async def enter(self) -> None:
        if not self._enabled:
            return
        async with self._lock:
            if self._state == "closed":
                return
            if self._state == "open":
                now = time.monotonic()
                if (
                    self._opened_at is not None
                    and now - self._opened_at >= self._recovery_seconds
                ):
                    self._state = "half_open"
                    return
                raise CircuitBreakerOpenError(self._code)
            return

    async def record_response(self, status_code: int) -> None:
        if not self._enabled:
            return
        failure = status_code >= 500
        async with self._lock:
            if self._state == "half_open":
                if failure:
                    self._failures = self._failure_threshold
                    self._state = "open"
                    self._opened_at = time.monotonic()
                else:
                    self._failures = 0
                    self._state = "closed"
                    self._opened_at = None
                return
            if failure:
                self._failures += 1
                if self._failures >= self._failure_threshold:
                    self._state = "open"
                    self._opened_at = time.monotonic()
            else:
                self._failures = 0

    async def record_exception(self) -> None:
        if not self._enabled:
            return
        async with self._lock:
            if self._state == "half_open":
                self._failures = self._failure_threshold
                self._state = "open"
                self._opened_at = time.monotonic()
                return
            self._failures += 1
            if self._failures >= self._failure_threshold:
                self._state = "open"
                self._opened_at = time.monotonic()


class CircuitBreakerAsyncTransport(httpx.AsyncBaseTransport):
    """Оборачивает httpx.AsyncHTTPTransport, учитывая состояние breaker."""

    __slots__ = ("_breaker", "_inner")

    def __init__(
        self, breaker: AsyncCircuitBreaker, inner: httpx.AsyncHTTPTransport
    ) -> None:
        self._breaker = breaker
        self._inner = inner

    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        await self._breaker.enter()
        try:
            response = await self._inner.handle_async_request(request)
        except Exception:
            await self._breaker.record_exception()
            raise
        await self._breaker.record_response(response.status_code)
        return response

    async def aclose(self) -> None:
        await self._inner.aclose()


def build_async_http_transport(
    verify: bool | str, breaker: AsyncCircuitBreaker | None
) -> httpx.AsyncHTTPTransport | CircuitBreakerAsyncTransport:
    inner = httpx.AsyncHTTPTransport(verify=verify)
    if breaker is None or not breaker.enabled:
        return inner
    return CircuitBreakerAsyncTransport(breaker, inner)

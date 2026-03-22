from __future__ import annotations
import logging
import time
from typing import TYPE_CHECKING, Any
import httpx

if TYPE_CHECKING:
    from app.config import Settings
logger = logging.getLogger("fins.bff.upstream")


def upstream_event_hooks(settings: Settings) -> dict[str, list[Any]] | None:
    if not settings.upstream_request_log:
        return None

    async def on_request(request: httpx.Request) -> None:
        request.extensions["bff_upstream_t0"] = time.perf_counter()

    async def on_response(response: httpx.Response) -> None:
        req = response.request
        t0 = req.extensions.pop("bff_upstream_t0", None)
        elapsed_ms = (time.perf_counter() - t0) * 1000 if t0 is not None else None
        ms = f"{elapsed_ms:.1f}ms" if elapsed_ms is not None else "?"
        identity = "identity=yes" if req.headers.get("X-USER-ID") else "identity=no"
        logger.info(
            "upstream %s %s -> HTTP %s %s (%s)",
            req.method,
            str(req.url),
            response.status_code,
            ms,
            identity,
        )

    return {"request": [on_request], "response": [on_response]}

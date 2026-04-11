from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from uuid import UUID, uuid4

from starlette.requests import Request

_log = logging.getLogger("fins.bff.notifications.mock")


async def iter_mock_notification_sse(
    request: Request,
    *,
    user_id: UUID,
    interval_seconds: float,
) -> AsyncIterator[bytes]:
    """SSE: одно событие сразу, далее с интервалом (по умолчанию раз в минуту)."""
    n = 0
    first = True
    while True:
        if not first:
            await asyncio.sleep(interval_seconds)
        if await request.is_disconnected():
            _log.debug("mock SSE client disconnected")
            break
        first = False
        n += 1
        now = datetime.now(timezone.utc).isoformat()
        payload = {
            "id": str(uuid4()),
            "eventId": str(uuid4()),
            "userId": str(user_id),
            "operationId": str(uuid4()),
            "type": "MOCK_OPERATION",
            "amount": float(100 + (n % 5) * 10),
            "currency": "RUB",
            "message": f"Тестовое уведомление BFF (#{n})",
            "createdAt": now,
            "read": False,
        }
        line = f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode("utf-8")
        yield line

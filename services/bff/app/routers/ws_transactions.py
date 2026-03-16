from __future__ import annotations

import json
from typing import Any
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import get_settings
from app.mock_store import MockUser, store
from app.ws_hub import ws_hub

router = APIRouter()


def _is_worker(u: MockUser) -> bool:
    return "WORKER" in u.roles


def _user_from_ws(ws: WebSocket) -> MockUser | None:
    settings = get_settings()
    token = ws.cookies.get(settings.session_cookie_name)
    return store.user_for_session(token)


async def _send_json(ws: WebSocket, payload: dict[str, Any]) -> None:
    await ws.send_text(json.dumps(payload, default=str))


async def _send_error(ws: WebSocket, message: str, code: str | None = None) -> None:
    body: dict[str, Any] = {"type": "error", "message": message}
    if code is not None:
        body["code"] = code
    await _send_json(ws, body)


@router.websocket("/ws/transactions")
async def transactions_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    subscribed: set[UUID] = set()
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await _send_error(websocket, "Некорректный JSON", code="BAD_REQUEST")
                continue
            if not isinstance(data, dict):
                await _send_error(websocket, "Ожидался объект JSON", code="BAD_REQUEST")
                continue
            msg_type = data.get("type")
            if msg_type == "subscribe":
                await _handle_subscribe(websocket, data, subscribed)
            elif msg_type == "unsubscribe":
                await _handle_unsubscribe(websocket, data, subscribed)
            else:
                await _send_error(websocket, "Неизвестный тип сообщения", code="BAD_REQUEST")
    except WebSocketDisconnect:
        pass
    finally:
        for aid in subscribed:
            await ws_hub.unregister(aid, websocket)


async def _handle_subscribe(
    ws: WebSocket,
    data: dict[str, Any],
    subscribed: set[UUID],
) -> None:
    user = _user_from_ws(ws)
    if user is None:
        await _send_error(ws, "Требуется вход", code="UNAUTHORIZED")
        return
    try:
        account_id = UUID(str(data["accountId"]))
    except (KeyError, ValueError, TypeError):
        await _send_error(ws, "Нужен accountId (UUID)", code="BAD_REQUEST")
        return
    page_index = int(data.get("pageIndex", 0))
    page_size = int(data.get("pageSize", 30))
    if page_index < 0 or page_size < 1 or page_size > 500:
        await _send_error(ws, "Некорректные pageIndex/pageSize", code="BAD_REQUEST")
        return
    if not store.account_owned_by(account_id, user.id) and not _is_worker(user):
        await _send_error(ws, "Нет доступа к счёту", code="FORBIDDEN")
        return
    page = store.page_transactions(account_id, page_index, page_size)
    if page is None:
        await _send_error(ws, "Счёт не найден", code="NOT_FOUND")
        return
    await ws_hub.register(account_id, ws)
    subscribed.add(account_id)
    await _send_json(
        ws,
        {
            "type": "snapshot",
            "accountId": str(account_id),
            "page": page.model_dump(mode="json"),
        },
    )


async def _handle_unsubscribe(
    ws: WebSocket,
    data: dict[str, Any],
    subscribed: set[UUID],
) -> None:
    try:
        account_id = UUID(str(data["accountId"]))
    except (KeyError, ValueError, TypeError):
        await _send_error(ws, "Нужен accountId (UUID)", code="BAD_REQUEST")
        return
    await ws_hub.unregister(account_id, ws)
    subscribed.discard(account_id)

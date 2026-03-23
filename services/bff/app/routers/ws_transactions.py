from __future__ import annotations
import json
from typing import Any
from uuid import UUID
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.bff_user import BffUser
from app.config import get_settings
from app.deps import is_worker_user
from app.mock_store import MockUser, store
from app.session_store import SessionRecord, session_store
from app.public_upstream_shape import normalize_public_response
from app.upstream_context import UpstreamContext
from app.ws_hub import ws_hub
from generated.upstream.api.card_account_controller import (
    get_user_card_account as upstream_get_card,
)
from generated.upstream.api.transaction_operation_controller import (
    get_transaction_operations as upstream_list_tx,
)
from generated.upstream.types import Unset

router = APIRouter()


def _is_worker(u: MockUser) -> bool:
    return "WORKER" in u.roles


def _user_from_ws(ws: WebSocket) -> MockUser | None:
    settings = get_settings()
    token = ws.cookies.get(settings.session_cookie_name)
    return store.user_for_session(token)


def _upstream_session_from_ws(ws: WebSocket) -> tuple[SessionRecord | None, str | None]:
    settings = get_settings()
    token = ws.cookies.get(settings.session_cookie_name)
    return (session_store.get(token), token)


async def _send_json(ws: WebSocket, payload: dict[str, Any]) -> None:
    await ws.send_text(json.dumps(payload, default=str))


async def _send_error(ws: WebSocket, message: str, code: str | None = None) -> None:
    body: dict[str, Any] = {"type": "error", "message": message}
    if code is not None:
        body["code"] = code
    await _send_json(ws, body)


async def _upstream_user_may_access_account(
    ctx: UpstreamContext, user: BffUser, account_id: UUID
) -> bool:
    if is_worker_user(user):
        return True
    r = await ctx.call_upstream(
        lambda c, aid=account_id: upstream_get_card.asyncio_detailed(
            client=c, account_id=aid
        )
    )
    if r is None or int(r.status_code) != 200 or r.parsed is None:
        return False
    ca = r.parsed
    uid = ca.user_id
    if isinstance(uid, Unset):
        return False
    return uid == user.id


@router.websocket("/ws/transactions")
async def transactions_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    settings = get_settings()
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
                if settings.use_upstream:
                    await _handle_subscribe_upstream(websocket, data, subscribed)
                else:
                    await _handle_subscribe_mock(websocket, data, subscribed)
            elif msg_type == "unsubscribe":
                await _handle_unsubscribe(websocket, data, subscribed)
            else:
                await _send_error(
                    websocket, "Неизвестный тип сообщения", code="BAD_REQUEST"
                )
    except WebSocketDisconnect:
        pass
    finally:
        for aid in subscribed:
            await ws_hub.unregister(aid, websocket)


async def _handle_subscribe_mock(
    ws: WebSocket, data: dict[str, Any], subscribed: set[UUID]
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
    if not store.account_owned_by(account_id, user.id) and (not _is_worker(user)):
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


async def _handle_subscribe_upstream(
    ws: WebSocket, data: dict[str, Any], subscribed: set[UUID]
) -> None:
    settings = get_settings()
    rec, token = _upstream_session_from_ws(ws)
    if rec is None:
        await _send_error(ws, "Требуется вход", code="UNAUTHORIZED")
        return
    user = rec.user
    if not isinstance(user, BffUser):
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
    ctx = UpstreamContext(ws, settings, token, rec)
    if not await _upstream_user_may_access_account(ctx, user, account_id):
        await _send_error(ws, "Нет доступа к счёту", code="FORBIDDEN")
        return
    r = await ctx.call_upstream(
        lambda c, aid=account_id, pi=page_index, ps=page_size: (
            upstream_list_tx.asyncio_detailed(
                client=c, account_id=aid, page_index=pi, page_size=ps
            )
        )
    )
    if r is None:
        await _send_error(ws, "Требуется вход", code="UNAUTHORIZED")
        return
    if int(r.status_code) != 200 or r.parsed is None:
        await _send_error(ws, "Не удалось загрузить операции", code="UPSTREAM_ERROR")
        return
    await ws_hub.register(account_id, ws)
    subscribed.add(account_id)
    await _send_json(
        ws,
        {
            "type": "snapshot",
            "accountId": str(account_id),
            "page": normalize_public_response(r.parsed.to_dict()),
        },
    )


async def _handle_unsubscribe(
    ws: WebSocket, data: dict[str, Any], subscribed: set[UUID]
) -> None:
    try:
        account_id = UUID(str(data["accountId"]))
    except (KeyError, ValueError, TypeError):
        await _send_error(ws, "Нужен accountId (UUID)", code="BAD_REQUEST")
        return
    await ws_hub.unregister(account_id, ws)
    subscribed.discard(account_id)

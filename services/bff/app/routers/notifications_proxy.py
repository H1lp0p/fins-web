from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Annotated, Literal
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse

from app.bff_user import BffUser
from app.config import Settings, get_settings
from app.deps import get_current_user_optional, get_session_token
from app.errors import bff_error_response
from app.mock_store import MockUser
from app.notification_sse_mock import iter_mock_notification_sse
from app.session_store import SessionRecord, session_store
from app.upstream_runtime import notification_async_client

_log = logging.getLogger("fins.bff.notifications")

router = APIRouter(prefix="/notifications", tags=["notifications"])

SessionUser = MockUser | BffUser


def _unauth() -> JSONResponse:
    return bff_error_response(401, message="Требуется вход", code="UNAUTHORIZED")


def _notification_unavailable() -> JSONResponse:
    return bff_error_response(
        503,
        message="Сервис уведомлений не настроен",
        code="NOTIFICATION_UNAVAILABLE",
    )


def _notification_headers(settings: Settings, rec: SessionRecord) -> dict[str, str]:
    u = rec.user
    h: dict[str, str] = {
        "Authorization": f"Bearer {rec.access_token}",
        (settings.upstream_gateway_user_id_header or "X-USER-ID"): str(u.id),
    }
    hr = (settings.upstream_gateway_user_roles_header or "").strip()
    if u.roles and hr:
        h[hr] = ",".join(sorted(u.roles))
    return h


def _notification_context(
    settings: Settings,
    user: SessionUser | None,
    cookie: str | None,
) -> tuple[
    Literal["upstream", "mock"] | None,
    SessionRecord | None,
    JSONResponse | None,
]:
    if settings.use_notification_proxy:
        if cookie is None:
            return None, None, _unauth()
        rec = session_store.get(cookie)
        if rec is None:
            return None, None, _unauth()
        return "upstream", rec, None
    if settings.use_notification_sse_mock:
        if user is None:
            return None, None, _unauth()
        return "mock", None, None
    return None, None, _notification_unavailable()


def _notif_base(settings: Settings) -> str:
    assert settings.notification_service_base_url
    return settings.notification_service_base_url.rstrip("/")


def _detail_from_upstream_body(body: bytes) -> str | dict[str, object]:
    if not body:
        return "Upstream error"
    try:
        parsed = json.loads(body.decode("utf-8"))
        if isinstance(parsed, dict):
            return parsed
    except (json.JSONDecodeError, UnicodeDecodeError):
        pass
    return body.decode("utf-8", errors="replace")


@router.get("/subscribe", response_model=None)
async def subscribe_notifications(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    cookie: Annotated[str | None, Depends(get_session_token)],
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
) -> StreamingResponse | JSONResponse:
    layer, rec, err = _notification_context(settings, user, cookie)
    if err is not None:
        return err
    if layer == "mock":
        assert user is not None
        return StreamingResponse(
            iter_mock_notification_sse(
                request,
                user_id=user.id,
                interval_seconds=float(settings.notification_sse_mock_interval_seconds),
            ),
            media_type="text/event-stream",
        )
    assert layer == "upstream" and rec is not None
    url = f"{_notif_base(settings)}/notifications/subscribe"
    headers = _notification_headers(settings, rec)

    sse_timeout = httpx.Timeout(
        connect=60.0,
        read=None,
        write=120.0,
        pool=60.0,
    )

    async def byte_stream() -> AsyncIterator[bytes]:
        async with notification_async_client(settings, sse_timeout) as client:
            async with client.stream("GET", url, headers=headers) as resp:
                if resp.status_code >= 400:
                    body = await resp.aread()
                    _log.warning(
                        "notification SSE upstream HTTP %s: %s",
                        resp.status_code,
                        body[:500],
                    )
                    raise HTTPException(
                        status_code=resp.status_code,
                        detail=_detail_from_upstream_body(body),
                    )
                async for chunk in resp.aiter_bytes():
                    if await request.is_disconnected():
                        break
                    yield chunk

    return StreamingResponse(byte_stream(), media_type="text/event-stream")


@router.get("/unread", response_model=None)
async def get_unread_notifications(
    settings: Annotated[Settings, Depends(get_settings)],
    cookie: Annotated[str | None, Depends(get_session_token)],
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
) -> Response | JSONResponse:
    layer, rec, err = _notification_context(settings, user, cookie)
    if err is not None:
        return err
    if layer == "mock":
        return JSONResponse(content=[])
    assert layer == "upstream" and rec is not None
    url = f"{_notif_base(settings)}/notifications/unread"
    headers = _notification_headers(settings, rec)
    timeout = httpx.Timeout(settings.upstream_timeout_seconds)
    async with notification_async_client(settings, timeout) as client:
        r = await client.get(url, headers=headers)
    ct = r.headers.get("content-type", "application/json")
    return Response(content=r.content, status_code=r.status_code, media_type=ct)


@router.get("/all", response_model=None)
async def get_all_notifications(
    settings: Annotated[Settings, Depends(get_settings)],
    cookie: Annotated[str | None, Depends(get_session_token)],
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
) -> Response | JSONResponse:
    layer, rec, err = _notification_context(settings, user, cookie)
    if err is not None:
        return err
    if layer == "mock":
        return JSONResponse(content=[])
    assert layer == "upstream" and rec is not None
    url = f"{_notif_base(settings)}/notifications/all"
    headers = _notification_headers(settings, rec)
    timeout = httpx.Timeout(settings.upstream_timeout_seconds)
    async with notification_async_client(settings, timeout) as client:
        r = await client.get(url, headers=headers)
    ct = r.headers.get("content-type", "application/json")
    return Response(content=r.content, status_code=r.status_code, media_type=ct)


@router.put("/{notification_id}/read", response_model=None)
async def mark_notification_read(
    notification_id: UUID,
    settings: Annotated[Settings, Depends(get_settings)],
    cookie: Annotated[str | None, Depends(get_session_token)],
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
) -> Response | JSONResponse:
    layer, rec, err = _notification_context(settings, user, cookie)
    if err is not None:
        return err
    if layer == "mock":
        return Response(status_code=200)
    assert layer == "upstream" and rec is not None
    url = f"{_notif_base(settings)}/notifications/{notification_id}/read"
    headers = _notification_headers(settings, rec)
    timeout = httpx.Timeout(settings.upstream_timeout_seconds)
    async with notification_async_client(settings, timeout) as client:
        r = await client.put(url, headers=headers)
    ct = r.headers.get("content-type")
    if ct:
        return Response(content=r.content, status_code=r.status_code, media_type=ct)
    return Response(content=r.content, status_code=r.status_code)

from __future__ import annotations
from collections.abc import Awaitable, Callable
from typing import Annotated, Protocol, TypeVar
import httpx
from fastapi import Depends, Request, WebSocket
from app.config import Settings, get_settings
from app.deps import get_session_token
from app.session_store import SessionRecord, session_store
from app.upstream_runtime import (
    authenticated_client,
    upstream_access_token,
    upstream_forward_identity,
)
from generated.upstream.api.auth.refresh_and_rotate import (
    asyncio_detailed as upstream_refresh,
)
from generated.upstream.client import Client
from generated.upstream.models.token_refresh_model_dto import TokenRefreshModelDto
from generated.upstream.types import Response as UpstreamResponse

TResp = TypeVar("TResp")
StateConnection = Request | WebSocket


class _CodegenHttpClient(Protocol):
    def get_async_httpx_client(self) -> httpx.AsyncClient: ...


class UpstreamContext:
    def __init__(
        self,
        connection: StateConnection,
        settings: Settings,
        session_cookie: str | None,
        record: SessionRecord | None,
    ) -> None:
        self._connection = connection
        self.settings = settings
        self.session_cookie = session_cookie
        self.record = record

    async def call_upstream(
        self, fn: Callable[[_CodegenHttpClient], Awaitable[UpstreamResponse[TResp]]]
    ) -> UpstreamResponse[TResp] | None:
        if self.record is None:
            return None
        bearer = getattr(self._connection.app.state, "upstream_bearer_http", None)
        id_tok = upstream_forward_identity.set(self.record.user)
        try:

            async def _invoke(rec: SessionRecord) -> UpstreamResponse[TResp]:
                if bearer is not None:
                    tok = upstream_access_token.set(rec.access_token)
                    try:
                        return await fn(bearer)
                    finally:
                        upstream_access_token.reset(tok)
                ac = authenticated_client(self.settings, rec.access_token)
                return await fn(ac)

            resp = await _invoke(self.record)
            if int(resp.status_code) != 401:
                return resp
            if not self.session_cookie:
                return resp
            plain: Client | None = getattr(
                self._connection.app.state, "upstream_plain_http", None
            ) or getattr(self._connection.app.state, "upstream_anonymous_client", None)
            if plain is None:
                return resp
            rr = await upstream_refresh(
                client=plain, body=TokenRefreshModelDto(value=self.record.refresh_token)
            )
            if int(rr.status_code) != 200 or rr.parsed is None:
                return resp
            jwt = rr.parsed
            if not session_store.update_tokens(
                self.session_cookie, jwt.access_token, jwt.refresh_token
            ):
                return resp
            self.record = session_store.get(self.session_cookie)
            if self.record is None:
                return resp
            return await _invoke(self.record)
        finally:
            upstream_forward_identity.reset(id_tok)


def get_upstream_context(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    cookie: Annotated[str | None, Depends(get_session_token)],
) -> UpstreamContext:
    rec = session_store.get(cookie) if settings.use_upstream else None
    return UpstreamContext(request, settings, cookie, rec)

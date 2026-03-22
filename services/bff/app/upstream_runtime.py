from __future__ import annotations
import json
import logging
from contextvars import ContextVar
from dataclasses import dataclass
from http import HTTPStatus
from typing import Any, TypeVar
import httpx
from fastapi.responses import JSONResponse, Response
from app.bff_user import BffUser
from app.config import Settings
from app.errors import bff_error_response
from app.public_upstream_shape import normalize_public_response
from app.upstream_http_logging import upstream_event_hooks
from generated.upstream.client import AuthenticatedClient, Client
from generated.upstream.types import Response as UpstreamResponse

T = TypeVar("T")
_upstream_log = logging.getLogger("fins.bff.upstream")
upstream_access_token: ContextVar[str | None] = ContextVar(
    "upstream_access_token", default=None
)
upstream_forward_identity: ContextVar[BffUser | None] = ContextVar(
    "upstream_forward_identity", default=None
)


def _upstream_path_matches_identity_markers(path: str, markers_cfg: str) -> bool:
    raw = (markers_cfg or "").strip()
    if raw == "*":
        return True
    if not raw:
        return True
    markers = [m.strip() for m in raw.split(",") if m.strip()]
    if not markers:
        return True
    return any((m in path for m in markers))


async def _inject_gateway_user_headers(request: httpx.Request) -> None:
    from app.config import get_settings

    s = get_settings()
    if not s.upstream_gateway_forward_identity:
        return
    u = upstream_forward_identity.get()
    if u is None:
        return
    path = request.url.path or ""
    if not _upstream_path_matches_identity_markers(
        path, s.upstream_gateway_identity_path_markers
    ):
        return
    hid = (s.upstream_gateway_user_id_header or "").strip()
    if hid:
        request.headers[hid] = str(u.id)
    hr = (s.upstream_gateway_user_roles_header or "").strip()
    if u.roles and hr:
        request.headers[hr] = ",".join(sorted(u.roles))


class _ContextBearerAuth(httpx.Auth):
    requires_request_body = False
    requires_response_body = False

    def auth_flow(self, request: httpx.Request):
        raise RuntimeError("BFF upstream: используйте только AsyncClient")

    async def async_auth_flow(self, request: httpx.Request):
        token = upstream_access_token.get()
        if token:
            token = token.strip()
            if token:
                request.headers["Authorization"] = f"Bearer {token}"
        await _inject_gateway_user_headers(request)
        yield request


@dataclass(slots=True)
class UpstreamHttpFacade:
    _http: httpx.AsyncClient
    raise_on_unexpected_status: bool = False

    def get_async_httpx_client(self) -> httpx.AsyncClient:
        return self._http

    async def aclose(self) -> None:
        await self._http.aclose()


def build_upstream_http_clients(
    settings: Settings,
) -> tuple[UpstreamHttpFacade, UpstreamHttpFacade]:
    if not settings.use_upstream:
        raise RuntimeError("build_upstream_http_clients without upstream")
    base = settings.upstream_base_url.rstrip("/")
    timeout = httpx.Timeout(settings.upstream_timeout_seconds)
    verify = settings.upstream_verify_ssl
    plain_kw: dict[str, Any] = {"base_url": base, "timeout": timeout, "verify": verify}
    log_hooks = upstream_event_hooks(settings)
    if log_hooks:
        plain_kw["event_hooks"] = log_hooks
    plain = httpx.AsyncClient(**plain_kw)
    bearer_kw: dict[str, Any] = {
        "base_url": base,
        "timeout": timeout,
        "verify": verify,
        "auth": _ContextBearerAuth(),
    }
    if log_hooks:
        bearer_kw["event_hooks"] = log_hooks
    bearer = httpx.AsyncClient(**bearer_kw)
    return (UpstreamHttpFacade(plain), UpstreamHttpFacade(bearer))


async def aclose_upstream_gateway_clients(app_state: Any) -> None:
    for attr in ("upstream_plain_http", "upstream_bearer_http"):
        fac: UpstreamHttpFacade | None = getattr(app_state, attr, None)
        if fac is not None:
            try:
                await fac.aclose()
            except Exception:
                pass


def _client_httpx_args(settings: Settings) -> dict[str, Any]:
    hooks = upstream_event_hooks(settings) or {}
    req = list(hooks.get("request", []))
    req.append(_inject_gateway_user_headers)
    merged = {**hooks, "request": req}
    return {"event_hooks": merged}


def anonymous_client(settings: Settings) -> Client:
    if not settings.use_upstream:
        raise RuntimeError("anonymous_client without upstream_base_url")
    return Client(
        base_url=settings.upstream_base_url.rstrip("/"),
        verify_ssl=settings.upstream_verify_ssl,
        timeout=httpx.Timeout(settings.upstream_timeout_seconds),
        httpx_args=_client_httpx_args(settings),
    )


def authenticated_client(settings: Settings, access_token: str) -> AuthenticatedClient:
    if not settings.use_upstream:
        raise RuntimeError("authenticated_client without upstream_base_url")
    tok = access_token.strip()
    return AuthenticatedClient(
        base_url=settings.upstream_base_url.rstrip("/"),
        token=tok,
        verify_ssl=settings.upstream_verify_ssl,
        timeout=httpx.Timeout(settings.upstream_timeout_seconds),
        httpx_args=_client_httpx_args(settings),
    )


def _status_int(code: HTTPStatus | int) -> int:
    if isinstance(code, HTTPStatus):
        return int(code)
    return int(code)


def _upstream_body_preview(content: bytes | None, limit: int = 600) -> str:
    if not content:
        return "—"
    return content[:limit].decode("utf-8", errors="replace").replace("\n", " ")


def upstream_error_response(resp: httpx.Response) -> JSONResponse:
    sc = resp.status_code
    if sc >= 500:
        _upstream_log.warning(
            "ответ шлюза HTTP %s → пересылка клиенту; тело (обрезано): %s",
            sc,
            _upstream_body_preview(resp.content),
        )
    elif sc >= 400 and sc != 401:
        _upstream_log.info(
            "ответ шлюза HTTP %s → пересылка клиенту; тело (обрезано): %s",
            sc,
            _upstream_body_preview(resp.content),
        )
    try:
        data = resp.json() if resp.content else {}
    except json.JSONDecodeError:
        if 400 <= sc < 500:
            _upstream_log.warning(
                "тело ответа шлюза не JSON при HTTP %s; превью: %s",
                sc,
                _upstream_body_preview(resp.content),
            )
        data = {}
    if isinstance(data, dict):
        msg = data.get("message") or data.get("detail") or resp.reason_phrase
        code = data.get("code")
        fe = data.get("fieldErrors") or data.get("field_errors")
        if isinstance(fe, dict):
            field_errors = {
                str(k): list(v) if isinstance(v, list) else [str(v)]
                for k, v in fe.items()
            }
        else:
            field_errors = None
        return bff_error_response(
            resp.status_code,
            message=str(msg) if msg else None,
            code=str(code) if code else None,
            field_errors=field_errors,
        )
    return bff_error_response(resp.status_code, message=resp.reason_phrase)


def finish_upstream_response(
    upstream: UpstreamResponse[T], *, empty_200: bool = False
) -> dict[str, Any] | list[Any] | bool | Response | JSONResponse:
    status = _status_int(upstream.status_code)
    if status in (200, 201):
        if upstream.parsed is not None:
            if isinstance(upstream.parsed, bool):
                return upstream.parsed
            if isinstance(upstream.parsed, list):
                raw = [item.to_dict() for item in upstream.parsed]
                return normalize_public_response(raw)
            return normalize_public_response(upstream.parsed.to_dict())
        if upstream.content:
            try:
                raw = json.loads(upstream.content)
            except json.JSONDecodeError:
                return upstream_error_response(
                    httpx.Response(status, content=upstream.content)
                )
            if isinstance(raw, dict):
                return normalize_public_response(raw)
            if isinstance(raw, list):
                return normalize_public_response(raw)
        if empty_200 and status == 200:
            return Response(status_code=200)
        return {}
    return upstream_error_response(httpx.Response(status, content=upstream.content))

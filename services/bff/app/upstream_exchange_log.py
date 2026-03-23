from __future__ import annotations
import json
import logging
from typing import Any, Mapping

_REDACT_HEADER_KEYS = frozenset({"authorization", "cookie", "set-cookie", "x-api-key"})
_REDACT_JSON_KEYS = frozenset(
    {"password", "access_token", "refresh_token", "token", "secret"}
)
_SENSITIVE_JSON_NORM = frozenset((k.replace("_", "") for k in _REDACT_JSON_KEYS))
_REQ_PREVIEW_LIMIT = 8000
_RESP_PREVIEW_LIMIT = 16000


def _urljoin(base: str, path: str) -> str:
    b = (base or "").rstrip("/")
    p = path if path.startswith("/") else f"/{path}"
    return f"{b}{p}" if b else p


def redact_headers(h: Mapping[str, str] | None) -> dict[str, str]:
    if not h:
        return {}
    out: dict[str, str] = {}
    for k, v in h.items():
        if k.lower() in _REDACT_HEADER_KEYS:
            out[k] = "***"
        else:
            out[k] = v
    return out


def _redact_obj(o: Any) -> Any:
    if isinstance(o, dict):
        return {
            k: "***"
            if str(k).lower().replace("_", "") in _SENSITIVE_JSON_NORM
            else _redact_obj(v)
            for k, v in o.items()
        }
    if isinstance(o, list):
        return [_redact_obj(x) for x in o]
    return o


def preview_request_body(body: bytes | str | None) -> str:
    if body is None:
        return "—"
    raw = body if isinstance(body, bytes) else body.encode("utf-8")
    try:
        j = json.loads(raw.decode("utf-8"))
        s = json.dumps(_redact_obj(j), ensure_ascii=False)
    except (json.JSONDecodeError, UnicodeDecodeError):
        s = raw[:_REQ_PREVIEW_LIMIT].decode("utf-8", errors="replace")
    return s if len(s) <= _REQ_PREVIEW_LIMIT else s[:_REQ_PREVIEW_LIMIT] + "…"


def preview_json_dict(d: Mapping[str, Any] | None) -> str:
    if not d:
        return "—"
    s = json.dumps(_redact_obj(dict(d)), ensure_ascii=False)
    return s if len(s) <= _REQ_PREVIEW_LIMIT else s[:_REQ_PREVIEW_LIMIT] + "…"


def preview_response_body(content: bytes | None) -> str:
    if not content:
        return "—"
    try:
        j = json.loads(content.decode("utf-8"))
        s = json.dumps(_redact_obj(j), ensure_ascii=False)
    except (json.JSONDecodeError, UnicodeDecodeError):
        s = content[:_RESP_PREVIEW_LIMIT].decode("utf-8", errors="replace")
    return s if len(s) <= _RESP_PREVIEW_LIMIT else s[:_RESP_PREVIEW_LIMIT] + "…"


def format_transport_error(exc: Exception) -> str:
    name = type(exc).__name__
    s = str(exc).strip()
    return f"{name}: {s}" if s else f"{name}: {exc!r}"


def _headers_for_log(rh: Any) -> dict[str, str]:
    if not rh:
        return {}
    if isinstance(rh, dict):
        return {str(k): str(v) for k, v in rh.items()}
    try:
        return {str(k): str(v) for k, v in dict(rh).items()}
    except Exception:
        try:
            return {str(k): str(v) for k, v in rh.items()}
        except Exception:
            return {"_unparsed_headers": repr(rh)[:500]}


def _hints(context: str, path: str, status: int | None) -> list[str]:
    lines: list[str] = []
    if path.endswith("/auth/login") and status == 401:
        lines.append(
            f"  hint: {context} — 401 на логине: обычно нет пользователя или неверный пароль (ответ шлюза)."
        )
    if path.rstrip("/").endswith("/user-service/account") and status in (401, 403):
        lines.append(
            f"  hint: {context} — профиль не отдан после выдачи JWT; проверьте GET account и заголовок Authorization."
        )
    if (
        path.rstrip("/").endswith("/auth/validate")
        and status is not None
        and (status != 200)
    ):
        lines.append(
            f"  hint: {context} — шлюз не подтвердил токен; смотрите response_body и статус."
        )
    return lines


def log_upstream_exchange_failure(
    log: logging.Logger,
    *,
    context: str,
    method: str,
    base_url: str,
    path: str,
    request_headers: Mapping[str, str] | None,
    request_body: bytes | str | None = None,
    request_body_dict: Mapping[str, Any] | None = None,
    upstream_response: Any | None = None,
    transport_error: str | None = None,
) -> None:
    full_url = _urljoin(base_url, path)
    if request_body_dict is not None:
        body_line = preview_json_dict(request_body_dict)
    else:
        body_line = preview_request_body(request_body)
    for line in (
        f"{context}: сбой запроса к шлюзу",
        f"  method={method}",
        f"  url={full_url}",
        f"  request_headers={redact_headers(request_headers)}",
        f"  request_body={body_line}",
    ):
        log.warning(line)
    if transport_error is not None:
        log.warning(f"  transport_error={transport_error}")
    status: int | None = None
    if upstream_response is not None:
        try:
            status = int(upstream_response.status_code)
        except (TypeError, ValueError):
            status = None
        try:
            rh = getattr(upstream_response, "headers", None)
            rc = getattr(upstream_response, "content", None)
            rb = preview_response_body(
                rc if isinstance(rc, (bytes, type(None))) else None
            )
            log.warning(f"  response_status={(status if status is not None else '?')}")
            log.warning(f"  response_headers={redact_headers(_headers_for_log(rh))}")
            log.warning(f"  response_body={rb}")
        except Exception as ex:
            log.warning(f"  response_log_error={type(ex).__name__}: {ex!s}")
    for line in _hints(context, path, status):
        log.warning(line)
    if upstream_response is None and transport_error is None:
        log.warning(
            "  note=нет ни transport_error, ни upstream_response — проверьте версию BFF и перезапуск воркера"
        )

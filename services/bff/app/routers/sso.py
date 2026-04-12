from __future__ import annotations
import logging
from typing import Annotated
import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from app.config import Settings, get_settings
from app.deps import get_current_user_optional, get_session_token
from app.errors import bff_error_response
from app.mock_store import MockUser, store
from app.session_store import session_store
from app.upstream_auth import (
    bff_user_from_user_dto,
    login_body_from_sso,
    register_body_from_sso,
    revoke_body,
)
from app.upstream_exchange_log import (
    format_transport_error,
    log_upstream_exchange_failure,
)
from app.upstream_runtime import (
    anonymous_client,
    authenticated_client,
    upstream_access_token,
    upstream_error_response,
)
from generated.bff_browser_models import SsoLoginBody, SsoRegisterBody
from generated.upstream.api.account import get_user as upstream_get_user
from generated.upstream.api.auth import login as upstream_login
from generated.upstream.api.auth import register as upstream_register
from generated.upstream.api.auth import is_token_valid as upstream_validate
from generated.upstream.api.auth import revoke as upstream_revoke

router = APIRouter(tags=["Auth"])
logger = logging.getLogger("fins.bff.sso")
_HDR_JSON = {"Content-Type": "application/json"}
_HDR_BEARER = {"Authorization": "Bearer ***"}


def _session_cookie_args(settings: Settings) -> dict:
    return {
        "key": settings.session_cookie_name,
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
        "max_age": settings.session_max_age_seconds,
        "path": "/",
    }


def _json_with_session(
    content: dict, settings: Settings, session_token: str
) -> JSONResponse:
    r = JSONResponse(content=content)
    r.set_cookie(value=session_token, **_session_cookie_args(settings))
    return r


def _json_clear_session(settings: Settings) -> JSONResponse:
    r = JSONResponse(content={})
    r.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    return r


def _anon_upstream(request: Request, settings: Settings):
    c = getattr(request.app.state, "upstream_plain_http", None)
    if c is not None:
        return c
    c = getattr(request.app.state, "upstream_anonymous_client", None)
    if c is not None:
        return c
    return anonymous_client(settings)


def _bearer_upstream(request: Request):
    return getattr(request.app.state, "upstream_bearer_http", None)


@router.post("/user-service/auth/register")
async def auth_register(
    request: Request,
    body: SsoRegisterBody,
    settings: Annotated[Settings, Depends(get_settings)],
) -> JSONResponse:
    if settings.use_upstream:
        anon = _anon_upstream(request, settings)
        base = settings.upstream_base_url or ""
        reg_dto = register_body_from_sso(body.name, body.email, body.password)
        try:
            r = await upstream_register.asyncio_detailed(client=anon, body=reg_dto)
        except httpx.RequestError as e:
            log_upstream_exchange_failure(
                logger,
                context="sso register",
                method="POST",
                base_url=base,
                path="/user-service/auth/register",
                request_headers=_HDR_JSON,
                request_body_dict=reg_dto.to_dict(),
                transport_error=format_transport_error(e),
            )
            return bff_error_response(
                503,
                message="Сервис регистрации временно недоступен",
                code="UPSTREAM_UNAVAILABLE",
            )
        if int(r.status_code) != 200 or r.parsed is None:
            log_upstream_exchange_failure(
                logger,
                context="sso register",
                method="POST",
                base_url=base,
                path="/user-service/auth/register",
                request_headers=_HDR_JSON,
                request_body_dict=reg_dto.to_dict(),
                upstream_response=r,
            )
            return upstream_error_response(
                httpx.Response(int(r.status_code), content=r.content)
            )
        jwt = r.parsed
        bearer = _bearer_upstream(request)
        try:
            if bearer is not None:
                tok = upstream_access_token.set(jwt.access_token)
                try:
                    ur = await upstream_get_user.asyncio_detailed(client=bearer)
                finally:
                    upstream_access_token.reset(tok)
            else:
                auth = authenticated_client(settings, jwt.access_token)
                ur = await upstream_get_user.asyncio_detailed(client=auth)
        except httpx.RequestError as e:
            log_upstream_exchange_failure(
                logger,
                context="sso register (get_user)",
                method="GET",
                base_url=base,
                path="/user-service/account",
                request_headers=_HDR_BEARER,
                transport_error=format_transport_error(e),
            )
            return bff_error_response(
                503, message="Сервис временно недоступен", code="UPSTREAM_UNAVAILABLE"
            )
        if int(ur.status_code) != 200 or ur.parsed is None:
            log_upstream_exchange_failure(
                logger,
                context="sso register (get_user)",
                method="GET",
                base_url=base,
                path="/user-service/account",
                request_headers=_HDR_BEARER,
                upstream_response=ur,
            )
            return upstream_error_response(
                httpx.Response(int(ur.status_code), content=ur.content)
            )
        bff_u = bff_user_from_user_dto(ur.parsed)
        sid = session_store.create_session(jwt.access_token, jwt.refresh_token, bff_u)
        return _json_with_session({}, settings, sid)
    user = store.register(body.name, body.email, body.password)
    if user is None:
        return bff_error_response(
            422,
            message="Validation failed",
            field_errors={"email": ["Пользователь с таким email уже зарегистрирован"]},
        )
    token = store.create_session(user.id)
    return _json_with_session({}, settings, token)


@router.post("/user-service/auth/login")
async def auth_login(
    request: Request,
    body: SsoLoginBody,
    settings: Annotated[Settings, Depends(get_settings)],
) -> JSONResponse:
    if settings.use_upstream:
        anon = _anon_upstream(request, settings)
        base = settings.upstream_base_url or ""
        login_dto = login_body_from_sso(body.email, body.password)
        try:
            r = await upstream_login.asyncio_detailed(client=anon, body=login_dto)
        except httpx.RequestError as e:
            log_upstream_exchange_failure(
                logger,
                context="sso login",
                method="POST",
                base_url=base,
                path="/user-service/auth/login",
                request_headers=_HDR_JSON,
                request_body_dict=login_dto.to_dict(),
                transport_error=format_transport_error(e),
            )
            return bff_error_response(
                503,
                message="Сервис авторизации временно недоступен",
                code="UPSTREAM_UNAVAILABLE",
            )
        if int(r.status_code) != 200 or r.parsed is None:
            log_upstream_exchange_failure(
                logger,
                context="sso login",
                method="POST",
                base_url=base,
                path="/user-service/auth/login",
                request_headers=_HDR_JSON,
                request_body_dict=login_dto.to_dict(),
                upstream_response=r,
            )
            return upstream_error_response(
                httpx.Response(int(r.status_code), content=r.content)
            )
        jwt = r.parsed
        bearer = _bearer_upstream(request)
        try:
            if bearer is not None:
                tok = upstream_access_token.set(jwt.access_token)
                try:
                    ur = await upstream_get_user.asyncio_detailed(client=bearer)
                finally:
                    upstream_access_token.reset(tok)
            else:
                auth = authenticated_client(settings, jwt.access_token)
                ur = await upstream_get_user.asyncio_detailed(client=auth)
        except httpx.RequestError as e:
            log_upstream_exchange_failure(
                logger,
                context="sso login (get_user)",
                method="GET",
                base_url=base,
                path="/user-service/account",
                request_headers=_HDR_BEARER,
                transport_error=format_transport_error(e),
            )
            return bff_error_response(
                503, message="Сервис временно недоступен", code="UPSTREAM_UNAVAILABLE"
            )
        if int(ur.status_code) != 200 or ur.parsed is None:
            log_upstream_exchange_failure(
                logger,
                context="sso login (get_user)",
                method="GET",
                base_url=base,
                path="/user-service/account",
                request_headers=_HDR_BEARER,
                upstream_response=ur,
            )
            return upstream_error_response(
                httpx.Response(int(ur.status_code), content=ur.content)
            )
        bff_u = bff_user_from_user_dto(ur.parsed)
        sid = session_store.create_session(jwt.access_token, jwt.refresh_token, bff_u)
        return _json_with_session({}, settings, sid)
    user = store.verify_login(body.email, body.password)
    if user is None:
        return bff_error_response(
            401, message="Неверный email или пароль", code="INVALID_CREDENTIALS"
        )
    token = store.create_session(user.id)
    return _json_with_session({}, settings, token)


@router.get("/user-service/auth/validate")
async def auth_validate(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    user: Annotated[MockUser | object | None, Depends(get_current_user_optional)],
    session_cookie: Annotated[str | None, Depends(get_session_token)],
) -> JSONResponse:
    if user is None:
        if settings.use_upstream:
            if session_cookie is None:
                logger.warning(
                    "sso validate: 401 — нет cookie %s", settings.session_cookie_name
                )
            else:
                logger.warning(
                    "sso validate: 401 — сессия не найдена в BFF (неверный sid или истекла)"
                )
        return bff_error_response(
            401, message="Сессия недействительна", code="UNAUTHORIZED"
        )
    if settings.use_upstream:
        rec = session_store.get(session_cookie)
        if rec is None:
            logger.warning(
                "sso validate: 401 — user в контексте есть, записи сессии нет (рассинхрон)"
            )
            return bff_error_response(
                401, message="Сессия недействительна", code="UNAUTHORIZED"
            )
        bearer = _bearer_upstream(request)
        base = settings.upstream_base_url or ""
        try:
            if bearer is not None:
                tok = upstream_access_token.set(rec.access_token)
                try:
                    vr = await upstream_validate.asyncio_detailed(client=bearer)
                finally:
                    upstream_access_token.reset(tok)
            else:
                auth = authenticated_client(settings, rec.access_token)
                vr = await upstream_validate.asyncio_detailed(client=auth)
        except httpx.RequestError as e:
            log_upstream_exchange_failure(
                logger,
                context="sso validate",
                method="GET",
                base_url=base,
                path="/user-service/auth/validate",
                request_headers=_HDR_BEARER,
                transport_error=format_transport_error(e),
            )
            return bff_error_response(
                503,
                message="Сервис авторизации временно недоступен",
                code="UPSTREAM_UNAVAILABLE",
            )
        if int(vr.status_code) != 200:
            log_upstream_exchange_failure(
                logger,
                context="sso validate",
                method="GET",
                base_url=base,
                path="/user-service/auth/validate",
                request_headers=_HDR_BEARER,
                upstream_response=vr,
            )
            return bff_error_response(
                401, message="Сессия недействительна", code="UNAUTHORIZED"
            )
    return JSONResponse(content={})


@router.post("/user-service/auth/revoke")
async def auth_revoke(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    token: Annotated[str | None, Depends(get_session_token)],
) -> JSONResponse:
    if settings.use_upstream:
        rec = session_store.get(token)
        if rec is not None:
            bearer = _bearer_upstream(request)
            if bearer is not None:
                tok = upstream_access_token.set(rec.access_token)
                try:
                    await upstream_revoke.asyncio_detailed(
                        client=bearer, body=revoke_body(rec.refresh_token)
                    )
                finally:
                    upstream_access_token.reset(tok)
            else:
                auth = authenticated_client(settings, rec.access_token)
                await upstream_revoke.asyncio_detailed(
                    client=auth, body=revoke_body(rec.refresh_token)
                )
        session_store.revoke(token)
        return _json_clear_session(settings)
    store.revoke_session(token)
    return _json_clear_session(settings)

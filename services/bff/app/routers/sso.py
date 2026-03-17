from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.config import Settings, get_settings
from app.deps import get_current_user_optional, get_session_token
from app.errors import bff_error_response
from app.mock_store import MockUser, store
from generated.bff_browser_models import SsoLoginBody, SsoRegisterBody

router = APIRouter(tags=["Auth"])


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
    content: dict,
    settings: Settings,
    session_token: str,
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


@router.post("/user-service/auth/register")
def auth_register(
    body: SsoRegisterBody,
    settings: Annotated[Settings, Depends(get_settings)],
) -> JSONResponse:
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
def auth_login(
    body: SsoLoginBody,
    settings: Annotated[Settings, Depends(get_settings)],
) -> JSONResponse:
    user = store.verify_login(body.email, body.password)
    if user is None:
        return bff_error_response(
            401,
            message="Неверный email или пароль",
            code="INVALID_CREDENTIALS",
        )
    token = store.create_session(user.id)
    return _json_with_session({}, settings, token)


@router.get("/user-service/auth/validate")
def auth_validate(
    settings: Annotated[Settings, Depends(get_settings)],
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
) -> JSONResponse:
    if user is None:
        return bff_error_response(401, message="Сессия недействительна", code="UNAUTHORIZED")
    return JSONResponse(content={})


@router.post("/user-service/auth/revoke")
def auth_revoke(
    settings: Annotated[Settings, Depends(get_settings)],
    token: Annotated[str | None, Depends(get_session_token)],
) -> JSONResponse:
    store.revoke_session(token)
    return _json_clear_session(settings)

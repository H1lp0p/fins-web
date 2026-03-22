from __future__ import annotations
from typing import Annotated
from fastapi import Depends, Request
from app.bff_user import BffUser
from app.config import Settings, get_settings
from app.mock_store import MockUser, store
from app.session_store import session_store


def get_session_token(
    request: Request, settings: Annotated[Settings, Depends(get_settings)]
) -> str | None:
    return request.cookies.get(settings.session_cookie_name)


def get_current_user_optional(
    settings: Annotated[Settings, Depends(get_settings)],
    token: Annotated[str | None, Depends(get_session_token)],
) -> MockUser | BffUser | None:
    if settings.use_upstream:
        rec = session_store.get(token)
        return rec.user if rec else None
    return store.user_for_session(token)


def is_worker_user(user: MockUser | BffUser) -> bool:
    if isinstance(user, BffUser):
        return user.is_worker()
    return "WORKER" in user.roles


def get_upstream_access_token(
    settings: Annotated[Settings, Depends(get_settings)],
    token: Annotated[str | None, Depends(get_session_token)],
) -> str | None:
    if not settings.use_upstream:
        return None
    rec = session_store.get(token)
    return rec.access_token if rec else None

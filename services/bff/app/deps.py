from typing import Annotated

from fastapi import Depends, Request

from app.config import Settings, get_settings
from app.mock_store import MockUser, store


def get_session_token(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
) -> str | None:
    return request.cookies.get(settings.session_cookie_name)


def get_current_user_optional(
    token: Annotated[str | None, Depends(get_session_token)],
) -> MockUser | None:
    return store.user_for_session(token)

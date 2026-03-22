from __future__ import annotations
from typing import Annotated, NamedTuple
from fastapi import Depends
from app.config import Settings, get_settings
from app.deps import get_session_token
from app.session_store import SessionRecord, session_store
from app.upstream_runtime import authenticated_client
from generated.upstream.client import AuthenticatedClient


class UpstreamAuth(NamedTuple):
    record: SessionRecord
    client: AuthenticatedClient


def get_upstream_auth_optional(
    settings: Annotated[Settings, Depends(get_settings)],
    cookie: Annotated[str | None, Depends(get_session_token)],
) -> UpstreamAuth | None:
    rec = session_store.get(cookie)
    if rec is None:
        return None
    return UpstreamAuth(rec, authenticated_client(settings, rec.access_token))

from __future__ import annotations
import secrets
from dataclasses import dataclass
from threading import RLock
from app.bff_user import BffUser


@dataclass(slots=True)
class SessionRecord:
    access_token: str
    refresh_token: str
    user: BffUser


class SessionStore:
    def __init__(self) -> None:
        self._lock = RLock()
        self._by_cookie: dict[str, SessionRecord] = {}

    def create_session(
        self, access_token: str, refresh_token: str, user: BffUser
    ) -> str:
        key = secrets.token_urlsafe(32)
        with self._lock:
            self._by_cookie[key] = SessionRecord(
                access_token=access_token.strip(),
                refresh_token=refresh_token.strip(),
                user=user,
            )
        return key

    def get(self, cookie_value: str | None) -> SessionRecord | None:
        if not cookie_value:
            return None
        with self._lock:
            return self._by_cookie.get(cookie_value)

    def revoke(self, cookie_value: str | None) -> None:
        if not cookie_value:
            return
        with self._lock:
            self._by_cookie.pop(cookie_value, None)

    def update_tokens(
        self, cookie_value: str, access_token: str, refresh_token: str
    ) -> bool:
        with self._lock:
            rec = self._by_cookie.get(cookie_value)
            if rec is None:
                return False
            self._by_cookie[cookie_value] = SessionRecord(
                access_token=access_token.strip(),
                refresh_token=refresh_token.strip(),
                user=rec.user,
            )
        return True


session_store = SessionStore()

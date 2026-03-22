from functools import lru_cache
from pathlib import Path
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from app.constants import WAIT_IN_MILLIS

_BFF_ROOT = Path(__file__).resolve().parents[1]
_ENV_FILE = _BFF_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE, env_file_encoding="utf-8", extra="ignore"
    )
    session_secret: str = "dev-change-me"
    session_cookie_name: str = "fins_session"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    session_max_age_seconds: int = 60 * 60 * 24 * 7
    cors_origins: str = Field(
        default="http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5174,http://localhost:5174,http://127.0.0.1:5175,http://localhost:5175"
    )
    bff_service_api_key: str | None = None
    upstream_base_url: str | None = None
    upstream_verify_ssl: bool = True
    upstream_timeout_seconds: float = Field(default=30.0, ge=1.0)
    upstream_request_log: bool = True
    upstream_gateway_forward_identity: bool = True
    upstream_gateway_user_id_header: str = "X-USER-ID"
    upstream_gateway_user_roles_header: str = "X-USER-ROLES"
    upstream_gateway_identity_path_markers: str = "/preferences-service/"
    use_mock_bank_treasury: bool = True
    wait_in_millis: int = Field(default=WAIT_IN_MILLIS, ge=0)

    @property
    def use_upstream(self) -> bool:
        return bool(self.upstream_base_url and self.upstream_base_url.strip())

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

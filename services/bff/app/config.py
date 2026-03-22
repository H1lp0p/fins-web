from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.constants import WAIT_IN_MILLIS


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Для будущей подписи токенов / прокси на шлюз
    session_secret: str = "dev-change-me"

    session_cookie_name: str = "fins_session"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    session_max_age_seconds: int = 60 * 60 * 24 * 7

    # Запросы с credentials из Vite (несколько портов); через запятую
    cors_origins: str = Field(
        default=(
            "http://127.0.0.1:5173,http://localhost:5173,"
            "http://127.0.0.1:5174,http://localhost:5174,"
            "http://127.0.0.1:5175,http://localhost:5175"
        ),
    )

    bff_service_api_key: str | None = None

    #: Задержка перед обработкой каждого запроса с путём `/api` (мс). Env: `WAIT_IN_MILLIS`.
    wait_in_millis: int = Field(default=WAIT_IN_MILLIS, ge=0)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

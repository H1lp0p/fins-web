import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.api_delay_middleware import ApiDelayMiddleware
from app.request_logging_middleware import RequestLoggingMiddleware
from app.circuit_breaker import AsyncCircuitBreaker, CircuitBreakerOpenError
from app.simulate_random_error_middleware import SimulateRandomErrorMiddleware
from app.config import get_settings
from app.errors import bff_error_response
from app.routers import notifications_proxy, public, sso, ws_transactions
from app.upstream_runtime import (
    aclose_upstream_gateway_clients,
    build_upstream_http_clients,
    set_circuit_breakers_for_process,
)

BFF_ROOT = Path(__file__).resolve().parents[1]
BFF_LOG_FILE = BFF_ROOT / "logs" / "bff.log"
SSO_STATIC_DIR = BFF_ROOT / "static" / "sso"


def _configure_fins_bff_logging() -> None:
    BFF_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    log = logging.getLogger("fins.bff")
    log.handlers.clear()
    log.setLevel(logging.INFO)
    log.propagate = False
    h = logging.FileHandler(BFF_LOG_FILE, encoding="utf-8")
    h.setLevel(logging.INFO)
    h.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    log.addHandler(h)


_configure_fins_bff_logging()
logging.getLogger("fins.bff").info(
    "BFF: логирование в файл включено (%s)", BFF_LOG_FILE
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if settings.use_upstream:
        upstream_breaker = AsyncCircuitBreaker.for_upstream(settings)
        notification_breaker: AsyncCircuitBreaker | None = None
        if settings.use_notification_proxy:
            notification_breaker = AsyncCircuitBreaker.for_notifications(settings)
        set_circuit_breakers_for_process(upstream_breaker, notification_breaker)
        plain, bearer = build_upstream_http_clients(settings)
        app.state.upstream_plain_http = plain
        app.state.upstream_bearer_http = bearer
        app.state.upstream_anonymous_client = plain
        app.state.upstream_circuit_breaker = upstream_breaker
        if notification_breaker is not None:
            app.state.notification_circuit_breaker = notification_breaker
    yield
    if settings.use_upstream:
        await aclose_upstream_gateway_clients(app.state)


app = FastAPI(title="Fins BFF", version="0.0.0", lifespan=lifespan)


@app.exception_handler(CircuitBreakerOpenError)
async def _circuit_breaker_open_handler(
    _request: Request, exc: CircuitBreakerOpenError
) -> JSONResponse:
    return bff_error_response(
        503,
        message=str(exc),
        code=exc.code,
    )


_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ApiDelayMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SimulateRandomErrorMiddleware)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


api_v1 = APIRouter(prefix="/api/v1")


@api_v1.get("/ping")
def ping() -> dict[str, str]:
    return {"message": "pong"}


app.include_router(api_v1)
api = APIRouter(prefix="/api")
api.include_router(sso.router)
api.include_router(public.router)
api.include_router(notifications_proxy.router)
app.include_router(api)
app.include_router(ws_transactions.router, prefix="/api")
if SSO_STATIC_DIR.is_dir() and any(SSO_STATIC_DIR.iterdir()):
    app.mount("/", StaticFiles(directory=str(SSO_STATIC_DIR), html=True), name="sso")

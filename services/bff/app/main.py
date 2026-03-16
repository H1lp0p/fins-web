from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import public, sso, ws_transactions

BFF_ROOT = Path(__file__).resolve().parents[1]
SSO_STATIC_DIR = BFF_ROOT / "static" / "sso"

app = FastAPI(title="Fins BFF", version="0.0.0")

_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
app.include_router(api)
app.include_router(ws_transactions.router, prefix="/api")

if SSO_STATIC_DIR.is_dir() and any(SSO_STATIC_DIR.iterdir()):
    app.mount(
        "/",
        StaticFiles(directory=str(SSO_STATIC_DIR), html=True),
        name="sso",
    )

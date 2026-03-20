from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.staticfiles import StaticFiles

BFF_ROOT = Path(__file__).resolve().parents[1]
SSO_STATIC_DIR = BFF_ROOT / "static" / "sso"

app = FastAPI(title="Fins BFF", version="0.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


api_v1 = APIRouter(prefix="/api/v1")


@api_v1.get("/ping")
def ping() -> dict[str, str]:
    return {"message": "pong"}


app.include_router(api_v1)

if SSO_STATIC_DIR.is_dir() and any(SSO_STATIC_DIR.iterdir()):
    app.mount(
        "/",
        StaticFiles(directory=str(SSO_STATIC_DIR), html=True),
        name="sso",
    )

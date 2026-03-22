# BFF

FastAPI: `/api`, `GET /health`, optional SSO static from `static/sso/`.

## Setup

```bash
cd services/bff
python -m venv .venv
.\.venv\Scripts\activate
pip install -e ".[dev]"
```

`[dev]` — codegen tools. Run-only: `pip install -e .`

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Copy `apps/sso/dist/*` → `static/sso/` if you need `/` SSO.

## Codegen

| Output | Command |
|--------|---------|
| `generated/upstream/` from `openapi/openApi.backend-gateway.yaml` | `pnpm run generate:bff:upstream` (repo root) or `python scripts/generate_upstream_client.py` |
| `generated/bff_browser_models.py` | `pnpm run generate:bff:browser-models` or `python scripts/generate_browser_models.py` |

`.env`: see `.env.example` (`UPSTREAM_BASE_URL`, session cookie, CORS, gateway headers).

OpenAPI layout: `openapi/README.md`.

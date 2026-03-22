# Fins

Monorepo: React (Vite), `@fins/ui-kit`, BFF (FastAPI), OpenAPI contracts.

## Requirements

- Node LTS, pnpm 9+ (`corepack enable` / `corepack prepare pnpm@9.15.4 --activate`)
- Python ≥ 3.11 (BFF)
- Docker (optional, see `deploy/README.md`)

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Dependencies |
| `pnpm build` | ui-kit → api → entities → all `apps/*` |
| `pnpm dev:sso` / `dev:user` / `dev:admin` | Dev servers |
| `pnpm --filter @fins/ui-kit build` | Build ui-kit only |
| `pnpm run generate:contracts` | RTK client + BFF upstream client + Pydantic browser models (needs `pip install -e ".[dev]"` in `services/bff`) |
| `pnpm run merge:openapi:backend-gateway` | Rebuild `openapi/openApi.backend-gateway.yaml` from `openapi/from-backend/` |

## OpenAPI (`openapi/`)

| File | Role |
|------|------|
| `openApi.backend-gateway.yaml` | BFF → backend gateway (merged from `from-backend/`) |
| `openApi.public.yaml` | Browser → BFF (public API) |
| `openApi.sso.yaml` | Auth routes |
| `bundles/openApi.bff.browser.yaml` | public + sso bundle for BFF Pydantic codegen |
| `asyncApi.transactions.yaml` | WS contract for transactions |

## Env

- Repo root: `.env.example` — `BFF_ORIGIN` for Vite proxy to BFF
- `services/bff/.env.example` — BFF (`UPSTREAM_BASE_URL`, etc.)

## BFF

```bash
cd services/bff
python -m venv .venv
.\.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

SSO static: build `pnpm --filter @fins/sso build`, copy `apps/sso/dist/*` → `services/bff/static/sso/`. Details: `services/bff/README.md`.

## Docker

```bash
docker compose -f deploy/docker-compose.yml up --build
```

See `deploy/README.md`.

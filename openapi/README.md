# OpenAPI

| File | Role |
|------|------|
| `openApi.backend-gateway.yaml` | Full gateway spec; build: `pnpm run merge:openapi:backend-gateway` (needs PyYAML) |
| `from-backend/` | Exported gateway JSON fragments |
| `openApi.public.yaml` | Browser → BFF (non-auth) |
| `openApi.sso.yaml` | Auth |
| `bundles/openApi.bff.browser.yaml` | public + sso merge for BFF models |
| `asyncApi.transactions.yaml` | WS `/api/ws/transactions` |

## Codegen (repo root)

```bash
pnpm run generate:contracts
```

Uses `@fins/api` (RTK), then BFF upstream client and browser Pydantic models (`services/bff`, `pip install -e ".[dev]"`).

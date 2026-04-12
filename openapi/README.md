# OpenAPI / AsyncAPI

Контракты между фронтом, BFF и gateway. Сборка merged-файлов и codegen — из **корня** монорепо (`pnpm`).

## Основные файлы

| Файл | Роль |
|------|------|
| `openApi.backend-gateway.yaml` | BFF → API Gateway; собирается: `pnpm run merge:openapi:backend-gateway` (нужен PyYAML), исходники в `from-backend/` |
| `openApi.public.yaml` | Браузер → BFF (публичное API) |
| `openApi.sso.yaml` | Авторизация |
| `bundles/openApi.bff.browser.yaml` | merge public + sso для Pydantic-моделей BFF |
| `asyncApi.transactions.yaml` | WebSocket `/api/ws/transactions` |

Подробнее про сценарии: [`README.md`](../README.md) в корне (таблица OpenAPI).

## Команды

Полная пересборка артефактов codegen (после правок спек):

```bash
pnpm run generate:contracts
```

Отдельно:

- только merge gateway: `pnpm run merge:openapi:backend-gateway`
- только фронт + WS: `pnpm run generate:api`
- только Python upstream-клиент BFF: `pnpm run generate:bff:upstream`
- только `bff_browser_models`: `pnpm run generate:bff:browser-models`

Для `generate:contracts` в `services/bff` должны быть установлены зависимости с `[dev]` (см. [`services/bff/README.md`](../services/bff/README.md)).

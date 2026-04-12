# Fins

Monorepo: React (Vite), пакеты `@fins/ui-kit`, `@fins/api`, `@fins/entities`, BFF (FastAPI), OpenAPI-контракты.

## Требования

- Node LTS, **pnpm 9+** (`corepack enable` / `corepack prepare pnpm@9.15.4 --activate`)
- Python ≥ 3.11 (BFF, codegen)
- Docker (опционально, см. [`deploy/README.md`](deploy/README.md))

## Быстрый старт

```bash
pnpm install
pnpm build
```

Дальше — поднять BFF ([`services/bff/README.md`](services/bff/README.md)) и фронты: `pnpm dev:user` / `dev:admin` / `dev:sso`.

## Команды (корень)

| Команда | Назначение |
|---------|------------|
| `pnpm install` | Зависимости |
| `pnpm build` | ui-kit → api → entities → все `apps/*` |
| `pnpm dev:sso` / `dev:user` / `dev:admin` | Dev-серверы приложений |
| `pnpm --filter @fins/ui-kit build` | Только ui-kit |
| `pnpm run generate:contracts` | RTK + upstream-клиент BFF + browser models (нужен `pip install -e ".[dev]"` в `services/bff`) |
| `pnpm run merge:openapi:backend-gateway` | Пересобрать `openapi/openApi.backend-gateway.yaml` из `openapi/from-backend/` |

## Документация по модулям

| Модуль | README |
|--------|--------|
| BFF | [`services/bff/README.md`](services/bff/README.md) |
| Контракты / codegen | [`openapi/README.md`](openapi/README.md) |
| `@fins/api` | [`packages/api/README.md`](packages/api/README.md) |
| `@fins/ui-kit` | [`packages/ui-kit/README.md`](packages/ui-kit/README.md) |
| `@fins/entities` | [`packages/entities/README.md`](packages/entities/README.md) |
| Приложение user | [`apps/user/README.md`](apps/user/README.md) |
| Приложение admin | [`apps/admin/README.md`](apps/admin/README.md) |
| SSO | [`apps/sso/README.md`](apps/sso/README.md) |
| Docker | [`deploy/README.md`](deploy/README.md) |

## Переменные окружения

- Корень: [`.env.example`](.env.example) — `BFF_ORIGIN` для прокси Vite → BFF.
- BFF: [`services/bff/.env.example`](services/bff/.env.example) — gateway, сессия, CORS и др.

## Docker

```bash
docker compose -f deploy/docker-compose.yml up --build
```

Подробности: [`deploy/README.md`](deploy/README.md).

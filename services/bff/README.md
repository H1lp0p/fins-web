# Fins BFF

FastAPI: JSON API и раздача собранного SSO (`static/sso`).

Шаблон переменных окружения: [.env.example](.env.example) (скопируй в `.env` в этом каталоге, когда начнёшь читать настройки из env).

## Зависимости

```bash
cd services/bff
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e .
```

## Статика SSO

После `pnpm --filter @fins/sso build` скопируйте содержимое `apps/sso/dist/` в `services/bff/static/sso/` (каталог создаётся вручную или скриптом/CI). Пока каталог пустой или отсутствует, статика не монтируется — работают только `/health` и `/api`.

## Запуск

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Локальные SPA (`pnpm dev:*`) ходят на этот же сервис через прокси Vite: запросы на `/api` с dev-сервера пересылаются сюда (см. корневой README, переменная `BFF_ORIGIN` при необходимости).

- `GET /health` — проверка живости
- `GET /api/v1/ping` — тест API
- `GET /` — SPA SSO, если `static/sso` существует

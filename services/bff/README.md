# Fins BFF

FastAPI: JSON API и раздача собранного SSO (`static/sso`).

Контракты OpenAPI/AsyncAPI и **матрица кодогенерации** (клиент RTK, будущие артефакты BFF и WS): [openapi/README.md](../../openapi/README.md). Из корня монорепо: `pnpm run generate:contracts` (сейчас прогоняет только `@fins/api`).

Шаблон переменных окружения: [.env.example](.env.example) (скопируй в `.env` в этом каталоге, когда начнёшь читать настройки из env).

## Зависимости

```bash
cd services/bff
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
```

`[dev]` нужен для **`openapi-python-client`** (пересборка upstream-клиента). Для только запуска BFF достаточно `pip install -e .`.

### Клиент BFF → шлюз (codegen)

Источник: [openapi/openApi.backend-gateway.yaml](../../openapi/openApi.backend-gateway.yaml). Конфиг генератора: [openapi-python-client.upstream.yaml](./openapi-python-client.upstream.yaml) (в т.ч. маппинг `*/*` → `application/json` из‑за ответов в спеке).

Из корня монорепо:

```bash
pnpm run generate:bff:upstream
```

Или из `services/bff` (после `pip install -e ".[dev]"`):

```bash
python scripts/generate_upstream_client.py
```

Артефакт: [generated/upstream/](generated/upstream/) — `from generated.upstream import Client, AuthenticatedClient`, базовый URL шлюза задаётся при создании клиента (`base_url` из env).

### Pydantic-модели контракта браузер → BFF

Слияние [openApi.public.yaml](../../openapi/openApi.public.yaml) + [openApi.sso.yaml](../../openapi/openApi.sso.yaml) → [openapi/bundles/openApi.bff.browser.yaml](../../openapi/bundles/openApi.bff.browser.yaml) (скрипт [scripts/merge_browser_openapi.py](./scripts/merge_browser_openapi.py)), затем `datamodel-code-generator` → один файл моделей:

Из корня монорепо:

```bash
pnpm run generate:bff:browser-models
```

Импорт в BFF: `from generated.bff_browser_models import UserDto, SsoLoginBody, PageTransactionOperation, …`

Контракт WebSocket истории операций: [openapi/asyncApi.transactions.yaml](../../openapi/asyncApi.transactions.yaml) (канал `transactionsStream`, URL `/api/ws/transactions`). На фронте типы: **`@fins/api/ws`**. Для Python BFF отдельный кодген из AsyncAPI пока не подключаем (Modelina `--pyDantic` даёт невалидный код); пересечения с REST — из `generated.bff_browser_models`.

## Статика SSO

После `pnpm --filter @fins/sso build` скопируйте содержимое `apps/sso/dist/` в `services/bff/static/sso/` (каталог создаётся вручную или скриптом/CI). Пока каталог пустой или отсутствует, статика не монтируется — работают только `/health` и `/api`.

## Запуск

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Локальные SPA (`pnpm dev:*`) ходят на этот же сервис через прокси Vite: запросы на `/api` с dev-сервера пересылаются сюда (см. корневой README, переменная `BFF_ORIGIN` при необходимости).

- `GET /health` — проверка живости
- `GET /api/v1/ping` — тест API
- **SSO (моки):** `POST /api/user-service/auth/register`, `POST /api/user-service/auth/login`, `GET /api/user-service/auth/validate`, `POST /api/user-service/auth/revoke` — cookie `fins_session` (имя из [.env.example](.env.example) / `SESSION_COOKIE_NAME`)
- **Публичный REST (моки):** пути из [openApi.public.yaml](../../openapi/openApi.public.yaml) под префиксом `/api` — user-service, core-api, credit-service; сессия для большинства маршрутов; internal user — `X-API-KEY` + `BFF_SERVICE_API_KEY` в [.env.example](.env.example)
  - `GET /api/user-service/users` — полный список `UserDto`, **только если у сессии есть роль `WORKER`**
  - `GET /api/user-service/users/directory` — краткий справочник: `userId`, `username`, `mainAccountCurrency` (основной счёт из мок-сидинга). У пользователя в `UserDto` может не быть ролей; `CLIENT` и `WORKER` могут быть одновременно.
- **WebSocket:** `WS /api/ws/transactions` — после входа cookie `subscribe` / `unsubscribe` по контракту [asyncApi.transactions.yaml](../../openapi/asyncApi.transactions.yaml); push новых операций после `withdraw` / `enroll`
- `GET /` — SPA SSO, если `static/sso` существует

### Мок-пользователи (логин `POST /api/user-service/auth/login`)

Пароли и роли задаются в [`app/mock_store.py`](app/mock_store.py) (`_seed_bff_mocks`). У каждого пользователя при первом запросе к счетам создаётся свой набор демо-счетов (у каждого ровно один **основной** счёт; валюты счетов — псевдослучайно от `user_id`).

| Email | Пароль | Роль / примечание |
| --- | --- | --- |
| `test@email.com` | `asdfasdf123` | `CLIENT` + `WORKER` (и клиентское приложение, и админские маршруты) |
| `alice@demo.local` | `demo123` | `CLIENT` + `WORKER` |
| `bob@demo.local` | `demo123` | **без ролей** — проверка пустого `roles` |
| `worker@demo.local` | `demo123` | `CLIENT` + `WORKER` |
| `blocked@demo.local` | `demo123` | неактивен (`active: false`) — **вход отклоняется**, для проверки недоступных учёток |

CORS для dev: список origins в `CORS_ORIGINS` (см. `.env.example`); для `credentials: include` нельзя использовать `*`.

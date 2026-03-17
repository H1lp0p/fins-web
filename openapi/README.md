# OpenAPI контракты

| Файл | Назначение |
|------|------------|
| [openApi.backend-gateway.yaml](./openApi.backend-gateway.yaml) | Полный слепок шлюза бекенда — **источник правды** при обновлении с бэка. После правок вручную пересобирайте разбиение (или добавьте скрипт split). |
| [openApi.public.yaml](./openApi.public.yaml) | Все пути **кроме** `/user-service/auth/*` — user/admin, общий BFF, кодген без auth-маршрутов. Включает `internal` (сервис-сервис); для браузерного клиента при необходимости исключайте пути отдельным фильтром codegen. |
| [openApi.sso.yaml](./openApi.sso.yaml) | Только `/user-service/auth/*` — приложение SSO и BFF-слой авторизации. |
| [bundles/openApi.bff.browser.yaml](./bundles/openApi.bff.browser.yaml) | **Сборка** `public` + `sso` (скрипт [merge_browser_openapi.py](../services/bff/scripts/merge_browser_openapi.py), без дублей `components`). Не править вручную — перегенерировать перед `datamodel-codegen`. |
| [asyncApi.transactions.yaml](./asyncApi.transactions.yaml) | **AsyncAPI 2.6** — WebSocket `/api/ws/transactions`: подписка на операции по `accountId`, снимок `PageTransactionOperation`, события `transaction`, ошибки `error`. Схемы согласованы с OpenAPI (в т.ч. `transactionActoin`). |

**Совместное покрытие:** `public` ∪ `sso` **не обязано** совпадать с `backend-gateway`: `sso` — урезанный контракт под короткий поток SSO (без `/auth/refresh` и OAuth). Полный набор путей шлюза — только в `openApi.backend-gateway.yaml`.

**Потребители:** `packages/api` (RTK codegen), будущий BFF, любые другие генераторы — указывайте путь к нужному YAML из корня монорепо, например `openapi/openApi.public.yaml`.

**Корень репозитория:** прежний `openApi.yaml` удалён; полный контракт лежит в `openapi/openApi.backend-gateway.yaml`.

**Два уровня контракта (секьюрити):**

- **`openApi.backend-gateway.yaml`** — как шлюз бекенда: **`JWT` bearer** (и прочее), то есть то, чем пользуется **BFF → шлюз**, а не браузер.
- **`openApi.public.yaml`** и **`openApi.sso.yaml`** — контракт **браузер → BFF**: **`BffSessionCookie`** (`apiKey` + `in: cookie`, плейсхолдер имени `fins_session`). В SPA нет доступа к JWT бекенда; BFF по сессии сам выставляет `Authorization` на шлюз. У `public` для `/user-service/internal/*` задана отдельная схема **`BffServiceApiKey`** (`X-API-KEY`) — типичный сервисный вызов, не пользовательская кука. В `sso` у `login` и `register` указано **`security: []`** (ещё нет сессии); у `revoke` / `validate` — сессионная кука. Эндпоинт **`/auth/refresh`** в SSO-спеке отсутствует (короткий поток SSO → редирект; продление сессии — у клиентов с длительной сессией и BFF). Схема **`JwtModelDto`** есть только в **`openApi.backend-gateway.yaml`** (ответы шлюза для BFF).

В **`openApi.sso.yaml`** ответы login/register описаны без тела с JWT (куки через BFF); **`JwtModelDto`** там не используется.

---

## Кодогенерация (матрица контракт → артефакты)

Единая точка входа из корня монорепо:

```bash
pnpm run generate:contracts
```

Команда из корня: RTK (`@fins/api`), затем upstream-клиент Python и Pydantic-модели браузер → BFF (нужен `pip install -e ".[dev]"` в `services/bff`, см. [services/bff/README.md](../services/bff/README.md)).

| Источник | Генератор | Выход | Статус |
|----------|-----------|--------|--------|
| [openApi.public.yaml](./openApi.public.yaml) + [openApi.sso.yaml](./openApi.sso.yaml) (bundle через Redocly в `packages/api`) | `@rtk-query/codegen-openapi` | [packages/api/src/generated/](../packages/api/src/generated/) — `generatedPublicApi`, `generatedSsoApi` | **есть** |
| [bundles/openApi.bff.browser.yaml](./bundles/openApi.bff.browser.yaml) | `datamodel-code-generator` (Pydantic v2, только `components`/схемы) | [services/bff/generated/bff_browser_models.py](../services/bff/generated/bff_browser_models.py) — `from generated.bff_browser_models import …` | **есть** (`pnpm run generate:bff:browser-models`) |
| Тот же bundle | OpenAPI Generator `python-fastapi` (опционально) | скелеты FastAPI-роутов | планируется |
| [openApi.backend-gateway.yaml](./openApi.backend-gateway.yaml) | `openapi-python-client` (async `httpx`, конфиг [openapi-python-client.upstream.yaml](../services/bff/openapi-python-client.upstream.yaml)) | [services/bff/generated/upstream/](../services/bff/generated/upstream/) — импорт `from generated.upstream import Client, AuthenticatedClient` | **есть** |
| [asyncApi.transactions.yaml](./asyncApi.transactions.yaml) | `@asyncapi/modelina-cli` → TypeScript | [packages/api/src/generated/ws/](../packages/api/src/generated/ws/) + entry **`@fins/api/ws`** ([src/ws.ts](../packages/api/src/ws.ts)), парсер [transactions-ws-parse.ts](../packages/api/src/lib/transactions-ws-parse.ts); постпатч под `verbatimModuleSyntax` — [patch-ws-modelina-output.mjs](../packages/api/scripts/patch-ws-modelina-output.mjs) | **есть** (`pnpm run generate:ws-types` или `generate:api`) |
| тот же YAML | Modelina → Python | не используем: вывод `--pyDantic` некорректен; в BFF — JSON + при необходимости модели из `bff_browser_models` | отложено |

**Порядок после появления всех генераторов:** bundle OpenAPI для TS → RTK; bundle для BFF browser → Pydantic; bundle/сырой gateway → upstream-клиент; AsyncAPI → WS. Детали BFF см. [services/bff/README.md](../services/bff/README.md).

# OpenAPI контракты

| Файл | Назначение |
|------|------------|
| [openApi.backend-gateway.yaml](./openApi.backend-gateway.yaml) | Полный слепок шлюза бекенда — **источник правды** при обновлении с бэка. После правок вручную пересобирайте разбиение (или добавьте скрипт split). |
| [openApi.public.yaml](./openApi.public.yaml) | Все пути **кроме** `/user-service/auth/*` — user/admin, общий BFF, кодген без auth-маршрутов. Включает `internal` (сервис-сервис); для браузерного клиента при необходимости исключайте пути отдельным фильтром codegen. |
| [openApi.sso.yaml](./openApi.sso.yaml) | Только `/user-service/auth/*` — приложение SSO и BFF-слой авторизации. |

**Совместное покрытие:** `public` ∪ `sso` **не обязано** совпадать с `backend-gateway`: `sso` — урезанный контракт под короткий поток SSO (без `/auth/refresh` и OAuth). Полный набор путей шлюза — только в `openApi.backend-gateway.yaml`.

**Потребители:** `packages/api` (RTK codegen), будущий BFF, любые другие генераторы — указывайте путь к нужному YAML из корня монорепо, например `openapi/openApi.public.yaml`.

**Корень репозитория:** прежний `openApi.yaml` удалён; полный контракт лежит в `openapi/openApi.backend-gateway.yaml`.

**Два уровня контракта (секьюрити):**

- **`openApi.backend-gateway.yaml`** — как шлюз бекенда: **`JWT` bearer** (и прочее), то есть то, чем пользуется **BFF → шлюз**, а не браузер.
- **`openApi.public.yaml`** и **`openApi.sso.yaml`** — контракт **браузер → BFF**: **`BffSessionCookie`** (`apiKey` + `in: cookie`, плейсхолдер имени `fins_session`). В SPA нет доступа к JWT бекенда; BFF по сессии сам выставляет `Authorization` на шлюз. У `public` для `/user-service/internal/*` задана отдельная схема **`BffServiceApiKey`** (`X-API-KEY`) — типичный сервисный вызов, не пользовательская кука. В `sso` у `login` и `register` указано **`security: []`** (ещё нет сессии); у `revoke` / `validate` — сессионная кука. Эндпоинт **`/auth/refresh`** в SSO-спеке отсутствует (короткий поток SSO → редирект; продление сессии — у клиентов с длительной сессией и BFF). Схема **`JwtModelDto`** есть только в **`openApi.backend-gateway.yaml`** (ответы шлюза для BFF).

В **`openApi.sso.yaml`** ответы login/register описаны без тела с JWT (куки через BFF); **`JwtModelDto`** там не используется.

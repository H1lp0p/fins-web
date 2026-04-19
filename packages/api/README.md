# @fins/api

Redux Toolkit Query-клиент к BFF + утилиты (ошибки BFF, уведомления SSE, хелперы для экранов ошибок).

## Зависимости

Из корня монорепо: `pnpm install`. Пакет собирается в `dist/` и подключается приложениями как workspace.

## Сборка

```bash
# из корня
pnpm --filter @fins/api build
```

После изменений в `src/` без codegen достаточно `build`. Фронты подтягивают уже собранный `dist`.

## Кодогенерация (OpenAPI → RTK + WS типы)

Запускать из **корня** репозитория (нужны devDependencies пакета и `openapi/`):

```bash
pnpm run generate:api
```

Внутри: бандл `openApi.public.yaml` / `openApi.sso.yaml` → `rtk-query-codegen-openapi` → `generated/public/`, `generated/sso/`; AsyncAPI → типы WebSocket в `generated/ws/`.

Инициализация базового URL в приложении: `initPublicBffApi` / `initSsoBffApi` до первого запроса (см. `store.ts` в apps).

## Точки входа

| Import | Назначение |
|--------|------------|
| `@fins/api` | Публичный API, `generatedPublicApi`, хуки, сущности, формы |
| `@fins/api/sso` | Только SSO-эндпоинты + валидация форм логина/регистрации |
| `@fins/api/ws` | Типы и парсер сообщений WS транзакций + `useTransactionsWebSocket` |

## Разработка

При смене контрактов в `openapi/*.yaml` — снова `pnpm run generate:api`, затем `pnpm --filter @fins/api build`, затем сборка приложений.

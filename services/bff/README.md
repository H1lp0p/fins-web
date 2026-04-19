# BFF (FastAPI)

Прокси между браузером и основным бекендом (API Gateway), плюс SSO-сессия (cookie), опционально — мок банка без gateway.

## Требования

- Python ≥ 3.11  
- Для кодогенерации upstream-клиента: `pip install -e ".[dev]"` (см. ниже)

## Установка и запуск (локально)

```bash
cd services/bff
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -e .
# опционально инструменты codegen:
pip install -e ".[dev]"
```

Скопируйте `services/bff/.env.example` → `services/bff/.env` и задайте переменные (см. комментарии в `.env.example`).

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8009
```

Проверка: `GET http://127.0.0.1:8000/health` → `{"status":"ok"}`. Публичное API под префиксом `/api`.

Фронты в dev проксируют на BFF через `BFF_ORIGIN` (см. корневой `.env.example` в монорепо).

## Как устроено


| Часть                                            | Назначение                                                                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/routers/public.py`                          | Включает либо `public_upstream` (есть `UPSTREAM_BASE_URL`), либо `public_mock` (мок-хранилище).                                                                         |
| `app/routers/public_upstream.py`                 | Маршруты `/api/...` → вызовы **сгенерированного** клиента `generated/upstream/` к gateway.                                                                              |
| `app/routers/sso.py`                             | Регистрация/логин/revoke; при upstream — прокси к auth в gateway, cookie-сессия.                                                                                        |
| `app/routers/ws_transactions.py`                 | WebSocket `/api/ws/transactions`.                                                                                                                                       |
| `app/routers/notifications_proxy.py`             | Уведомления: REST (unread/all/read), SSE subscribe, FCM `POST/DELETE …/fcm/token`; при настроенном URL — прокси на notification-service, иначе мок-SSE и no-op для FCM. |
| `app/upstream_runtime.py`, `upstream_context.py` | httpx-клиенты к `UPSTREAM_BASE_URL`, Bearer и заголовки `X-USER-ID` / `X-USER-ROLES` на нужных путях.                                                                   |
| `generated/upstream/`                            | **Кодоген** из `openapi/openApi.backend-gateway.yaml` (`openapi-python-client`). Не править руками.                                                                     |
| `generated/bff_browser_models.py`                | Pydantic-модели для ответов/ошибок в формате, ожидаемом фронтом (отдельный скрипт codegen).                                                                             |
| Логи                                             | Файл `logs/bff.log` (создаётся при старте).                                                                                                                             |


Режим **без** `UPSTREAM_BASE_URL`: данные из `mock_store`, подходит для UI без бекенда.

Режим **с** `UPSTREAM_BASE_URL`: все вызовы из `public_upstream` идут на указанный базовый URL gateway.

## Кодогенерация (обновить после смены контракта gateway)

Из **корня** монорепо (нужен установленный `services/bff` с `[dev]`):

```bash
pnpm run generate:contracts
```

Или по шагам:


| Что                                       | Команда                                  |
| ----------------------------------------- | ---------------------------------------- |
| RTK Query + WS типы (`packages/api`)      | `pnpm run generate:api`                  |
| Python-клиент `generated/upstream/`       | `pnpm run generate:bff:upstream`         |
| `generated/bff_browser_models.py`         | `pnpm run generate:bff:browser-models`   |
| Пересобрать merged spec gateway из кусков | `pnpm run merge:openapi:backend-gateway` |


Источник правды по путям gateway: `openapi/openApi.backend-gateway.yaml` (часто собирается из `openapi/from-backend/`).

После codegen — перезапуск BFF; при изменении только фронтовых контрактов — пересборка `@fins/api`.

## Статика SSO под корнем BFF

Сборка SSO: из корня `pnpm --filter @fins/sso build`. Содержимое `apps/sso/dist/` скопировать в `services/bff/static/sso/` (см. `static/README.md`). Тогда BFF отдаёт SPA на `/` при непустой папке.

## Деплой (кратко)

1. Установить зависимости: `pip install -e .` в образе/на сервере.
2. Задать `.env`: `UPSTREAM_BASE_URL`, `SESSION_SECRET`, `CORS_ORIGINS` под реальные origin фронтов, при HTTPS — `COOKIE_SECURE=true`, согласовать `COOKIE_SAMESITE`.
3. Запуск: `uvicorn app.main:app --host 0.0.0.0 --port 8000` (в проде за reverse proxy + gunicorn/uvicorn workers по политике команды).
4. Убедиться, что фронты стучатся на тот же origin, что в `CORS_ORIGINS`, и cookie-сессия не блокируется браузером.

Docker-сборка всего стенда: см. `deploy/README.md`.

## Отладка и типичные поломки


| Симптом                                         | Что проверить                                                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| CORS error в браузере                           | `CORS_ORIGINS` содержит точный origin (схема + хост + порт).                                                                              |
| 401 на `/api` после логина                      | Cookie не доходит: домен/path, `SameSite`, смешение http/https, другой порт без прокси.                                                   |
| SSL errors к upstream                           | `UPSTREAM_VERIFY_SSL=false` только временно в dev; в проде — валидный сертификат.                                                         |
| 404/не те пути к бекенду                        | Gateway URL и префиксы в спеке; после смены API — `merge` + `generate:bff:upstream` и деплой нового `generated/upstream`.                 |
| Ошибки парсинга ответа на фронте                | Сверить `bff_browser_models` codegen с тем, что реально отдаёт BFF (`finish_upstream_response` / нормализация в `public_upstream_shape`). |
| Пустой notification SSE / FCM не регистрируется | `NOTIFICATION_SERVICE_BASE_URL` или мок-флаги; FCM-токен без upstream — no-op 200; см. `app/routers/notifications_proxy.py`.              |


Логи upstream при `UPSTREAM_REQUEST_LOG=true` смотреть в консоли/файле `logs/bff.log`.
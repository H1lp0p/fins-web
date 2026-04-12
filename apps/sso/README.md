# SSO (логин / регистрация)

Vite + React, порт по умолчанию **5175**.

## Запуск в dev

Из **корня** монорепо:

```bash
pnpm dev:sso
```

## Сборка

```bash
pnpm --filter @fins/sso build
```

Артефакт: `apps/sso/dist/`.

## Раздача через BFF

Чтобы открывать SSO с того же хоста, что и BFF: скопировать `apps/sso/dist/*` → `services/bff/static/sso/` (см. `services/bff/static/README.md` и `services/bff/README.md`).

## Окружение

`VITE_BFF_URL` — базовый URL API BFF (или `/api` через прокси в dev).

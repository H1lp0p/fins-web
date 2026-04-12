# Клиентское приложение (user)

Vite + React, порт по умолчанию **5173** (см. `vite.config.ts`).

## Запуск в dev

Из **корня** монорепо (прокси `/api` → BFF, см. `BFF_ORIGIN` в `.env`):

```bash
pnpm dev:user
```

Либо из папки приложения: `pnpm dev`.

## Сборка

```bash
pnpm --filter @fins/user build
```

Артефакты: `apps/user/dist/`. Превью: `pnpm preview` внутри пакета.

## Окружение

- Переменные Vite: префикс `VITE_`. Типично `VITE_BFF_URL` — если не задан, запросы идут на относительный `/api` (прокси dev-сервера на BFF).

## Зависимости от пакетов

`@fins/api`, `@fins/entities`, `@fins/ui-kit` — перед первой сборкой выполнить `pnpm build` в корне или собрать эти пакеты по отдельности.

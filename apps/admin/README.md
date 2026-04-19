# Приложение сотрудника (admin)

Vite + React, порт по умолчанию **5174** (см. `vite.config.ts`).

## Запуск в dev

Из **корня** монорепо:

```bash
pnpm dev:admin
```

Либо: `cd apps/admin && pnpm dev`.

## Сборка

```bash
pnpm --filter @fins/admin build
```

Выход: `apps/admin/dist/`.

## Окружение

`VITE_*` переменные; без `VITE_BFF_URL` используется относительный `/api` и прокси на BFF в dev.

## Зависимости

Требуют собранные `@fins/ui-kit`, `@fins/api`, `@fins/entities` (корневой `pnpm build`).

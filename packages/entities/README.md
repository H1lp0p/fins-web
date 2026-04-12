# @fins/entities

Общие UI-сущности и стили для клиентских приложений (зависит от `@fins/ui-kit` и `@fins/api`).

## Сборка

```bash
pnpm --filter @fins/entities build
```

Стили: после сборки подключать `import "@fins/entities/style.css"` в приложениях (как в `main.tsx`).

## Разработка

Сначала собрать зависимости: `pnpm --filter @fins/ui-kit build`, `pnpm --filter @fins/api build`, затем этот пакет. Полная цепочка: `pnpm build` из корня монорепо.

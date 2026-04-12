# @fins/ui-kit

Общие React-компоненты, тема, типографика (без бизнес-логики банка).

## Сборка

```bash
pnpm --filter @fins/ui-kit build
```

## Использование в приложениях

```tsx
import "@fins/ui-kit/style.css";
```

Тема: `data-theme` на `<html>` или `getFinsTheme` / `setFinsTheme` из пакета.

Пакет без собственного `dev`-сервера — разработка через любое приложение (`pnpm dev:user` и т.д.) с workspace-зависимостью.

## Порядок сборки монорепо

`ui-kit` собирается первым (см. корневой `pnpm build`).

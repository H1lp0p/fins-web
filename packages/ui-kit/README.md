# @fins/ui-kit

## Шрифты

**Kelly Slab** (вес 400) — см. `src/styles/fonts.css`, зависимость `@fontsource/kelly-slab`. После `pnpm build` стили шрифта попадают в **`dist/style.css`**.

В приложениях:

```ts
import "@fins/ui-kit/style.css";
```

CSS-переменная: **`--font-family-kelly-slab`**.

Классы типографики (пример + заготовка под Figma): **`src/styles/typography.css`** — префикс `.text-*` / по мере переноса из Figma.

## Темы (`data-theme`)

Файл **`src/styles/themes.css`**: цвета для `dark`

На `<html>` задай `data-theme="dark"`. Из JS:

```ts
import { setFinsTheme } from "@fins/ui-kit";
setFinsTheme("dark");
```

После правок в `src/styles/` пересобери kit: `pnpm --filter @fins/ui-kit build`.

**CSS Modules (`*.module.css`) в ui-kit не используйте:** при `vite build` в режиме library стили уходят в `style.css`, а объект классов в `dist/index.js` остаётся пустым — `className` будет `undefined`. Для компонентов пакета — обычный CSS с префиксом класса (например `.fins-card-container`) и `import "./component.css"`.

## Сборка

```bash
pnpm --filter @fins/ui-kit build
```

Приложения импортируют **`dist/style.css`**, а не `src/*.css`. После правок в `src/styles/` пересобери kit, иначе в dev не попадут новые классы.
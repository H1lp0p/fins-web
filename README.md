# Fins — монорепозиторий

Фронтенды на **Vite + React + TypeScript**, общий пакет **`@fins/ui-kit`**, **BFF** на FastAPI, прод-сборка через **Docker + nginx** (три поддомена).

---

## Требования

| Инструмент | Зачем |
|------------|--------|
| [Node.js](https://nodejs.org/) LTS | Сборка фронтов и ui-kit |
| [pnpm](https://pnpm.io/) 9+ | Workspaces монорепо (`packageManager` в корне) |
| Python ≥ 3.11 | Локальный BFF |
| Docker (опционально) | Образы nginx + BFF, см. [deploy/README.md](deploy/README.md) |

Установка pnpm через Corepack (если нет прав на `Program Files`, ставь pnpm отдельно — см. документацию pnpm):

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

---

## Структура репозитория

| Путь | Пакет / роль |
|------|----------------|
| [packages/ui-kit](packages/ui-kit) | `@fins/ui-kit` — общие React-компоненты (библиотека, Vite library mode) |
| [apps/sso](apps/sso) | `@fins/sso` — SPA входа (SSO); в `src/` слои FSD |
| [apps/user](apps/user) | `@fins/user` — клиент пользователя; в `src/` слои FSD |
| [apps/admin](apps/admin) | `@fins/admin` — клиент администратора; в `src/` слои FSD |
| [services/bff](services/bff) | FastAPI: `/api`, `GET /health`, раздача **собранного** SSO из `static/sso/` |
| [deploy/](deploy/) | `Dockerfile.*`, nginx, `docker-compose.yml` |
| [openapi/](openapi/) | OpenAPI (и позже AsyncAPI) — контракты и кодогенерация |

Корневой [tsconfig.base.json](tsconfig.base.json) расширяют приложения и ui-kit.

### Контракты и кодогенерация

После правок YAML в [openapi/](openapi/) пересобери клиент RTK:

```bash
pnpm run generate:contracts
```

Сейчас команда запускает RTK codegen, **Python-клиент BFF → шлюз** и **Pydantic-модели** по объединённому контракту браузер → BFF (`generate:bff:upstream`, `generate:bff:browser-models`). В `services/bff` для Python-шагов нужно `pip install -e ".[dev]"`. Типы WebSocket (история операций): импорт `import { … } from "@fins/api/ws"`, см. [openapi/README.md](openapi/README.md).

### Feature-Sliced Design (`apps/*`)

В **`apps/sso`**, **`apps/user`**, **`apps/admin`** внутри `src/` заведены слои FSD (пустые каталоги с `.gitkeep`):

| Слой | Назначение |
|------|------------|
| **app** | Инициализация приложения, провайдеры, роутинг, глобальные стили |
| **pages** | Страницы, сборка виджетов и фич |
| **widgets** | Крупные самостоятельные блоки интерфейса |
| **features** | Пользовательские сценарии и действия |
| **entities** | Бизнес-сущности, модели, привязанный к ним UI |
| **shared** | Переиспользуемый код без привязки к домену (ui, lib, api, config) |

Сейчас **`main.tsx`** и **`App.tsx`** лежат в корне `src/`; по мере развития проекта имеет смысл перенести провайдеры и роутер в **`app/`**, страницы — в **`pages/`**. **`@fins/ui-kit`** — отдельный пакет дизайн-системы, не заменяет слой `shared` в приложении.

---

## Переменные окружения

| Файл | Назначение |
|------|------------|
| [.env.example](.env.example) | Шаблон для **фронта**: `BFF_ORIGIN` (куда Vite проксирует `/api`), подсказки по `VITE_*` |
| [services/bff/.env.example](services/bff/.env.example) | Шаблон для **BFF**: URL основного API, секреты сессий и т.д. (подключение в коде — по мере появления настроек) |

Файлы **`.env` / `.env.local`** не коммитятся (см. [.gitignore](.gitignore)). Скопируй пример: `cp .env.example .env` (или вручную на Windows).

- **`BFF_ORIGIN`** читается **`vite.config.ts`** при запуске dev-сервера; задай в shell перед `pnpm dev:*` или используй **`.env.local` в каталоге конкретного приложения** (`apps/user/.env.local` и т.д.) — Vite подхватывает env из **корня этого приложения**, не из монорепо.
- Для BFF после появления чтения настроек из env положи **`services/bff/.env`** по образцу `services/bff/.env.example`.

---

## Первый запуск

```bash
pnpm install
pnpm build
```

`pnpm build` в корне **сначала** собирает `@fins/ui-kit`, **затем** все приложения в `apps/*` — так нужно, потому что в `package.json` ui-kit в `exports` указывает на **`dist/`**.

---

## Разработка UI-kit (`@fins/ui-kit`)

### Где код

- Исходники: [packages/ui-kit/src](packages/ui-kit/src)
- Публичный вход: `src/index.ts` — реэкспорт компонентов и типов.
- React у ui-kit объявлен как **peerDependency**; в приложениях используется **одна** копия React из приложения.

### Сборка библиотеки

```bash
pnpm --filter @fins/ui-kit build
```

Артефакты: `packages/ui-kit/dist/` (`*.js` + `*.d.ts`).

### Шрифт Kelly Slab

Шрифт подключается **статически** через пакет [`@fontsource/kelly-slab`](https://www.npmjs.com/package/@fontsource/kelly-slab) (woff встроен в CSS при сборке kit). В глобальных стилях доступна переменная **`--font-family-kelly-slab`**.

В каждом приложении в `main.tsx` уже есть:

```ts
import "@fins/ui-kit/style.css";
```

Его нужно оставить **до** остальных стилей, чтобы `@font-face` и переменные применялись. В `index.css` приложений для текста по умолчанию задано `font-family: var(--font-family-kelly-slab), serif`.

**Темы:** на `<html>` атрибут `data-theme="light" | "dark"`, палитра **`--fins-c1`…`--fins-c8`** и плавная смена цветов — в [packages/ui-kit/src/styles/themes.css](packages/ui-kit/src/styles/themes.css); переключение из JS: `setFinsTheme` из `@fins/ui-kit` (см. [packages/ui-kit/README.md](packages/ui-kit/README.md)).

### Использование в приложениях

В `apps/*` уже есть зависимость `"@fins/ui-kit": "workspace:*"`. Импорт компонентов:

```tsx
import { Button } from "@fins/ui-kit";
```

### Типичный цикл

1. Меняешь компоненты в `packages/ui-kit/src`.
2. Либо пересобираешь kit (`pnpm --filter @fins/ui-kit build`), либо держишь открытым dev-сервер приложения — Vite подтягивает workspace-пакет; для **production build** приложения **dist ui-kit должен быть актуален** (корневой `pnpm build` делает это в правильном порядке).

---

## Разработка клиентов (`sso`, `user`, `admin`)

### Dev-сервер

```bash
pnpm dev:sso    # SSO
pnpm dev:user   # пользователь
pnpm dev:admin  # админка
```

Каждый проект — отдельный Vite dev server (порты по умолчанию 5173, при нескольких — следующие свободные).

### Прокси на BFF

Запросы браузера на **`/api`** на dev-сервере проксируются на BFF:

- По умолчанию: **`http://127.0.0.1:8000`**
- Переопределение: переменная **`BFF_ORIGIN`** (пример: `BFF_ORIGIN=http://127.0.0.1:9000 pnpm dev:user`)

Для путей под `/api` включён прокси **WebSocket** (`ws: true`).

Чтобы проверить цепочку: подними BFF (см. ниже) и открой в приложении, например, `fetch("/api/v1/ping")`.

### Сборка одного приложения

```bash
pnpm --filter @fins/ui-kit build   # если менялся kit
pnpm --filter @fins/user build
```

Артефакт: `apps/<имя>/dist/`.

### Сборка всех фронтов

```bash
pnpm build
```

(сначала ui-kit, потом все `apps/*`.)

---

## Разработка BFF (`services/bff`)

Подробности и команды — [services/bff/README.md](services/bff/README.md). Кратко:

### Окружение

```bash
cd services/bff
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
pip install -e .
```

### Запуск API + раздача SSO (локально)

1. Собери SSO: из корня `pnpm --filter @fins/sso build`.
2. Скопируй содержимое **`apps/sso/dist/`** в **`services/bff/static/sso/`** (каталог в `.gitignore`; в Docker это делает образ).
3. Запуск:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **`GET /health`** — проверка живости.
- **`GET /api/v1/ping`** — тест API.
- Если **`static/sso` непустой** — корень **`/`** отдаёт SPA SSO (`StaticFiles` + fallback для клиентского роутинга).

Если статики нет — работают только `/health` и `/api`.

### Связка с клиентами в dev

Клиенты на Vite шлют **`/api`** на этот же процесс (через прокси). Порт BFF должен совпадать с тем, что ожидает Vite (`8000` или `BFF_ORIGIN`).

---

## Сборка «как в проде» без Docker

1. `pnpm build` — ui-kit + три SPA.
2. BFF: скопировать SSO в `services/bff/static/sso/`, установить пакет, запустить `uvicorn` (или собрать свой образ по [deploy/Dockerfile.bff](deploy/Dockerfile.bff)).
3. Статику **user** и **admin** обычно отдаёт nginx (см. [deploy/nginx/default.conf](deploy/nginx/default.conf)); локально можно поднять любой статический сервер на `apps/user/dist` и `apps/admin/dist`.

---

## Docker (nginx + BFF)

Один compose собирает фронты внутри образов и поднимает **nginx** + **bff**:

```bash
docker compose -f deploy/docker-compose.yml up --build
```

URL, проверка API и смена порта — [deploy/README.md](deploy/README.md).

---

## Полезные команды (шпаргалка)

| Задача | Команда |
|--------|---------|
| Установить зависимости | `pnpm install` |
| Собрать всё (kit + apps) | `pnpm build` |
| Собрать только ui-kit | `pnpm --filter @fins/ui-kit build` |
| Dev SSO / user / admin | `pnpm dev:sso` / `dev:user` / `dev:admin` |
| Список workspace-пакетов | `pnpm -r list --depth -1` |

---

## Частые вопросы

**Почему `pnpm build` сначала трогает ui-kit?**  
В приложениях импорт идёт в `@fins/ui-kit`, а в манифесте пакета указаны файлы из **`dist/`**. Без сборки kit прод-сборка приложений может устареть или упасть.

**Где лежит SSO для BFF?**  
В репозитории не коммитится: `services/bff/static/sso/` в `.gitignore`. Локально — копия после `pnpm --filter @fins/sso build`; в Docker — шаг в [deploy/Dockerfile.bff](deploy/Dockerfile.bff).

**Разные порты Vite при трёх dev-серверах**  
Запускай по очереди или смотри вывод Vite в терминале — порты назначаются автоматически.

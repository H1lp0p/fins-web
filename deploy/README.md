# Deploy

Сборка и запуск через Docker Compose.

## Запуск

Из **корня** репозитория:

```bash
docker compose -f deploy/docker-compose.yml up --build
```

По умолчанию хост **8080** → nginx **80**. Примеры URL: `http://auth.localhost:8080`, `http://user.localhost:8080`, `http://admin.localhost:8080`.

Проверка BFF за прокси:

```bash
curl http://user.localhost:8080/api/v1/ping
```

Чтобы пробросить порт 80 на хост, измените маппинг в `docker-compose.yml` (на Windows может понадобиться запуск от администратора).

## Связка с кодом

- Образы и nginx обычно собирают фронты и BFF; детали — в `deploy/docker-compose.yml` и Dockerfile’ах рядом.
- Переменные окружения для production задаются в compose или в `.env`, согласованно с [`services/bff/.env.example`](../services/bff/.env.example) и фронтовыми `VITE_*`.

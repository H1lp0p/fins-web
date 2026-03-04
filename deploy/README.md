# Docker / nginx

Сборка фронтов внутри образов, единая сеть Compose: **nginx** отдаёт user/admin и проксирует на **BFF** (SSO + `/api`).

## Запуск

Из **корня репозитория**:

```bash
docker compose -f deploy/docker-compose.yml up --build
```

Открой в браузере (порт **8080** на хосте → 80 в контейнере):

- http://auth.localhost:8080/ — SSO через BFF
- http://user.localhost:8080/ — клиент пользователя; API BFF: http://user.localhost:8080/api/…
- http://admin.localhost:8080/ — админка

Поддомены `*.localhost` обычно указывают на `127.0.0.1` без правки `hosts`. Если не открывается — добавь в `hosts` строки для `auth.localhost`, `user.localhost`, `admin.localhost`.

## Проверка API

```bash
curl http://user.localhost:8080/api/v1/ping
```

## Порты

Чтобы слушать 80 на хосте, в `docker-compose.yml` замени `8080:80` на `80:80` (на Windows может понадобиться запуск от администратора).

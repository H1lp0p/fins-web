# Deploy

```bash
docker compose -f deploy/docker-compose.yml up --build
```

Defaults: host `8080` → nginx `80`. URLs: `http://auth.localhost:8080`, `http://user.localhost:8080`, `http://admin.localhost:8080`.

```bash
curl http://user.localhost:8080/api/v1/ping
```

To bind host port 80, set `80:80` in `docker-compose.yml` (may need admin on Windows).

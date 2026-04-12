# Статика SSO для BFF

После `pnpm --filter @fins/sso build` скопируйте содержимое `apps/sso/dist/` в эту папку. Тогда BFF отдаёт SPA на `/`, если каталог не пустой (см. [`../README.md`](../README.md)).

Папка в `.gitignore`; в репозиторий не коммитится.

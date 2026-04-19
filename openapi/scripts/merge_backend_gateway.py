from __future__ import annotations
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Need PyYAML: pip install pyyaml", file=sys.stderr)
    raise
ROOT = Path(__file__).resolve().parents[1]
FROM_BACKEND = ROOT / "from-backend"
OUT = ROOT / "openApi.backend-gateway.yaml"
MERGE_ORDER: list[tuple[str, str]] = [
    ("userservicejson.json", "/user-service"),
    ("coreapi.json", "/core-api"),
    ("trans.json", "/core-api"),
    ("creditservice.json", "/credit-service"),
    ("prefs.json", "/preferences-service"),
]


def _merge_schemas(target: dict, incoming: dict, source: str) -> None:
    if not incoming:
        return
    existing = target.setdefault("schemas", {})
    for name, schema in incoming.items():
        if name in existing and existing[name] != schema:
            raise SystemExit(
                f"Schema conflict: {name!r} differs between merges (while processing {source})"
            )
        existing[name] = schema


def _merge_security_schemes(target: dict, incoming: dict, source: str) -> None:
    if not incoming:
        return
    existing = target.setdefault("securitySchemes", {})
    for name, scheme in incoming.items():
        if name in existing and existing[name] != scheme:
            raise SystemExit(
                f"securitySchemes conflict: {name!r} (while processing {source})"
            )
        existing[name] = scheme


def main() -> None:
    merged_paths: dict = {}
    components: dict = {}
    for filename, prefix in MERGE_ORDER:
        path = FROM_BACKEND / filename
        if not path.is_file():
            raise SystemExit(f"Missing: {path}")
        with path.open(encoding="utf-8") as f:
            spec = json.load(f)
        comp = spec.get("components") or {}
        _merge_schemas(components, comp.get("schemas"), filename)
        _merge_security_schemes(components, comp.get("securitySchemes"), filename)
        for p, item in (spec.get("paths") or {}).items():
            if not p.startswith("/"):
                raise SystemExit(f"Unexpected path {p!r} in {filename}")
            full = f"{prefix}{p}"
            if full in merged_paths:
                raise SystemExit(
                    f"Duplicate path after merge: {full} (from {filename})"
                )
            merged_paths[full] = item
    out_spec = {
        "openapi": "3.0.1",
        "info": {
            "title": "Bank API",
            "description": "Полный контракт шлюза. Собрано из openapi/from-backend/*.json (скрипт scripts/merge_backend_gateway.py). Сплиты: openApi.public.yaml + openApi.sso.yaml.",
            "version": "1.0",
        },
        "servers": [
            {
                "url": "http://api.thallassianangel.su/api",
                "description": "Прод: шлюз; имя сервиса — первый сегмент пути (user-service, core-api, …).",
            },
            {
                "url": "http://localhost:8000/api",
                "description": "Локальная разработка (порт по окружению).",
            },
        ],
        "security": [{"JWT": []}],
        "paths": dict(sorted(merged_paths.items(), key=lambda x: x[0])),
        "components": components,
    }
    OUT.write_text(
        yaml.dump(
            out_spec, allow_unicode=True, default_flow_style=False, sort_keys=False
        ),
        encoding="utf-8",
    )
    print(f"Wrote {OUT} ({len(merged_paths)} paths)")


if __name__ == "__main__":
    main()

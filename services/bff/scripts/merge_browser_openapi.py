"""Собрать openApi.public.yaml + openApi.sso.yaml в один YAML для кодгена BFF (без дублей components)."""

from __future__ import annotations

import copy
from pathlib import Path

import yaml

# services/bff/scripts → repo root = parents[3]
REPO_ROOT = Path(__file__).resolve().parents[3]
PUBLIC = REPO_ROOT / "openapi" / "openApi.public.yaml"
SSO = REPO_ROOT / "openapi" / "openApi.sso.yaml"
OUT = REPO_ROOT / "openapi" / "bundles" / "openApi.bff.browser.yaml"


def merge() -> Path:
    if not PUBLIC.is_file() or not SSO.is_file():
        raise FileNotFoundError(f"Need {PUBLIC} and {SSO}")
    pub = yaml.safe_load(PUBLIC.read_text(encoding="utf-8"))
    sso = yaml.safe_load(SSO.read_text(encoding="utf-8"))
    merged = copy.deepcopy(pub)
    merged["info"] = {
        **merged.get("info", {}),
        "title": "Bank API — BFF browser (public + SSO)",
        "description": (
            "Слияние openApi.public.yaml и openApi.sso.yaml для кодгена BFF; "
            "не редактировать вручную — пересобрать скриптом."
        ),
        "version": merged.get("info", {}).get("version", "1.0"),
    }
    for path_key, item in (sso.get("paths") or {}).items():
        if path_key in (merged.get("paths") or {}):
            msg = f"merge_browser_openapi: path already exists: {path_key}"
            raise ValueError(msg)
        merged.setdefault("paths", {})[path_key] = copy.deepcopy(item)
    pub_schemas = merged.setdefault("components", {}).setdefault("schemas", {})
    sso_schemas = (sso.get("components") or {}).get("schemas") or {}
    for name, schema in sso_schemas.items():
        if name in pub_schemas:
            continue
        pub_schemas[name] = copy.deepcopy(schema)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        yaml.dump(merged, allow_unicode=True, sort_keys=False, width=120),
        encoding="utf-8",
    )
    return OUT


def main() -> None:
    out = merge()
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()

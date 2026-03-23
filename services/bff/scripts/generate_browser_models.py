from __future__ import annotations
import subprocess
import sys
from pathlib import Path
from merge_browser_openapi import merge as merge_browser_openapi

BFF_DIR = Path(__file__).resolve().parents[1]
BUNDLE = BFF_DIR.parents[1] / "openapi" / "bundles" / "openApi.bff.browser.yaml"
OUT_FILE = BFF_DIR / "generated" / "bff_browser_models.py"


def main() -> None:
    merge_browser_openapi()
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable,
        "-m",
        "datamodel_code_generator",
        "--input",
        str(BUNDLE),
        "--input-file-type",
        "openapi",
        "--output",
        str(OUT_FILE),
        "--output-model-type",
        "pydantic_v2.BaseModel",
        "--target-python-version",
        "3.11",
        "--reuse-model",
        "--enum-field-as-literal",
        "all",
        "--use-annotated",
        "--formatters",
        "ruff-format",
        "ruff-check",
    ]
    print(" ".join(cmd))
    raise SystemExit(subprocess.call(cmd))


if __name__ == "__main__":
    main()

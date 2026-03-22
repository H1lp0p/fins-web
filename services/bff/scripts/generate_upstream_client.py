from __future__ import annotations
import sys
from pathlib import Path
from typer.testing import CliRunner
from openapi_python_client.cli import app

BFF_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BFF_DIR.parents[1]
OPENAPI = REPO_ROOT / "openapi" / "openApi.backend-gateway.yaml"
CONFIG = BFF_DIR / "openapi-python-client.upstream.yaml"
OUTPUT = BFF_DIR / "generated" / "upstream"


def main() -> None:
    if not OPENAPI.is_file():
        print(f"Missing OpenAPI: {OPENAPI}", file=sys.stderr)
        raise SystemExit(1)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    runner = CliRunner()
    result = runner.invoke(
        app,
        [
            "generate",
            "--path",
            str(OPENAPI),
            "--output-path",
            str(OUTPUT),
            "--meta",
            "none",
            "--overwrite",
            "--config",
            str(CONFIG),
        ],
    )
    if result.output:
        print(result.output, end="")
    raise SystemExit(result.exit_code)


if __name__ == "__main__":
    main()

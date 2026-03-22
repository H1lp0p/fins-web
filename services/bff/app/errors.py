from fastapi.responses import JSONResponse

from generated.bff_browser_models import BffErrorBody


def bff_error_response(
    status_code: int,
    *,
    message: str | None = None,
    code: str | None = None,
    field_errors: dict[str, list[str]] | None = None,
) -> JSONResponse:
    body = BffErrorBody(
        message=message,
        code=code,
        fieldErrors=field_errors,
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(mode="json", exclude_none=True),
    )

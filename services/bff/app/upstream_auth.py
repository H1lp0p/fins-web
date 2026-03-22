from __future__ import annotations
from generated.upstream.models.login_model_dto import LoginModelDto
from generated.upstream.models.register_model_dto import RegisterModelDto
from generated.upstream.models.token_refresh_model_dto import TokenRefreshModelDto
from generated.upstream.models.user_dto import UserDto
from generated.upstream.types import UNSET
from app.bff_user import BffUser


def bff_user_from_user_dto(dto: UserDto) -> BffUser:
    roles_raw = dto.roles
    if roles_raw is UNSET or not roles_raw:
        rset: frozenset[str] = frozenset()
    else:
        rset = frozenset(
            (str(x.value) if hasattr(x, "value") else str(x) for x in roles_raw)
        )
    return BffUser(id=dto.id, roles=rset)


def login_body_from_sso(email: str, password: str) -> LoginModelDto:
    return LoginModelDto(email=email, password=password)


def register_body_from_sso(name: str, email: str, password: str) -> RegisterModelDto:
    return RegisterModelDto(name=name, email=email, password=password)


def revoke_body(refresh_token: str) -> TokenRefreshModelDto:
    return TokenRefreshModelDto(value=refresh_token)

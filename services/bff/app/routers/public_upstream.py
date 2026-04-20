from __future__ import annotations
from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, Header, Request, Response
from fastapi.responses import JSONResponse
from app.bff_user import BffUser
from app.config import Settings, get_settings
from app.deps import get_current_user_optional, get_session_token, is_worker_user
from app.errors import bff_error_response
from app.mock_store import MockUser, store
from app.upstream_context import UpstreamContext, get_upstream_context
from generated.upstream.client import AuthenticatedClient
from app.upstream_runtime import anonymous_client, finish_upstream_response
from app.upstream_tx_broadcast import schedule_upstream_tx_broadcast
from generated.bff_browser_models import (
    CardAccountCreateModelDto,
    CreditCreateModelDto,
    CreditRuleDTO,
    Currency,
    EnrollDto,
    TransferMoneyDto,
    UserDirectoryEntryDto,
    UserEditModelDto,
    UserPreferencesDto,
    WithdrawDto,
)
from generated.upstream.api.account import edit_user_1 as upstream_edit_account
from generated.upstream.api.account import get_user as upstream_get_account
from generated.upstream.api.card_account_controller import (
    check_account_exists as upstream_check_exists,
)
from generated.upstream.api.card_account_controller import (
    close_account as upstream_close_account,
)
from generated.upstream.api.card_account_controller import (
    get_user_card_account as upstream_get_card,
)
from generated.upstream.api.card_account_controller import (
    get_user_card_accounts as upstream_list_cards,
)
from generated.upstream.api.card_account_controller import (
    open_account as upstream_open_account,
)
from generated.upstream.api.credit_controller import (
    create_credit as upstream_create_credit,
)
from generated.upstream.api.credit_controller import (
    delete_credit as upstream_delete_credit,
)
from generated.upstream.api.credit_controller import (
    get_by_card_account_id as upstream_credit_by_card,
)
from generated.upstream.api.credit_rating_controller.get_by_user_id import (
    asyncio_detailed as upstream_credit_rating_by_user,
)
from generated.upstream.api.payment_history_record_controller.find_by_card_account_id import (
    asyncio_detailed as upstream_payment_history_by_card,
)
from generated.upstream.api.payment_history_record_controller.find_by_user_id import (
    asyncio_detailed as upstream_payment_history_by_user,
)
from generated.upstream.api.credit_controller import (
    get_by_user_id_1 as upstream_credits_by_user,
)
from generated.upstream.api.credit_controller import (
    make_enrollment as upstream_make_enrollment,
)
from generated.upstream.api.credit_rule_controller import (
    create_credit_rule as upstream_create_rule,
)
from generated.upstream.api.credit_rule_controller import (
    delete_credit_rule as upstream_delete_rule,
)
from generated.upstream.api.credit_rule_controller import (
    edit_credit_rule as upstream_edit_rule,
)
from generated.upstream.api.credit_rule_controller import (
    get_all_credit_rules as upstream_all_rules,
)
from generated.upstream.api.currency_controller.get_currency_list import (
    asyncio_detailed as upstream_get_currency_list,
)
from generated.upstream.api.credit_rule_controller import (
    get_credit_rule_by_id as upstream_get_rule,
)
from generated.upstream.api.preferences_controller import (
    get_preferences as upstream_get_prefs,
)
from generated.upstream.api.preferences_controller import (
    update_preferences as upstream_put_prefs,
)
from generated.upstream.api.transaction_operation_controller import (
    get_transaction_operations as upstream_list_tx,
)
from generated.upstream.api.transaction_operation_controller import (
    transfer_money as upstream_transfer,
)
from generated.upstream.api.transaction_send_controller import (
    enroll_money as upstream_enroll,
)
from generated.upstream.api.transaction_send_controller import (
    withdraw_money as upstream_withdraw,
)
from generated.upstream.api.users import delete_user_by_id as upstream_delete_user
from generated.upstream.api.users import edit_user as upstream_edit_user
from generated.upstream.api.users import get_all_users as upstream_all_users
from generated.upstream.api.users import get_user_by_id as upstream_get_user
from generated.upstream.api.users import is_user_active_by_id as upstream_is_active
from generated.upstream.api.users_internal import (
    get_user_by_id_1 as upstream_internal_user,
)
from generated.upstream.models.card_account_create_dto import (
    CardAccountCreateDto as UpCardCreate,
)
from generated.upstream.models.credit_create_model_dto import (
    CreditCreateModelDto as UpCreditCreate,
)
from generated.upstream.models.credit_rule_dto import CreditRuleDTO as UpCreditRuleDTO
from generated.upstream.models.enroll_dto import EnrollDto as UpEnrollDto
from generated.upstream.models.transfer_request import (
    TransferRequest as UpTransferRequest,
)
from generated.upstream.models.user_edit_model_dto import UserEditModelDto as UpUserEdit
from generated.upstream.models.user_preferences_dto import (
    UserPreferencesDto as UpUserPrefs,
)
from generated.upstream.models.withdraw_dto import WithdrawDto as UpWithdrawDto
from generated.upstream.types import UNSET

try:
    from generated.upstream.api.admin.get_bank_treasury_balances import (
        asyncio_detailed as upstream_bank_treasury_balances,
    )
    from generated.upstream.api.admin.get_bank_treasury_transactions import (
        asyncio_detailed as upstream_bank_treasury_transactions,
    )
except ModuleNotFoundError:
    upstream_bank_treasury_balances = None  # type: ignore[misc, assignment]
    upstream_bank_treasury_transactions = None  # type: ignore[misc, assignment]

try:
    from generated.upstream.api.card_account_controller.set_main_account import (
        asyncio_detailed as upstream_set_main_account,
    )
except ModuleNotFoundError:
    upstream_set_main_account = None  # type: ignore[misc, assignment]

router = APIRouter()
SessionUser = MockUser | BffUser


def _unauth():
    return bff_error_response(401, message="Требуется вход", code="UNAUTHORIZED")


def _forbidden():
    return bff_error_response(403, message="Недостаточно прав", code="FORBIDDEN")


def _not_impl(msg: str):
    return bff_error_response(501, message=msg, code="NOT_IMPLEMENTED")


def _can_manage(actor: SessionUser, target_id: UUID) -> bool:
    return actor.id == target_id or is_worker_user(actor)


def _can_access_path(actor: SessionUser, path_user_id: UUID) -> bool:
    return actor.id == path_user_id or is_worker_user(actor)


def _user_edit_upstream(body: UserEditModelDto) -> UpUserEdit:
    raw = body.model_dump(mode="json", by_alias=True)
    return UpUserEdit.from_dict(raw)


def _opening_date_java_local_date_time(value: object | None, *, default: datetime) -> str:
    """Java LocalDateTime принимает дату-время без зоны (ISO-8601), напр. 2007-12-03T10:15:30."""
    if value is None:
        dt = default
        if dt.tzinfo is not None:
            dt = dt.astimezone(UTC).replace(tzinfo=None)
        return dt.replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(value, datetime):
        dt = value
        if dt.tzinfo is not None:
            dt = dt.astimezone(UTC).replace(tzinfo=None)
        return dt.replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(value, str):
        s = value.strip()
        if not s:
            return _opening_date_java_local_date_time(None, default=default)
        try:
            if len(s) == 16 and s[10] == "T" and s.count(":") == 1:
                s = f"{s}:00"
            if s.endswith("Z"):
                dt = datetime.fromisoformat(s[:-1] + "+00:00")
            else:
                dt = datetime.fromisoformat(s)
        except ValueError:
            return s[:19] if len(s) >= 19 else s
        if dt.tzinfo is not None:
            dt = dt.astimezone(UTC).replace(tzinfo=None)
        return dt.replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%S")
    return _opening_date_java_local_date_time(None, default=default)


def _credit_rule_upstream(body: CreditRuleDTO) -> UpCreditRuleDTO:
    raw = body.model_dump(mode="json", by_alias=True, exclude_none=True)
    default_opening = datetime.now(UTC).replace(microsecond=0)
    raw["openingDate"] = _opening_date_java_local_date_time(
        body.openingDate,
        default=default_opening,
    )
    return UpCreditRuleDTO.from_dict(raw)


def _prefs_upstream(body: UserPreferencesDto) -> UpUserPrefs:
    return UpUserPrefs.from_dict(body.model_dump(mode="json", by_alias=True))


@router.put("/user-service/users/{id}/edit")
async def edit_user(
    id: UUID,
    body: UserEditModelDto,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_manage(user, id):
        return _forbidden()
    ub = _user_edit_upstream(body)
    r = await ctx.call_upstream(
        lambda c, i=id: upstream_edit_user.asyncio_detailed(client=c, id=i, body=ub)
    )
    if r is None:
        return _unauth()
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if isinstance(out, Response):
        return out
    return Response(status_code=200)


@router.put("/user-service/account/edit")
async def edit_account(
    body: UserEditModelDto,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    ub = _user_edit_upstream(body)
    r = await ctx.call_upstream(
        lambda c: upstream_edit_account.asyncio_detailed(client=c, body=ub)
    )
    if r is None:
        return _unauth()
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if isinstance(out, Response):
        return out
    return Response(status_code=200)


@router.get("/user-service/users")
async def get_all_users(
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not is_worker_user(user):
        return _forbidden()
    r = await ctx.call_upstream(lambda c: upstream_all_users.asyncio_detailed(client=c))
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/user-service/users/directory", response_model=list[UserDirectoryEntryDto])
async def get_users_directory(
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not is_worker_user(user):
        return _forbidden()
    ur = await ctx.call_upstream(
        lambda c: upstream_all_users.asyncio_detailed(client=c)
    )
    if ur is None:
        return _unauth()
    if int(ur.status_code) != 200 or ur.parsed is None:
        return finish_upstream_response(ur)
    result: list[UserDirectoryEntryDto] = []
    for u in ur.parsed:
        uid = u.id
        pr = await ctx.call_upstream(
            lambda c, uu=uid: upstream_list_cards.asyncio_detailed(client=c, user_id=uu)
        )
        if pr is None:
            return _unauth()
        if int(pr.status_code) != 200 or pr.parsed is None:
            continue
        content = pr.parsed.content or []
        main = next(
            (
                a
                for a in content
                if a.is_main
                and (a.deleted is UNSET or a.deleted is False or a.deleted is None)
            ),
            None,
        )
        if main is None:
            continue
        cur = main.currency
        if cur is UNSET or not isinstance(cur, str):
            continue
        try:
            ccy = Currency(root=cur)
        except Exception:
            continue
        result.append(
            UserDirectoryEntryDto(userId=u.id, username=u.name, mainAccountCurrency=ccy)
        )
    return result


@router.get("/user-service/admin/bank-treasury/balances")
async def get_bank_treasury_balances(
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    settings: Annotated[Settings, Depends(get_settings)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if user is None:
        return _unauth()
    if not is_worker_user(user):
        return _forbidden()
    if settings.use_mock_bank_treasury:
        return store.bank_treasury_balances()
    if upstream_bank_treasury_balances is None:
        return _not_impl(
            "Bank treasury: нет сгенерированного upstream-клиента (пути не в openApi.backend-gateway)."
        )
    if ctx.record is None:
        return _unauth()
    r = await ctx.call_upstream(lambda c: upstream_bank_treasury_balances(client=c))
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/user-service/admin/bank-treasury/transactions")
async def get_bank_treasury_transactions(
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    settings: Annotated[Settings, Depends(get_settings)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
    pageIndex: int = 0,
    pageSize: int = 30,
):
    if user is None:
        return _unauth()
    if not is_worker_user(user):
        return _forbidden()
    if settings.use_mock_bank_treasury:
        return store.page_bank_treasury_transactions(pageIndex, pageSize)
    if upstream_bank_treasury_transactions is None:
        return _not_impl(
            "Bank treasury: нет сгенерированного upstream-клиента (пути не в openApi.backend-gateway)."
        )
    if ctx.record is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, pi=pageIndex, ps=pageSize: upstream_bank_treasury_transactions(
            client=c, page_index=pi, page_size=ps
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/user-service/users/{id}")
async def get_user_by_id(
    id: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_manage(user, id):
        return _forbidden()
    r = await ctx.call_upstream(
        lambda c, i=id: upstream_get_user.asyncio_detailed(client=c, id=i)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.delete("/user-service/users/{id}")
async def delete_user_by_id(
    id: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not is_worker_user(user) and user.id != id:
        return _forbidden()
    r = await ctx.call_upstream(
        lambda c, i=id: upstream_delete_user.asyncio_detailed(client=c, id=i)
    )
    if r is None:
        return _unauth()
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if isinstance(out, Response):
        return out
    return Response(status_code=200)


@router.get("/user-service/users/{id}/isActive")
async def is_user_active(
    id: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_manage(user, id):
        return _forbidden()
    r = await ctx.call_upstream(
        lambda c, i=id: upstream_is_active.asyncio_detailed(client=c, id=i)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/user-service/internal/users/{id}")
async def internal_get_user(
    request: Request,
    id: UUID,
    settings: Annotated[Settings, Depends(get_settings)],
    x_api_key: Annotated[str | None, Header(alias="X-API-KEY")] = None,
):
    if not settings.bff_service_api_key:
        return bff_error_response(503, message="BFF_SERVICE_API_KEY не задан")
    if x_api_key != settings.bff_service_api_key:
        return bff_error_response(
            401, message="Неверный X-API-KEY", code="UNAUTHORIZED"
        )
    plain = getattr(request.app.state, "upstream_plain_http", None) or getattr(
        request.app.state, "upstream_anonymous_client", None
    )
    client = plain if plain is not None else anonymous_client(settings)
    r = await upstream_internal_user.asyncio_detailed(
        client=client, id=id, x_api_key=settings.bff_service_api_key
    )
    return finish_upstream_response(r)


@router.get("/user-service/account")
async def get_user_account(
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c: upstream_get_account.asyncio_detailed(client=c)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.post("/core-api/transactions/withdraw")
async def withdraw_money(
    request: Request,
    body: WithdrawDto,
    background_tasks: BackgroundTasks,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    session_cookie: Annotated[str | None, Depends(get_session_token)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    if ctx.record is None or user is None:
        return _unauth()
    wbody = UpWithdrawDto.from_dict(body.model_dump(mode="json", by_alias=True))
    r = await ctx.call_upstream(
        lambda c: upstream_withdraw.asyncio_detailed(client=c, body=wbody)
    )
    if r is None:
        return _unauth()
    ok = int(r.status_code) == 200
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if ok and body.cardAccountId is not None:
        schedule_upstream_tx_broadcast(
            background_tasks,
            app=request.app,
            settings=settings,
            session_cookie=session_cookie,
            account_ids=[body.cardAccountId],
        )
    if isinstance(out, Response):
        return out
    return Response(status_code=200)


@router.post("/core-api/transactions/enroll")
async def enroll_money(
    request: Request,
    body: EnrollDto,
    background_tasks: BackgroundTasks,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    session_cookie: Annotated[str | None, Depends(get_session_token)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    if ctx.record is None or user is None:
        return _unauth()
    ebody = UpEnrollDto.from_dict(body.model_dump(mode="json", by_alias=True))
    r = await ctx.call_upstream(
        lambda c: upstream_enroll.asyncio_detailed(client=c, body=ebody)
    )
    if r is None:
        return _unauth()
    ok = int(r.status_code) == 200
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if ok and body.cardAccountId is not None:
        schedule_upstream_tx_broadcast(
            background_tasks,
            app=request.app,
            settings=settings,
            session_cookie=session_cookie,
            account_ids=[body.cardAccountId],
        )
    if isinstance(out, Response):
        return out
    return Response(status_code=200)


@router.post("/core-api/transactions/transfer")
async def transfer_money(
    request: Request,
    body: TransferMoneyDto,
    background_tasks: BackgroundTasks,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    session_cookie: Annotated[str | None, Depends(get_session_token)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if body.targetKind == "CREDIT":
        return _not_impl(
            "Перевод на кредит в upstream-режиме пока не сопоставлен с API шлюза"
        )
    if body.targetKind != "ACCOUNT" or body.targetCardAccountId is None:
        return bff_error_response(400, message="Некорректные данные")

    async def _transfer_call(c: AuthenticatedClient):
        if body.fromCardAccountId is None:
            return await upstream_enroll.asyncio_detailed(
                client=c,
                body=UpEnrollDto(
                    card_account_id=body.targetCardAccountId,
                    sum_=body.amount,
                    currency=body.amountCurrency.root,
                    destination="external",
                ),
            )
        return await upstream_transfer.asyncio_detailed(
            client=c,
            body=UpTransferRequest(
                from_card_account_id=body.fromCardAccountId,
                to_card_account_id=body.targetCardAccountId,
                sum_=body.amount,
                currency=body.amountCurrency.root,
            ),
        )

    r = await ctx.call_upstream(_transfer_call)
    if r is None:
        return _unauth()
    ok = int(r.status_code) == 200
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if ok:
        push_ids: list[UUID] = []
        if body.targetCardAccountId is not None:
            push_ids.append(body.targetCardAccountId)
        if body.fromCardAccountId is not None:
            push_ids.append(body.fromCardAccountId)
        if push_ids:
            schedule_upstream_tx_broadcast(
                background_tasks,
                app=request.app,
                settings=settings,
                session_cookie=session_cookie,
                account_ids=push_ids,
            )
    if isinstance(out, Response):
        return out
    return Response(status_code=200)


@router.post("/core-api/cardaccount/open/{userId}")
async def open_account(
    userId: UUID,
    body: CardAccountCreateModelDto,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_access_path(user, userId):
        return _forbidden()
    cur = body.currency.root if body.currency is not None else "RUB"
    up_body = UpCardCreate(name=body.name or UNSET, currency=cur, is_main=False)
    r = await ctx.call_upstream(
        lambda c, uid=userId: upstream_open_account.asyncio_detailed(
            client=c, user_id=uid, body=up_body
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.post("/core-api/cardaccount/close/{accountId}")
async def close_account(
    accountId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, aid=accountId: upstream_close_account.asyncio_detailed(
            client=c, account_id=aid
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.post("/core-api/cardaccount/{accountId}/set-main")
async def set_main_account(
    accountId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if upstream_set_main_account is None:
        return _not_impl(
            "set-main: нет сгенерированного upstream-клиента (путь не в openApi.backend-gateway)."
        )
    r = await ctx.call_upstream(
        lambda c, aid=accountId: upstream_set_main_account(client=c, account_id=aid)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/preferences-service/preferences")
async def get_preferences(
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(lambda c: upstream_get_prefs.asyncio_detailed(client=c))
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.put("/preferences-service/preferences")
async def update_preferences(
    body: UserPreferencesDto,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    pb = _prefs_upstream(body)
    r = await ctx.call_upstream(
        lambda c: upstream_put_prefs.asyncio_detailed(client=c, body=pb)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/core-api/transactions/{accountId}")
async def get_transaction_operations(
    accountId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
    pageIndex: int = 0,
    pageSize: int = 30,
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, aid=accountId, pi=pageIndex, ps=pageSize: (
            upstream_list_tx.asyncio_detailed(
                client=c, account_id=aid, page_index=pi, page_size=ps
            )
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/core-api/cardaccount/{accountId}")
async def get_user_card_account(
    accountId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, aid=accountId: upstream_get_card.asyncio_detailed(
            client=c, account_id=aid
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/core-api/cardaccount/exists/{accountId}")
async def check_account_exists(
    accountId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, aid=accountId: upstream_check_exists.asyncio_detailed(
            client=c, account_id=aid
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/core-api/cardaccount/all/{userId}")
async def get_user_card_accounts(
    userId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
    pageIndex: int = 0,
    pageSize: int = 30,
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_access_path(user, userId):
        return _forbidden()
    r = await ctx.call_upstream(
        lambda c, uid=userId, pi=pageIndex, ps=pageSize: (
            upstream_list_cards.asyncio_detailed(
                client=c, user_id=uid, page_index=pi, page_size=ps
            )
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/core-api/currency/all")
async def get_currency_list(
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c: upstream_get_currency_list.asyncio_detailed(client=c)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.put("/credit-service/credit_rule/{creditRuleId}/edit")
async def edit_credit_rule(
    creditRuleId: UUID,
    body: CreditRuleDTO,
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None:
        return _unauth()
    crb = _credit_rule_upstream(body)
    r = await ctx.call_upstream(
        lambda c, rid=creditRuleId: upstream_edit_rule.asyncio_detailed(
            client=c, credit_rule_id=rid, body=crb
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.post("/credit-service/credit_rule/create")
async def create_credit_rule(
    body: CreditRuleDTO, ctx: Annotated[UpstreamContext, Depends(get_upstream_context)]
):
    if ctx.record is None:
        return _unauth()
    crb = _credit_rule_upstream(body)
    r = await ctx.call_upstream(
        lambda c: upstream_create_rule.asyncio_detailed(client=c, body=crb)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.post("/credit-service/credit/{cardAccountId}/enrollment")
async def make_enrollment(
    cardAccountId: UUID,
    money: float,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, cid=cardAccountId, m=money: upstream_make_enrollment.asyncio_detailed(
            client=c, card_account_id=cid, money=m
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.post("/credit-service/credit/create")
async def create_credit(
    body: CreditCreateModelDto,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if (
        body.userId is not None
        and body.userId != user.id
        and (not is_worker_user(user))
    ):
        return _forbidden()
    md = body.model_dump(mode="json", by_alias=True)
    if body.money is not None:
        md["totalDebt"] = body.money.value
        md["currency"] = body.money.currency.root
    md.pop("money", None)
    up = UpCreditCreate.from_dict(md)
    r = await ctx.call_upstream(
        lambda c: upstream_create_credit.asyncio_detailed(client=c, body=up)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/credit-service/credit_rule/{creditRuleId}/get_by_id")
async def get_credit_rule_by_id(
    creditRuleId: UUID, ctx: Annotated[UpstreamContext, Depends(get_upstream_context)]
):
    if ctx.record is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, rid=creditRuleId: upstream_get_rule.asyncio_detailed(
            client=c, credit_rule_id=rid
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/credit-service/credit_rule/get_all")
async def get_all_credit_rules(
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None:
        return _unauth()
    r = await ctx.call_upstream(lambda c: upstream_all_rules.asyncio_detailed(client=c))
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/credit-service/credit/{userId}/get_by_user_id")
async def get_by_user_id(
    userId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_access_path(user, userId):
        return _forbidden()
    r = await ctx.call_upstream(
        lambda c, uid=userId: upstream_credits_by_user.asyncio_detailed(
            client=c, user_id=uid
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/credit-service/credit/{cardAccountId}/get_by_card_account")
async def get_by_card_account(
    cardAccountId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, cid=cardAccountId: upstream_credit_by_card.asyncio_detailed(
            client=c, card_account_id=cid
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/credit-service/credit_rating/{userId}/get_by_user")
async def get_credit_rating_by_user(
    userId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_access_path(user, userId):
        return _forbidden()
    r = await ctx.call_upstream(
        lambda c, uid=userId: upstream_credit_rating_by_user(client=c, user_id=uid)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get("/credit-service/payment_history_record/{userId}/find_by_user_id")
async def find_payment_history_by_user(
    userId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    if not _can_access_path(user, userId):
        return _forbidden()
    r = await ctx.call_upstream(
        lambda c, uid=userId: upstream_payment_history_by_user(client=c, user_id=uid)
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.get(
    "/credit-service/payment_history_record/{cardAccountId}/find_by_card_account_id"
)
async def find_payment_history_by_card_account(
    cardAccountId: UUID,
    user: Annotated[SessionUser | None, Depends(get_current_user_optional)],
    ctx: Annotated[UpstreamContext, Depends(get_upstream_context)],
):
    if ctx.record is None or user is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, cid=cardAccountId: upstream_payment_history_by_card(
            client=c, card_account_id=cid
        )
    )
    if r is None:
        return _unauth()
    return finish_upstream_response(r)


@router.delete("/credit-service/credit_rule/{creditRuleId}/delete")
async def delete_credit_rule(
    creditRuleId: UUID, ctx: Annotated[UpstreamContext, Depends(get_upstream_context)]
):
    if ctx.record is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, rid=creditRuleId: upstream_delete_rule.asyncio_detailed(
            client=c, credit_rule_id=rid
        )
    )
    if r is None:
        return _unauth()
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if isinstance(out, Response):
        return out
    return Response(status_code=200)


@router.delete("/credit-service/credit/{creditId}/delete")
async def delete_credit(
    creditId: UUID, ctx: Annotated[UpstreamContext, Depends(get_upstream_context)]
):
    if ctx.record is None:
        return _unauth()
    r = await ctx.call_upstream(
        lambda c, cid=creditId: upstream_delete_credit.asyncio_detailed(
            client=c, credit_id=cid
        )
    )
    if r is None:
        return _unauth()
    out = finish_upstream_response(r, empty_200=True)
    if isinstance(out, JSONResponse):
        return out
    if isinstance(out, Response):
        return out
    return Response(status_code=200)

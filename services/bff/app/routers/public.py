from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Header, Response

from app.config import Settings, get_settings
from app.deps import get_current_user_optional
from app.errors import bff_error_response
from app.mock_store import MockUser, store, user_to_dto
from app.ws_hub import ws_hub
from generated.bff_browser_models import (
    AccountSetVisibilityDto,
    CardAccountCreateModelDto,
    CreditCreateModelDto,
    CreditRuleDTO,
    EnrollDto,
    TransferMoneyDto,
    UserEditModelDto,
    WithdrawDto,
)

router = APIRouter()


def _unauth():
    return bff_error_response(401, message="Требуется вход", code="UNAUTHORIZED")


def _forbidden():
    return bff_error_response(403, message="Недостаточно прав", code="FORBIDDEN")


def _is_worker(u: MockUser) -> bool:
    return "WORKER" in u.roles


def _can_manage_user(actor: MockUser, target_id: UUID) -> bool:
    return actor.id == target_id or _is_worker(actor)


def _can_access_user_path(actor: MockUser, path_user_id: UUID) -> bool:
    return actor.id == path_user_id or _is_worker(actor)


# --- user-service ---


@router.put("/user-service/users/{id}/edit")
async def edit_user(
    id: UUID,
    body: UserEditModelDto,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not _can_manage_user(user, id):
        return _forbidden()
    if store.get_user_by_id(id) is None:
        return bff_error_response(404, message="Пользователь не найден")
    store.update_user(id, body)
    return Response(status_code=200)


@router.put("/user-service/account/edit")
async def edit_account(
    body: UserEditModelDto,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    store.update_self_account(user.id, body)
    return Response(status_code=200)


@router.get("/user-service/users")
async def get_all_users(
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not _is_worker(user):
        return _forbidden()
    return [user_to_dto(u) for u in store.list_users()]


@router.get("/user-service/users/{id}")
async def get_user_by_id(
    id: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not _can_manage_user(user, id):
        return _forbidden()
    t = store.get_user_by_id(id)
    if t is None:
        return bff_error_response(404, message="Пользователь не найден")
    return user_to_dto(t)


@router.delete("/user-service/users/{id}")
async def delete_user_by_id(
    id: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not _is_worker(user) and user.id != id:
        return _forbidden()
    if not store.delete_user(id):
        return bff_error_response(404, message="Пользователь не найден")
    return Response(status_code=200)


@router.get("/user-service/users/{id}/isActive")
async def is_user_active(
    id: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not _can_manage_user(user, id):
        return _forbidden()
    active = store.is_user_active(id)
    if active is None:
        return bff_error_response(404, message="Пользователь не найден")
    return active


@router.get("/user-service/internal/users/{id}")
async def internal_get_user(
    id: UUID,
    settings: Annotated[Settings, Depends(get_settings)],
    x_api_key: Annotated[str | None, Header(alias="X-API-KEY")] = None,
):
    if not settings.bff_service_api_key:
        return bff_error_response(503, message="BFF_SERVICE_API_KEY не задан")
    if x_api_key != settings.bff_service_api_key:
        return bff_error_response(401, message="Неверный X-API-KEY", code="UNAUTHORIZED")
    t = store.get_user_by_id(id)
    if t is None:
        return bff_error_response(404, message="Пользователь не найден")
    return user_to_dto(t)


@router.get("/user-service/account")
async def get_user_account(
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    return user_to_dto(user)


# --- core-api ---


@router.post("/core-api/transactions/withdraw")
async def withdraw_money(
    body: WithdrawDto,
    background_tasks: BackgroundTasks,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    st, op = store.withdraw(user.id, body)
    if st == "bad":
        return bff_error_response(400, message="Некорректные данные")
    if st == "forbidden":
        return _forbidden()
    if st == "funds":
        return bff_error_response(400, message="Недостаточно средств")
    if op and body.cardAccountId:
        background_tasks.add_task(ws_hub.broadcast_transaction, body.cardAccountId, op)
    return Response(status_code=200)


@router.post("/core-api/transactions/enroll")
async def enroll_money(
    body: EnrollDto,
    background_tasks: BackgroundTasks,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    st, op = store.enroll(user.id, body)
    if st == "bad":
        return bff_error_response(400, message="Некорректные данные")
    if st == "forbidden":
        return _forbidden()
    if op and body.cardAccountId:
        background_tasks.add_task(ws_hub.broadcast_transaction, body.cardAccountId, op)
    return Response(status_code=200)


@router.post("/core-api/transactions/transfer")
async def transfer_money(
    body: TransferMoneyDto,
    background_tasks: BackgroundTasks,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    st, items = store.transfer_money(user.id, body)
    if st == "bad":
        return bff_error_response(400, message="Некорректные данные")
    if st == "forbidden":
        return _forbidden()
    if st == "funds":
        return bff_error_response(400, message="Недостаточно средств")
    if st == "not_found":
        return bff_error_response(404, message="Счёт или кредит не найден")
    for acc_id, op in items:
        background_tasks.add_task(ws_hub.broadcast_transaction, acc_id, op)
    return Response(status_code=200)


@router.post("/core-api/cardaccount/open/{userId}")
async def open_account(
    userId: UUID,
    body: CardAccountCreateModelDto,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not _can_access_user_path(user, userId):
        return _forbidden()
    return store.open_account(userId, body)


@router.post("/core-api/cardaccount/close/{accountId}")
async def close_account(
    accountId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    r = store.close_account(accountId, user.id)
    if r is None:
        return bff_error_response(404, message="Счёт не найден")
    if r is False:
        return _forbidden()
    return True


@router.post("/core-api/cardaccount/{accountId}/set-main")
async def set_main_account(
    accountId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    dto = store.set_main_account(accountId, user.id)
    if dto is None:
        return bff_error_response(404, message="Счёт не найден или недоступен")
    return dto


@router.post("/core-api/cardaccount/{accountId}/set-visibility")
async def set_account_visibility(
    accountId: UUID,
    body: AccountSetVisibilityDto,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    dto = store.set_account_visibility(accountId, user.id, body.visible)
    if dto is None:
        return bff_error_response(404, message="Счёт не найден или недоступен")
    return dto


@router.get("/core-api/transactions/{accountId}")
async def get_transaction_operations(
    accountId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
    pageIndex: int = 0,
    pageSize: int = 30,
):
    if user is None:
        return _unauth()
    if not store.account_owned_by(accountId, user.id) and not _is_worker(user):
        return _forbidden()
    page = store.page_transactions(accountId, pageIndex, pageSize)
    if page is None:
        return bff_error_response(404, message="Счёт не найден")
    return page


@router.get("/core-api/cardaccount/{accountId}")
async def get_user_card_account(
    accountId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    a = store.get_account(accountId)
    if a is None:
        return bff_error_response(404, message="Счёт не найден")
    if a.user_id != user.id and not _is_worker(user):
        return _forbidden()
    return store.card_account_dto(accountId, embed_tx=True)


@router.get("/core-api/cardaccount/exists/{accountId}")
async def check_account_exists(
    accountId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    a = store.get_account(accountId)
    if a is None:
        return False
    if a.user_id != user.id and not _is_worker(user):
        return _forbidden()
    return not a.deleted


@router.get("/core-api/cardaccount/all/{userId}")
async def get_user_card_accounts(
    userId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
    pageIndex: int = 0,
    pageSize: int = 30,
):
    if user is None:
        return _unauth()
    if not _can_access_user_path(user, userId):
        return _forbidden()
    return store.list_accounts_page(userId, pageIndex, pageSize)


# --- credit-service ---


@router.put("/credit-service/credit_rule/{creditRuleId}/edit")
async def edit_credit_rule(creditRuleId: UUID, body: CreditRuleDTO):
    r = store.edit_credit_rule(creditRuleId, body)
    if r is None:
        return bff_error_response(404, message="Правило не найдено")
    return r


@router.post("/credit-service/credit_rule/create")
async def create_credit_rule(body: CreditRuleDTO):
    return store.create_credit_rule(body)


@router.post("/credit-service/credit/{cardAccountId}/enrollment")
async def make_enrollment(
    cardAccountId: UUID,
    money: float,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not store.account_owned_by(cardAccountId, user.id) and not _is_worker(user):
        return _forbidden()
    _ = money
    c = store.make_enrollment(cardAccountId, user.id)
    if c is None:
        return bff_error_response(404, message="Кредит не найден")
    return c


@router.post("/credit-service/credit/create")
async def create_credit(
    body: CreditCreateModelDto,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if body.userId != user.id and not _is_worker(user):
        return _forbidden()
    c = store.create_credit(body)
    if c is None:
        return bff_error_response(400, message="Некорректные данные или ссылки")
    return c


@router.get("/credit-service/credit_rule/{creditRuleId}/get_by_id")
async def get_credit_rule_by_id(creditRuleId: UUID):
    r = store.get_credit_rule(creditRuleId)
    if r is None:
        return bff_error_response(404, message="Правило не найдено")
    return r


@router.get("/credit-service/credit_rule/get_all")
async def get_all_credit_rules():
    return store.list_credit_rules()


@router.get("/credit-service/credit/{userId}/get_by_user_id")
async def get_by_user_id(
    userId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not _can_access_user_path(user, userId):
        return _forbidden()
    return store.credits_by_user(userId)


@router.get("/credit-service/credit/{cardAccountId}/get_by_card_account")
async def get_by_card_account(
    cardAccountId: UUID,
    user: Annotated[MockUser | None, Depends(get_current_user_optional)],
):
    if user is None:
        return _unauth()
    if not store.account_owned_by(cardAccountId, user.id) and not _is_worker(user):
        return _forbidden()
    c = store.credit_by_card(cardAccountId)
    if c is None:
        return bff_error_response(404, message="Кредит не найден")
    return c


@router.delete("/credit-service/credit_rule/{creditRuleId}/delete")
async def delete_credit_rule(creditRuleId: UUID):
    if not store.delete_credit_rule(creditRuleId):
        return bff_error_response(404, message="Правило не найдено")
    return Response(status_code=200)


@router.delete("/credit-service/credit/{creditId}/delete")
async def delete_credit(creditId: UUID):
    if not store.delete_credit(creditId):
        return bff_error_response(404, message="Кредит не найден")
    return Response(status_code=200)

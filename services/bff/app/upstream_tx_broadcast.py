from __future__ import annotations
from datetime import UTC, datetime
from types import SimpleNamespace
from typing import Any
from uuid import UUID
from fastapi import BackgroundTasks
from app.config import Settings, get_settings
from app.session_store import session_store
from app.upstream_context import UpstreamContext
from app.ws_hub import ws_hub
from generated.bff_browser_models import (
    Currency,
    MoneyValueDto,
    TransactionOperation as BffTransactionOperation,
)
from generated.upstream.api.transaction_operation_controller.get_transaction_operations import (
    asyncio_detailed as upstream_list_tx,
)
from generated.upstream.models.transaction_operation import (
    TransactionOperation as UpTransactionOperation,
)
from generated.upstream.types import Unset


def _op_sort_key(op: UpTransactionOperation) -> datetime:
    dt = op.date_time
    if isinstance(dt, Unset):
        return datetime.min.replace(tzinfo=UTC)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


def _newest_operation(ops: list[UpTransactionOperation]) -> UpTransactionOperation:
    return max(ops, key=_op_sort_key)


def _bff_transaction_from_upstream(
    up: UpTransactionOperation,
) -> BffTransactionOperation | None:
    if isinstance(up.id, Unset):
        return None
    card_account_id: UUID | None = None
    if not isinstance(up.account, Unset):
        acc = up.account
        if not isinstance(acc.id, Unset):
            card_account_id = acc.id
    dt_out = None
    if not isinstance(up.date_time, Unset):
        dt = up.date_time
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        dt_out = dt
    ttype = None
    if not isinstance(up.transaction_type, Unset):
        ttype = up.transaction_type.value
    tstatus = None
    if not isinstance(up.transaction_status, Unset):
        tstatus = up.transaction_status.value
    money = None
    if not isinstance(up.money, Unset):
        cur_s = None if isinstance(up.currency, Unset) else up.currency
        try:
            cur = Currency(cur_s) if cur_s else Currency("RUBLE")
        except Exception:
            cur = Currency("RUBLE")
        money = MoneyValueDto(value=up.money, currency=cur)
    action = None if isinstance(up.action, Unset) else up.action
    return BffTransactionOperation(
        id=up.id,
        cardAccountId=card_account_id,
        dateTime=dt_out,
        transactionType=ttype,
        transactionActoin=action,
        transactionStatus=tstatus,
        money=money,
    )


async def broadcast_newest_upstream_transaction(
    *, app: Any, session_cookie: str | None, account_id: UUID
) -> None:
    settings = get_settings()
    if not settings.use_upstream:
        return
    if not session_cookie:
        return
    rec = session_store.get(session_cookie)
    if rec is None:
        return
    conn = SimpleNamespace(app=app)
    ctx = UpstreamContext(conn, settings, session_cookie, rec)
    r = await ctx.call_upstream(
        lambda c, aid=account_id: upstream_list_tx.asyncio_detailed(
            client=c, account_id=aid, page_index=0, page_size=50
        )
    )
    if r is None or int(r.status_code) != 200 or r.parsed is None:
        return
    content = r.parsed.content
    if isinstance(content, Unset) or not content:
        return
    best = _newest_operation(list(content))
    bff_op = _bff_transaction_from_upstream(best)
    if bff_op is None:
        return
    await ws_hub.broadcast_transaction(account_id, bff_op)


async def _broadcast_many_upstream_transactions(
    app: Any, session_cookie: str | None, account_ids: list[UUID]
) -> None:
    for aid in account_ids:
        await broadcast_newest_upstream_transaction(
            app=app, session_cookie=session_cookie, account_id=aid
        )


def schedule_upstream_tx_broadcast(
    background_tasks: BackgroundTasks,
    *,
    app: Any,
    settings: Settings,
    session_cookie: str | None,
    account_ids: list[UUID],
) -> None:
    if not settings.use_upstream:
        return
    ids = list(dict.fromkeys(account_ids))
    if not ids:
        return
    background_tasks.add_task(
        _broadcast_many_upstream_transactions, app, session_cookie, ids
    )

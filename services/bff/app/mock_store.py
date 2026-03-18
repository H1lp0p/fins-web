from __future__ import annotations

import hashlib
import secrets
import threading
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Literal
from uuid import UUID, uuid4

from app.mock_fx import convert_amount

from generated.bff_browser_models import (
    CardAccount,
    CardAccountCreateModelDto,
    Credit,
    CreditCreateModelDto,
    CreditRule,
    CreditRuleDTO,
    Currency,
    EnrollDto,
    MoneyValueDto,
    PageCardAccount,
    PageTransactionOperation,
    PageableObject,
    SortObject,
    TransactionOperation,
    TransferMoneyDto,
    UserDto,
    UserEditModelDto,
    WithdrawDto,
)


def _hash_password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)


def _money(value: float, code: Literal["DOLLAR", "EURO", "RUBLE"] = "RUBLE") -> MoneyValueDto:
    return MoneyValueDto(value=value, currency=Currency(root=code))


_sort = SortObject(empty=True, sorted=False, unsorted=True)


@dataclass
class MockUser:
    id: UUID
    name: str
    email: str
    salt: bytes
    pwd_hash: bytes
    roles: list[str] = field(default_factory=lambda: ["CLIENT"])
    active: bool = True


@dataclass
class MockAccount:
    id: UUID
    user_id: UUID
    balance: float
    currency_code: Literal["DOLLAR", "EURO", "RUBLE"] = "RUBLE"
    deleted: bool = False
    display_name: str | None = None
    main: bool = False
    visible: bool = True


class MockStore:
    """In-memory домен для моков BFF."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._users_by_email: dict[str, MockUser] = {}
        self._sessions: dict[str, UUID] = {}
        self._accounts: dict[UUID, MockAccount] = {}
        self._tx: dict[UUID, list[TransactionOperation]] = {}
        self._credit_rules: dict[UUID, CreditRule] = {}
        self._credits: dict[UUID, Credit] = {}

    # --- auth ---
    def register(self, name: str, email: str, password: str) -> MockUser | None:
        key = email.lower().strip()
        salt = secrets.token_bytes(16)
        pwd_hash = _hash_password(password, salt)
        user = MockUser(id=uuid4(), name=name, email=key, salt=salt, pwd_hash=pwd_hash)
        with self._lock:
            if key in self._users_by_email:
                return None
            self._users_by_email[key] = user
        return user

    def verify_login(self, email: str, password: str) -> MockUser | None:
        key = email.lower().strip()
        with self._lock:
            u = self._users_by_email.get(key)
        if u is None or not u.active:
            return None
        if _hash_password(password, u.salt) != u.pwd_hash:
            return None
        return u

    def get_user_by_id(self, user_id: UUID) -> MockUser | None:
        with self._lock:
            for u in self._users_by_email.values():
                if u.id == user_id:
                    return u
        return None

    def list_users(self) -> list[MockUser]:
        with self._lock:
            return list(self._users_by_email.values())

    def delete_user(self, user_id: UUID) -> bool:
        with self._lock:
            to_del = [e for e, u in self._users_by_email.items() if u.id == user_id]
            if not to_del:
                return False
            for e in to_del:
                del self._users_by_email[e]
            acc_ids = [a.id for a in self._accounts.values() if a.user_id == user_id]
            for aid in acc_ids:
                del self._accounts[aid]
                self._tx.pop(aid, None)
            self._sessions = {t: uid for t, uid in self._sessions.items() if uid != user_id}
            cr_rm = [cid for cid, c in self._credits.items() if c.userId == user_id]
            for cid in cr_rm:
                del self._credits[cid]
        return True

    def update_user(self, user_id: UUID, body: UserEditModelDto) -> MockUser | None:
        with self._lock:
            u = next((x for x in self._users_by_email.values() if x.id == user_id), None)
            if u is None:
                return None
            u.name = body.name
            if body.newRoles is not None:
                u.roles = list(body.newRoles)
        return self.get_user_by_id(user_id)

    def update_self_account(self, user_id: UUID, body: UserEditModelDto) -> MockUser | None:
        return self.update_user(user_id, body)

    def is_user_active(self, user_id: UUID) -> bool | None:
        u = self.get_user_by_id(user_id)
        if u is None:
            return None
        return u.active

    # --- sessions ---
    def create_session(self, user_id: UUID) -> str:
        token = secrets.token_urlsafe(32)
        with self._lock:
            self._sessions[token] = user_id
        return token

    def user_for_session(self, token: str | None) -> MockUser | None:
        if not token:
            return None
        with self._lock:
            uid = self._sessions.get(token)
        if uid is None:
            return None
        return self.get_user_by_id(uid)

    def revoke_session(self, token: str | None) -> None:
        if not token:
            return
        with self._lock:
            self._sessions.pop(token, None)

    # --- accounts ---
    def open_account(self, user_id: UUID, body: CardAccountCreateModelDto) -> CardAccount:
        aid = uuid4()
        cur: Literal["DOLLAR", "EURO", "RUBLE"] = "RUBLE"
        if body.currency is not None:
            cur = body.currency.root
        acc = MockAccount(
            id=aid,
            user_id=user_id,
            balance=0.0,
            currency_code=cur,
            display_name=body.name,
            main=False,
            visible=True,
        )
        with self._lock:
            self._accounts[aid] = acc
            self._tx[aid] = []
        return self.card_account_dto(aid, embed_tx=False)

    def get_account(self, account_id: UUID) -> MockAccount | None:
        with self._lock:
            return self._accounts.get(account_id)

    def account_owned_by(self, account_id: UUID, user_id: UUID) -> bool:
        a = self.get_account(account_id)
        return a is not None and a.user_id == user_id and not a.deleted

    def close_account(self, account_id: UUID, user_id: UUID) -> bool | None:
        """None — не найден, False — чужой, True — закрыт."""
        with self._lock:
            a = self._accounts.get(account_id)
            if a is None:
                return None
            if a.user_id != user_id:
                return False
            a.deleted = True
            a.main = False
        return True

    def set_main_account(self, account_id: UUID, user_id: UUID) -> CardAccount | None:
        """None — не найден / чужой / закрыт."""
        with self._lock:
            a = self._accounts.get(account_id)
            if a is None or a.user_id != user_id or a.deleted:
                return None
            for acc in self._accounts.values():
                if acc.user_id == user_id:
                    acc.main = False
            a.main = True
        return self.card_account_dto(account_id, embed_tx=False)

    def set_account_visibility(
        self,
        account_id: UUID,
        user_id: UUID,
        visible: bool,
    ) -> CardAccount | None:
        """None — не найден / чужой / закрыт."""
        with self._lock:
            a = self._accounts.get(account_id)
            if a is None or a.user_id != user_id or a.deleted:
                return None
            a.visible = visible
        return self.card_account_dto(account_id, embed_tx=False)

    def card_account_dto(self, account_id: UUID, *, embed_tx: bool) -> CardAccount:
        a = self.get_account(account_id)
        assert a is not None
        txs = self._tx.get(account_id, []) if embed_tx else None
        return CardAccount(
            id=a.id,
            userId=a.user_id,
            name=a.display_name,
            main=a.main,
            visible=a.visible,
            money=_money(a.balance, a.currency_code),
            deleted=a.deleted,
            transactionOperations=list(txs[-50:]) if txs is not None else None,
        )

    def _ensure_demo_accounts(self, user_id: UUID) -> None:
        """Один набор демо-счетов, если у пользователя ещё нет счетов."""
        if any(a.user_id == user_id for a in self._accounts.values()):
            return
        main_id = uuid4()
        acc_main = MockAccount(
            id=main_id,
            user_id=user_id,
            balance=100_000.0,
            currency_code="DOLLAR",
            display_name="Account name",
            main=True,
            visible=True,
        )
        acc_def = MockAccount(
            id=uuid4(),
            user_id=user_id,
            balance=5_000.0,
            currency_code="EURO",
            display_name="Account name",
            main=False,
            visible=True,
        )
        acc_hid = MockAccount(
            id=uuid4(),
            user_id=user_id,
            balance=1_000.0,
            currency_code="RUBLE",
            display_name="Account name",
            main=False,
            visible=False,
        )
        acc_closed = MockAccount(
            id=uuid4(),
            user_id=user_id,
            balance=0.0,
            currency_code="DOLLAR",
            display_name="Account name",
            main=False,
            visible=True,
            deleted=True,
        )
        self._accounts[acc_main.id] = acc_main
        self._accounts[acc_def.id] = acc_def
        self._accounts[acc_hid.id] = acc_hid
        self._accounts[acc_closed.id] = acc_closed
        self._tx.setdefault(main_id, [])
        self._tx.setdefault(acc_def.id, [])
        self._tx.setdefault(acc_hid.id, [])
        self._tx.setdefault(acc_closed.id, [])
        self._tx[main_id].extend(
            [
                TransactionOperation(
                    id=uuid4(),
                    cardAccountId=main_id,
                    dateTime=datetime.now(UTC),
                    transactionType="ENROLLMENT",
                    transactionActoin="Simple Enrollment",
                    transactionStatus="COMPLETE",
                    money=_money(1000.12, "DOLLAR"),
                ),
                TransactionOperation(
                    id=uuid4(),
                    cardAccountId=main_id,
                    dateTime=datetime.now(UTC),
                    transactionType="WITHDRAWAL",
                    transactionActoin="Simple withdrawal",
                    transactionStatus="COMPLETE",
                    money=_money(1000.12, "DOLLAR"),
                ),
            ],
        )

    def list_accounts_page(
        self,
        user_id: UUID,
        page_index: int,
        page_size: int,
    ) -> PageCardAccount:
        with self._lock:
            self._ensure_demo_accounts(user_id)
            rows = [a for a in self._accounts.values() if a.user_id == user_id]
        rows.sort(key=lambda x: str(x.id))
        total = len(rows)
        total_pages = (total + page_size - 1) // page_size if total else 0
        start = page_index * page_size
        chunk = rows[start : start + page_size]
        content = [self.card_account_dto(a.id, embed_tx=False) for a in chunk]
        return PageCardAccount(
            totalPages=total_pages,
            totalElements=total,
            size=page_size,
            content=content,
            number=page_index,
            sort=_sort,
            numberOfElements=len(content),
            first=page_index == 0 or total == 0,
            last=total == 0 or start + len(content) >= total,
            pageable=PageableObject(
                offset=start,
                sort=_sort,
                paged=True,
                unpaged=False,
                pageNumber=page_index,
                pageSize=page_size,
            ),
            empty=len(content) == 0,
        )

    def page_transactions(
        self,
        account_id: UUID,
        page_index: int,
        page_size: int,
    ) -> PageTransactionOperation | None:
        with self._lock:
            ops = list(self._tx.get(account_id, ()))
        if account_id not in self._accounts:
            return None
        total = len(ops)
        total_pages = (total + page_size - 1) // page_size if total else 0
        start = page_index * page_size
        chunk = ops[start : start + page_size]
        return PageTransactionOperation(
            totalPages=total_pages,
            totalElements=total,
            size=page_size,
            content=chunk,
            number=page_index,
            sort=_sort,
            numberOfElements=len(chunk),
            first=page_index == 0 or total == 0,
            last=total == 0 or start + len(chunk) >= total,
            pageable=PageableObject(
                offset=start,
                sort=_sort,
                paged=True,
                unpaged=False,
                pageNumber=page_index,
                pageSize=page_size,
            ),
            empty=len(chunk) == 0,
        )

    def withdraw(
        self,
        user_id: UUID,
        body: WithdrawDto,
    ) -> tuple[Literal["ok", "forbidden", "bad", "funds"], TransactionOperation | None]:
        with self._lock:
            if body.cardAccountId is None or body.sum is None:
                return "bad", None
            a = self._accounts.get(body.cardAccountId)
            if a is None:
                return "bad", None
            if a.user_id != user_id or a.deleted:
                return "forbidden", None
            if a.balance < body.sum:
                return "funds", None
            a.balance -= body.sum
            op = TransactionOperation(
                id=uuid4(),
                cardAccountId=body.cardAccountId,
                dateTime=datetime.now(UTC),
                transactionType="WITHDRAWAL",
                transactionActoin="withdraw",
                transactionStatus="COMPLETE",
                money=_money(body.sum, a.currency_code),
            )
            self._tx.setdefault(body.cardAccountId, []).append(op)
            return "ok", op

    def enroll(
        self,
        user_id: UUID,
        body: EnrollDto,
    ) -> tuple[Literal["ok", "forbidden", "bad"], TransactionOperation | None]:
        with self._lock:
            if body.cardAccountId is None or body.money is None or body.money.value is None:
                return "bad", None
            a = self._accounts.get(body.cardAccountId)
            if a is None:
                return "bad", None
            if a.user_id != user_id or a.deleted:
                return "forbidden", None
            add = body.money.value
            cur = a.currency_code
            if body.money.currency is not None:
                cur = body.money.currency.root
            a.balance += add
            op = TransactionOperation(
                id=uuid4(),
                cardAccountId=body.cardAccountId,
                dateTime=datetime.now(UTC),
                transactionType="ENROLLMENT",
                transactionActoin=body.destination or "enroll",
                transactionStatus="COMPLETE",
                money=_money(add, cur),
            )
            self._tx.setdefault(body.cardAccountId, []).append(op)
            return "ok", op

    def transfer_money(
        self,
        user_id: UUID,
        body: TransferMoneyDto,
    ) -> tuple[
        Literal["ok", "bad", "forbidden", "funds", "not_found"],
        list[tuple[UUID, TransactionOperation]],
    ]:
        """Перевод: withdraw на from (если есть), enroll / погашение на цель. Сумма в amountCurrency."""
        broadcast: list[tuple[UUID, TransactionOperation]] = []
        raw_amt = body.amount
        if raw_amt is None or raw_amt <= 0:
            return "bad", []

        amt_cur: Literal["DOLLAR", "EURO", "RUBLE"] = body.amountCurrency.root

        with self._lock:
            if body.targetKind == "ACCOUNT":
                if body.targetCardAccountId is None:
                    return "bad", []
                tid = body.targetCardAccountId
                to_acc = self._accounts.get(tid)
                if to_acc is None or to_acc.deleted:
                    return "not_found", []
            else:
                if body.targetCreditId is None:
                    return "bad", []
                cr = self._credits.get(body.targetCreditId)
                if cr is None or cr.userId != user_id:
                    return "forbidden", []
                if cr.cardAccount is None:
                    return "bad", []
                linked_id = cr.cardAccount
                to_acc = self._accounts.get(linked_id)
                if to_acc is None or to_acc.deleted:
                    return "not_found", []

            if body.fromCardAccountId is not None:
                fid = body.fromCardAccountId
                if body.targetKind == "ACCOUNT" and fid == body.targetCardAccountId:
                    return "bad", []
                from_acc = self._accounts.get(fid)
                if from_acc is None or from_acc.user_id != user_id or from_acc.deleted:
                    return "forbidden", []
                debit = convert_amount(raw_amt, amt_cur, from_acc.currency_code)
                if from_acc.balance < debit:
                    return "funds", []
                w_action = "payback" if body.targetKind == "CREDIT" else "Transaction"
                from_acc.balance -= debit
                wop = TransactionOperation(
                    id=uuid4(),
                    cardAccountId=fid,
                    dateTime=datetime.now(UTC),
                    transactionType="WITHDRAWAL",
                    transactionActoin=w_action,
                    transactionStatus="COMPLETE",
                    money=_money(debit, from_acc.currency_code),
                )
                self._tx.setdefault(fid, []).append(wop)
                broadcast.append((fid, wop))

            if body.targetKind == "ACCOUNT":
                assert body.targetCardAccountId is not None
                tid = body.targetCardAccountId
                acc = self._accounts[tid]
                recv = convert_amount(raw_amt, amt_cur, acc.currency_code)
                acc.balance += recv
                eop = TransactionOperation(
                    id=uuid4(),
                    cardAccountId=tid,
                    dateTime=datetime.now(UTC),
                    transactionType="ENROLLMENT",
                    transactionActoin="Transaction",
                    transactionStatus="COMPLETE",
                    money=_money(recv, acc.currency_code),
                )
                self._tx.setdefault(tid, []).append(eop)
                broadcast.append((tid, eop))
            else:
                assert body.targetCreditId is not None
                cr = self._credits[body.targetCreditId]
                pay_ccy: Literal["DOLLAR", "EURO", "RUBLE"] = (
                    cr.currency.root if cr.currency is not None else "RUBLE"
                )
                pay_amt = convert_amount(raw_amt, amt_cur, pay_ccy)
                cd = cr.currentDebtSum or 0.0
                cr.currentDebtSum = max(0.0, cd - pay_amt)
                assert cr.cardAccount is not None
                linked_id = cr.cardAccount
                la = self._accounts[linked_id]
                recv = convert_amount(raw_amt, amt_cur, la.currency_code)
                eop = TransactionOperation(
                    id=uuid4(),
                    cardAccountId=linked_id,
                    dateTime=datetime.now(UTC),
                    transactionType="ENROLLMENT",
                    transactionActoin="Transaction",
                    transactionStatus="COMPLETE",
                    money=_money(recv, la.currency_code),
                )
                self._tx.setdefault(linked_id, []).append(eop)
                broadcast.append((linked_id, eop))

        return "ok", broadcast

    # --- credits ---
    def create_credit_rule(self, dto: CreditRuleDTO) -> CreditRule:
        rid = uuid4()
        rule = CreditRule(
            id=rid,
            percentageStrategy=dto.percentageStrategy,
            collectionPeriodSeconds=dto.collectionPeriodSeconds,
            openingDate=dto.openingDate,
            ruleName=dto.ruleName,
            percentage=dto.percentage,
        )
        with self._lock:
            self._credit_rules[rid] = rule
        return rule

    def edit_credit_rule(self, rule_id: UUID, dto: CreditRuleDTO) -> CreditRule | None:
        with self._lock:
            old = self._credit_rules.get(rule_id)
            if old is None:
                return None
            new = CreditRule(
                id=rule_id,
                percentageStrategy=dto.percentageStrategy,
                collectionPeriodSeconds=dto.collectionPeriodSeconds,
                openingDate=dto.openingDate,
                ruleName=dto.ruleName,
                percentage=dto.percentage,
            )
            self._credit_rules[rule_id] = new
        return new

    def get_credit_rule(self, rule_id: UUID) -> CreditRule | None:
        with self._lock:
            return self._credit_rules.get(rule_id)

    def list_credit_rules(self) -> list[CreditRule]:
        with self._lock:
            return list(self._credit_rules.values())

    def delete_credit_rule(self, rule_id: UUID) -> bool:
        with self._lock:
            if rule_id not in self._credit_rules:
                return False
            del self._credit_rules[rule_id]
        return True

    def create_credit(self, dto: CreditCreateModelDto) -> Credit | None:
        if dto.userId is None or dto.cardAccount is None or dto.creditRuleId is None:
            return None
        if not self.account_owned_by(dto.cardAccount, dto.userId):
            return None
        rule = self.get_credit_rule(dto.creditRuleId)
        if rule is None:
            return None
        initial = dto.money.value if dto.money and dto.money.value is not None else 0.0
        cur: Literal["DOLLAR", "EURO", "RUBLE"] = "RUBLE"
        if dto.money and dto.money.currency is not None:
            cur = dto.money.currency.root
        cid = uuid4()
        cr = Credit(
            id=cid,
            userId=dto.userId,
            cardAccount=dto.cardAccount,
            lastInterestUpdate=datetime.now(UTC),
            currentDebtSum=initial,
            initialDebt=initial,
            interestDebtSum=0.0,
            currency=Currency(root=cur),
            creditRule=rule,
        )
        with self._lock:
            self._credits[cid] = cr
        return cr

    def make_enrollment(self, card_account_id: UUID, user_id: UUID) -> Credit | None:
        """Упрощённый мок: находим кредит по счёту и уменьшаем долг."""
        with self._lock:
            for c in self._credits.values():
                if c.cardAccount == card_account_id and c.userId == user_id:
                    amt = 1.0
                    if c.currentDebtSum and c.currentDebtSum > 0:
                        c.currentDebtSum = max(0.0, c.currentDebtSum - amt)
                    return c.model_copy(deep=True)
        return None

    def credits_by_user(self, user_id: UUID) -> list[Credit]:
        with self._lock:
            return [c for c in self._credits.values() if c.userId == user_id]

    def credit_by_card(self, card_account_id: UUID) -> Credit | None:
        with self._lock:
            for c in self._credits.values():
                if c.cardAccount == card_account_id:
                    return c.model_copy(deep=True)
        return None

    def delete_credit(self, credit_id: UUID) -> bool:
        with self._lock:
            if credit_id not in self._credits:
                return False
            del self._credits[credit_id]
        return True


def user_to_dto(u: MockUser) -> UserDto:
    allowed: set[str] = {"CLIENT", "WORKER", "BLOCKED_CLIENT", "BLOCKED_WORKER"}
    rl = [r for r in u.roles if r in allowed]
    if not rl:
        rl = ["CLIENT"]
    return UserDto(
        id=u.id,
        name=u.name,
        email=u.email,
        roles=rl,  # type: ignore[arg-type]
        active=u.active,
    )


store = MockStore()


def _seed_bff_mocks() -> None:
    """Стартовый пользователь для ручных проверок и набор CreditRule (если store пустой)."""
    email_key = "test@email.com"
    with store._lock:
        if email_key not in store._users_by_email:
            salt = secrets.token_bytes(16)
            pwd_hash = _hash_password("asdfasdf123", salt)
            store._users_by_email[email_key] = MockUser(
                id=uuid4(),
                name="Test user",
                email=email_key,
                salt=salt,
                pwd_hash=pwd_hash,
            )
        if not store._credit_rules:
            now = datetime.now(UTC)
            demo_rules: list[CreditRule] = [
                CreditRule(
                    id=uuid4(),
                    ruleName="credit rule 1",
                    percentage=53.0,
                    percentageStrategy="FROM_TOTAL_DEBT",
                    collectionPeriodSeconds=12 * 86_400,
                    openingDate=now,
                ),
                CreditRule(
                    id=uuid4(),
                    ruleName="Starter 12.5%",
                    percentage=12.5,
                    percentageStrategy="FROM_REMAINING_DEBT",
                    collectionPeriodSeconds=7 * 86_400,
                    openingDate=now,
                ),
                CreditRule(
                    id=uuid4(),
                    ruleName="Express weekly",
                    percentage=8.0,
                    percentageStrategy="FROM_REMAINING_DEBT",
                    collectionPeriodSeconds=86_400,
                    openingDate=now,
                ),
                CreditRule(
                    id=uuid4(),
                    ruleName="Long-term low",
                    percentage=3.25,
                    percentageStrategy="FROM_TOTAL_DEBT",
                    collectionPeriodSeconds=30 * 86_400,
                    openingDate=now,
                ),
            ]
            for r in demo_rules:
                if r.id is not None:
                    store._credit_rules[r.id] = r


_seed_bff_mocks()

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.transaction_operation_transaction_status import TransactionOperationTransactionStatus
from ..models.transaction_operation_transaction_type import TransactionOperationTransactionType
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from uuid import UUID
import datetime

if TYPE_CHECKING:
  from ..models.card_account import CardAccount





T = TypeVar("T", bound="TransactionOperation")



@_attrs_define
class TransactionOperation:
    """ 
        Attributes:
            id (UUID | Unset):
            account (CardAccount | Unset):
            date_time (datetime.datetime | Unset):
            transaction_type (TransactionOperationTransactionType | Unset):
            transaction_status (TransactionOperationTransactionStatus | Unset):
            action (str | Unset):
            currency (str | Unset):
            money (float | Unset):
     """

    id: UUID | Unset = UNSET
    account: CardAccount | Unset = UNSET
    date_time: datetime.datetime | Unset = UNSET
    transaction_type: TransactionOperationTransactionType | Unset = UNSET
    transaction_status: TransactionOperationTransactionStatus | Unset = UNSET
    action: str | Unset = UNSET
    currency: str | Unset = UNSET
    money: float | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.card_account import CardAccount
        id: str | Unset = UNSET
        if not isinstance(self.id, Unset):
            id = str(self.id)

        account: dict[str, Any] | Unset = UNSET
        if not isinstance(self.account, Unset):
            account = self.account.to_dict()

        date_time: str | Unset = UNSET
        if not isinstance(self.date_time, Unset):
            date_time = self.date_time.isoformat()

        transaction_type: str | Unset = UNSET
        if not isinstance(self.transaction_type, Unset):
            transaction_type = self.transaction_type.value


        transaction_status: str | Unset = UNSET
        if not isinstance(self.transaction_status, Unset):
            transaction_status = self.transaction_status.value


        action = self.action

        currency = self.currency

        money = self.money


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["id"] = id
        if account is not UNSET:
            field_dict["account"] = account
        if date_time is not UNSET:
            field_dict["dateTime"] = date_time
        if transaction_type is not UNSET:
            field_dict["transactionType"] = transaction_type
        if transaction_status is not UNSET:
            field_dict["transactionStatus"] = transaction_status
        if action is not UNSET:
            field_dict["action"] = action
        if currency is not UNSET:
            field_dict["currency"] = currency
        if money is not UNSET:
            field_dict["money"] = money

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.card_account import CardAccount
        d = dict(src_dict)
        _id = d.pop("id", UNSET)
        id: UUID | Unset
        if isinstance(_id,  Unset):
            id = UNSET
        else:
            id = UUID(_id)




        _account = d.pop("account", UNSET)
        account: CardAccount | Unset
        if isinstance(_account,  Unset):
            account = UNSET
        else:
            account = CardAccount.from_dict(_account)




        _date_time = d.pop("dateTime", UNSET)
        date_time: datetime.datetime | Unset
        if isinstance(_date_time,  Unset):
            date_time = UNSET
        else:
            date_time = isoparse(_date_time)




        _transaction_type = d.pop("transactionType", UNSET)
        transaction_type: TransactionOperationTransactionType | Unset
        if isinstance(_transaction_type,  Unset):
            transaction_type = UNSET
        else:
            transaction_type = TransactionOperationTransactionType(_transaction_type)




        _transaction_status = d.pop("transactionStatus", UNSET)
        transaction_status: TransactionOperationTransactionStatus | Unset
        if isinstance(_transaction_status,  Unset):
            transaction_status = UNSET
        else:
            transaction_status = TransactionOperationTransactionStatus(_transaction_status)




        action = d.pop("action", UNSET)

        currency = d.pop("currency", UNSET)

        money = d.pop("money", UNSET)

        transaction_operation = cls(
            id=id,
            account=account,
            date_time=date_time,
            transaction_type=transaction_type,
            transaction_status=transaction_status,
            action=action,
            currency=currency,
            money=money,
        )


        transaction_operation.additional_properties = d
        return transaction_operation

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties

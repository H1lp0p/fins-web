from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.payment_history_record_dto_transaction_status import PaymentHistoryRecordDTOTransactionStatus
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from uuid import UUID
import datetime






T = TypeVar("T", bound="PaymentHistoryRecordDTO")



@_attrs_define
class PaymentHistoryRecordDTO:
    """ 
        Attributes:
            id (UUID | Unset):
            sum_ (float | Unset):
            date (datetime.datetime | Unset):
            card_account (UUID | Unset):
            currency (str | Unset):
            transaction_status (PaymentHistoryRecordDTOTransactionStatus | Unset):
     """

    id: UUID | Unset = UNSET
    sum_: float | Unset = UNSET
    date: datetime.datetime | Unset = UNSET
    card_account: UUID | Unset = UNSET
    currency: str | Unset = UNSET
    transaction_status: PaymentHistoryRecordDTOTransactionStatus | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        id: str | Unset = UNSET
        if not isinstance(self.id, Unset):
            id = str(self.id)

        sum_ = self.sum_

        date: str | Unset = UNSET
        if not isinstance(self.date, Unset):
            date = self.date.isoformat()

        card_account: str | Unset = UNSET
        if not isinstance(self.card_account, Unset):
            card_account = str(self.card_account)

        currency = self.currency

        transaction_status: str | Unset = UNSET
        if not isinstance(self.transaction_status, Unset):
            transaction_status = self.transaction_status.value



        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["id"] = id
        if sum_ is not UNSET:
            field_dict["sum"] = sum_
        if date is not UNSET:
            field_dict["date"] = date
        if card_account is not UNSET:
            field_dict["cardAccount"] = card_account
        if currency is not UNSET:
            field_dict["currency"] = currency
        if transaction_status is not UNSET:
            field_dict["transactionStatus"] = transaction_status

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _id = d.pop("id", UNSET)
        id: UUID | Unset
        if isinstance(_id,  Unset):
            id = UNSET
        else:
            id = UUID(_id)




        sum_ = d.pop("sum", UNSET)

        _date = d.pop("date", UNSET)
        date: datetime.datetime | Unset
        if isinstance(_date,  Unset):
            date = UNSET
        else:
            date = isoparse(_date)




        _card_account = d.pop("cardAccount", UNSET)
        card_account: UUID | Unset
        if isinstance(_card_account,  Unset):
            card_account = UNSET
        else:
            card_account = UUID(_card_account)




        currency = d.pop("currency", UNSET)

        _transaction_status = d.pop("transactionStatus", UNSET)
        transaction_status: PaymentHistoryRecordDTOTransactionStatus | Unset
        if isinstance(_transaction_status,  Unset):
            transaction_status = UNSET
        else:
            transaction_status = PaymentHistoryRecordDTOTransactionStatus(_transaction_status)




        payment_history_record_dto = cls(
            id=id,
            sum_=sum_,
            date=date,
            card_account=card_account,
            currency=currency,
            transaction_status=transaction_status,
        )


        payment_history_record_dto.additional_properties = d
        return payment_history_record_dto

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

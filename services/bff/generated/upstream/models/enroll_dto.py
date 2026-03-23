from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from uuid import UUID






T = TypeVar("T", bound="EnrollDto")



@_attrs_define
class EnrollDto:
    """ 
        Attributes:
            card_account_id (UUID | Unset):
            sum_ (float | Unset):
            destination (str | Unset):
            currency (str | Unset):
     """

    card_account_id: UUID | Unset = UNSET
    sum_: float | Unset = UNSET
    destination: str | Unset = UNSET
    currency: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        card_account_id: str | Unset = UNSET
        if not isinstance(self.card_account_id, Unset):
            card_account_id = str(self.card_account_id)

        sum_ = self.sum_

        destination = self.destination

        currency = self.currency


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if card_account_id is not UNSET:
            field_dict["cardAccountId"] = card_account_id
        if sum_ is not UNSET:
            field_dict["sum"] = sum_
        if destination is not UNSET:
            field_dict["destination"] = destination
        if currency is not UNSET:
            field_dict["currency"] = currency

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _card_account_id = d.pop("cardAccountId", UNSET)
        card_account_id: UUID | Unset
        if isinstance(_card_account_id,  Unset):
            card_account_id = UNSET
        else:
            card_account_id = UUID(_card_account_id)




        sum_ = d.pop("sum", UNSET)

        destination = d.pop("destination", UNSET)

        currency = d.pop("currency", UNSET)

        enroll_dto = cls(
            card_account_id=card_account_id,
            sum_=sum_,
            destination=destination,
            currency=currency,
        )


        enroll_dto.additional_properties = d
        return enroll_dto

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

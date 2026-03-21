from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from uuid import UUID






T = TypeVar("T", bound="TransferRequest")



@_attrs_define
class TransferRequest:
    """ 
        Attributes:
            from_card_account_id (UUID | Unset):
            to_card_account_id (UUID | Unset):
            sum_ (float | Unset):
            currency (str | Unset):
     """

    from_card_account_id: UUID | Unset = UNSET
    to_card_account_id: UUID | Unset = UNSET
    sum_: float | Unset = UNSET
    currency: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from_card_account_id: str | Unset = UNSET
        if not isinstance(self.from_card_account_id, Unset):
            from_card_account_id = str(self.from_card_account_id)

        to_card_account_id: str | Unset = UNSET
        if not isinstance(self.to_card_account_id, Unset):
            to_card_account_id = str(self.to_card_account_id)

        sum_ = self.sum_

        currency = self.currency


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if from_card_account_id is not UNSET:
            field_dict["fromCardAccountId"] = from_card_account_id
        if to_card_account_id is not UNSET:
            field_dict["toCardAccountId"] = to_card_account_id
        if sum_ is not UNSET:
            field_dict["sum"] = sum_
        if currency is not UNSET:
            field_dict["currency"] = currency

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _from_card_account_id = d.pop("fromCardAccountId", UNSET)
        from_card_account_id: UUID | Unset
        if isinstance(_from_card_account_id,  Unset):
            from_card_account_id = UNSET
        else:
            from_card_account_id = UUID(_from_card_account_id)




        _to_card_account_id = d.pop("toCardAccountId", UNSET)
        to_card_account_id: UUID | Unset
        if isinstance(_to_card_account_id,  Unset):
            to_card_account_id = UNSET
        else:
            to_card_account_id = UUID(_to_card_account_id)




        sum_ = d.pop("sum", UNSET)

        currency = d.pop("currency", UNSET)

        transfer_request = cls(
            from_card_account_id=from_card_account_id,
            to_card_account_id=to_card_account_id,
            sum_=sum_,
            currency=currency,
        )


        transfer_request.additional_properties = d
        return transfer_request

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

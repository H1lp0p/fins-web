from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from uuid import UUID






T = TypeVar("T", bound="TransferCurrencyRequest")



@_attrs_define
class TransferCurrencyRequest:
    """ 
        Attributes:
            from_card_account_id (UUID | Unset):
            to_card_account_id (UUID | Unset):
            sum_from (float | Unset):
            currency_from (str | Unset):
            currency_to (str | Unset):
     """

    from_card_account_id: UUID | Unset = UNSET
    to_card_account_id: UUID | Unset = UNSET
    sum_from: float | Unset = UNSET
    currency_from: str | Unset = UNSET
    currency_to: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from_card_account_id: str | Unset = UNSET
        if not isinstance(self.from_card_account_id, Unset):
            from_card_account_id = str(self.from_card_account_id)

        to_card_account_id: str | Unset = UNSET
        if not isinstance(self.to_card_account_id, Unset):
            to_card_account_id = str(self.to_card_account_id)

        sum_from = self.sum_from

        currency_from = self.currency_from

        currency_to = self.currency_to


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if from_card_account_id is not UNSET:
            field_dict["fromCardAccountId"] = from_card_account_id
        if to_card_account_id is not UNSET:
            field_dict["toCardAccountId"] = to_card_account_id
        if sum_from is not UNSET:
            field_dict["sumFrom"] = sum_from
        if currency_from is not UNSET:
            field_dict["currencyFrom"] = currency_from
        if currency_to is not UNSET:
            field_dict["currencyTo"] = currency_to

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




        sum_from = d.pop("sumFrom", UNSET)

        currency_from = d.pop("currencyFrom", UNSET)

        currency_to = d.pop("currencyTo", UNSET)

        transfer_currency_request = cls(
            from_card_account_id=from_card_account_id,
            to_card_account_id=to_card_account_id,
            sum_from=sum_from,
            currency_from=currency_from,
            currency_to=currency_to,
        )


        transfer_currency_request.additional_properties = d
        return transfer_currency_request

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

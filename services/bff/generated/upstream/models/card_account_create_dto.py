from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset






T = TypeVar("T", bound="CardAccountCreateDto")



@_attrs_define
class CardAccountCreateDto:
    """ 
        Attributes:
            name (str | Unset):
            currency (str | Unset):
            is_main (bool | Unset):
     """

    name: str | Unset = UNSET
    currency: str | Unset = UNSET
    is_main: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        name = self.name

        currency = self.currency

        is_main = self.is_main


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if name is not UNSET:
            field_dict["name"] = name
        if currency is not UNSET:
            field_dict["currency"] = currency
        if is_main is not UNSET:
            field_dict["isMain"] = is_main

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name", UNSET)

        currency = d.pop("currency", UNSET)

        is_main = d.pop("isMain", UNSET)

        card_account_create_dto = cls(
            name=name,
            currency=currency,
            is_main=is_main,
        )


        card_account_create_dto.additional_properties = d
        return card_account_create_dto

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

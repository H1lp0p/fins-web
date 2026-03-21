from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset






T = TypeVar("T", bound="CurrencyDto")



@_attrs_define
class CurrencyDto:
    """ 
        Attributes:
            id (str | Unset):
            num_code (str | Unset):
            char_code (str | Unset):
            nominal (int | Unset):
            name (str | Unset):
            value (float | Unset):
            previous (float | Unset):
     """

    id: str | Unset = UNSET
    num_code: str | Unset = UNSET
    char_code: str | Unset = UNSET
    nominal: int | Unset = UNSET
    name: str | Unset = UNSET
    value: float | Unset = UNSET
    previous: float | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        id = self.id

        num_code = self.num_code

        char_code = self.char_code

        nominal = self.nominal

        name = self.name

        value = self.value

        previous = self.previous


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["ID"] = id
        if num_code is not UNSET:
            field_dict["NumCode"] = num_code
        if char_code is not UNSET:
            field_dict["CharCode"] = char_code
        if nominal is not UNSET:
            field_dict["Nominal"] = nominal
        if name is not UNSET:
            field_dict["Name"] = name
        if value is not UNSET:
            field_dict["Value"] = value
        if previous is not UNSET:
            field_dict["Previous"] = previous

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("ID", UNSET)

        num_code = d.pop("NumCode", UNSET)

        char_code = d.pop("CharCode", UNSET)

        nominal = d.pop("Nominal", UNSET)

        name = d.pop("Name", UNSET)

        value = d.pop("Value", UNSET)

        previous = d.pop("Previous", UNSET)

        currency_dto = cls(
            id=id,
            num_code=num_code,
            char_code=char_code,
            nominal=nominal,
            name=name,
            value=value,
            previous=previous,
        )


        currency_dto.additional_properties = d
        return currency_dto

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

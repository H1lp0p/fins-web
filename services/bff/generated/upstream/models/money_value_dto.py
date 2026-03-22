from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.money_value_dto_currency import MoneyValueDtoCurrency
from ..types import UNSET, Unset






T = TypeVar("T", bound="MoneyValueDto")



@_attrs_define
class MoneyValueDto:
    """ 
        Attributes:
            value (float | Unset):
            currency (MoneyValueDtoCurrency | Unset):
     """

    value: float | Unset = UNSET
    currency: MoneyValueDtoCurrency | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        value = self.value

        currency: str | Unset = UNSET
        if not isinstance(self.currency, Unset):
            currency = self.currency.value



        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if value is not UNSET:
            field_dict["value"] = value
        if currency is not UNSET:
            field_dict["currency"] = currency

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        value = d.pop("value", UNSET)

        _currency = d.pop("currency", UNSET)
        currency: MoneyValueDtoCurrency | Unset
        if isinstance(_currency,  Unset):
            currency = UNSET
        else:
            currency = MoneyValueDtoCurrency(_currency)




        money_value_dto = cls(
            value=value,
            currency=currency,
        )


        money_value_dto.additional_properties = d
        return money_value_dto

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

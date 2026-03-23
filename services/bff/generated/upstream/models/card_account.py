from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from uuid import UUID






T = TypeVar("T", bound="CardAccount")



@_attrs_define
class CardAccount:
    """ 
        Attributes:
            is_main (bool):
            id (UUID | Unset):
            name (str | Unset):
            currency (str | Unset):
            user_id (UUID | Unset):
            money (float | Unset):
            deleted (bool | Unset):
     """

    is_main: bool
    id: UUID | Unset = UNSET
    name: str | Unset = UNSET
    currency: str | Unset = UNSET
    user_id: UUID | Unset = UNSET
    money: float | Unset = UNSET
    deleted: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        is_main = self.is_main

        id: str | Unset = UNSET
        if not isinstance(self.id, Unset):
            id = str(self.id)

        name = self.name

        currency = self.currency

        user_id: str | Unset = UNSET
        if not isinstance(self.user_id, Unset):
            user_id = str(self.user_id)

        money = self.money

        deleted = self.deleted


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "isMain": is_main,
        })
        if id is not UNSET:
            field_dict["id"] = id
        if name is not UNSET:
            field_dict["name"] = name
        if currency is not UNSET:
            field_dict["currency"] = currency
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if money is not UNSET:
            field_dict["money"] = money
        if deleted is not UNSET:
            field_dict["deleted"] = deleted

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        is_main = d.pop("isMain")

        _id = d.pop("id", UNSET)
        id: UUID | Unset
        if isinstance(_id,  Unset):
            id = UNSET
        else:
            id = UUID(_id)




        name = d.pop("name", UNSET)

        currency = d.pop("currency", UNSET)

        _user_id = d.pop("userId", UNSET)
        user_id: UUID | Unset
        if isinstance(_user_id,  Unset):
            user_id = UNSET
        else:
            user_id = UUID(_user_id)




        money = d.pop("money", UNSET)

        deleted = d.pop("deleted", UNSET)

        card_account = cls(
            is_main=is_main,
            id=id,
            name=name,
            currency=currency,
            user_id=user_id,
            money=money,
            deleted=deleted,
        )


        card_account.additional_properties = d
        return card_account

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

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast






T = TypeVar("T", bound="UserPreferencesDto")



@_attrs_define
class UserPreferencesDto:
    """ 
        Attributes:
            theme (str | Unset):
            hidden_accounts (list[str] | Unset):
     """

    theme: str | Unset = UNSET
    hidden_accounts: list[str] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        theme = self.theme

        hidden_accounts: list[str] | Unset = UNSET
        if not isinstance(self.hidden_accounts, Unset):
            hidden_accounts = self.hidden_accounts




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if theme is not UNSET:
            field_dict["theme"] = theme
        if hidden_accounts is not UNSET:
            field_dict["hiddenAccounts"] = hidden_accounts

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        theme = d.pop("theme", UNSET)

        hidden_accounts = cast(list[str], d.pop("hiddenAccounts", UNSET))


        user_preferences_dto = cls(
            theme=theme,
            hidden_accounts=hidden_accounts,
        )


        user_preferences_dto.additional_properties = d
        return user_preferences_dto

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

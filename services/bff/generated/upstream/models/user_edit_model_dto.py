from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.user_edit_model_dto_new_roles_item import UserEditModelDtoNewRolesItem
from ..types import UNSET, Unset
from typing import cast






T = TypeVar("T", bound="UserEditModelDto")



@_attrs_define
class UserEditModelDto:
    """ 
        Attributes:
            new_roles (list[UserEditModelDtoNewRolesItem] | Unset):
     """

    new_roles: list[UserEditModelDtoNewRolesItem] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        new_roles: list[str] | Unset = UNSET
        if not isinstance(self.new_roles, Unset):
            new_roles = []
            for new_roles_item_data in self.new_roles:
                new_roles_item = new_roles_item_data.value
                new_roles.append(new_roles_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if new_roles is not UNSET:
            field_dict["newRoles"] = new_roles

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _new_roles = d.pop("newRoles", UNSET)
        new_roles: list[UserEditModelDtoNewRolesItem] | Unset = UNSET
        if _new_roles is not UNSET:
            new_roles = []
            for new_roles_item_data in _new_roles:
                new_roles_item = UserEditModelDtoNewRolesItem(new_roles_item_data)



                new_roles.append(new_roles_item)


        user_edit_model_dto = cls(
            new_roles=new_roles,
        )


        user_edit_model_dto.additional_properties = d
        return user_edit_model_dto

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

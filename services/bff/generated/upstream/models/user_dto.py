from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.user_dto_roles_item import UserDtoRolesItem
from ..types import UNSET, Unset
from typing import cast
from uuid import UUID






T = TypeVar("T", bound="UserDto")



@_attrs_define
class UserDto:
    """ 
        Attributes:
            id (UUID):
            name (str):
            email (str):
            roles (list[UserDtoRolesItem] | Unset):
            active (bool | Unset):
     """

    id: UUID
    name: str
    email: str
    roles: list[UserDtoRolesItem] | Unset = UNSET
    active: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        id = str(self.id)

        name = self.name

        email = self.email

        roles: list[str] | Unset = UNSET
        if not isinstance(self.roles, Unset):
            roles = []
            for roles_item_data in self.roles:
                roles_item = roles_item_data.value
                roles.append(roles_item)



        active = self.active


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "name": name,
            "email": email,
        })
        if roles is not UNSET:
            field_dict["roles"] = roles
        if active is not UNSET:
            field_dict["active"] = active

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = UUID(d.pop("id"))




        name = d.pop("name")

        email = d.pop("email")

        _roles = d.pop("roles", UNSET)
        roles: list[UserDtoRolesItem] | Unset = UNSET
        if _roles is not UNSET:
            roles = []
            for roles_item_data in _roles:
                roles_item = UserDtoRolesItem(roles_item_data)



                roles.append(roles_item)


        active = d.pop("active", UNSET)

        user_dto = cls(
            id=id,
            name=name,
            email=email,
            roles=roles,
            active=active,
        )


        user_dto.additional_properties = d
        return user_dto

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

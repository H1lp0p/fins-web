from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from uuid import UUID






T = TypeVar("T", bound="CreditRatingDTO")



@_attrs_define
class CreditRatingDTO:
    """ 
        Attributes:
            id (UUID | Unset):
            user_id (UUID | Unset):
            rating (float | Unset):
     """

    id: UUID | Unset = UNSET
    user_id: UUID | Unset = UNSET
    rating: float | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        id: str | Unset = UNSET
        if not isinstance(self.id, Unset):
            id = str(self.id)

        user_id: str | Unset = UNSET
        if not isinstance(self.user_id, Unset):
            user_id = str(self.user_id)

        rating = self.rating


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["id"] = id
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if rating is not UNSET:
            field_dict["rating"] = rating

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _id = d.pop("id", UNSET)
        id: UUID | Unset
        if isinstance(_id,  Unset):
            id = UNSET
        else:
            id = UUID(_id)




        _user_id = d.pop("userId", UNSET)
        user_id: UUID | Unset
        if isinstance(_user_id,  Unset):
            user_id = UNSET
        else:
            user_id = UUID(_user_id)




        rating = d.pop("rating", UNSET)

        credit_rating_dto = cls(
            id=id,
            user_id=user_id,
            rating=rating,
        )


        credit_rating_dto.additional_properties = d
        return credit_rating_dto

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

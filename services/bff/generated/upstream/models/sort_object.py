from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset






T = TypeVar("T", bound="SortObject")



@_attrs_define
class SortObject:
    """ 
        Attributes:
            unsorted (bool | Unset):
            sorted_ (bool | Unset):
            empty (bool | Unset):
     """

    unsorted: bool | Unset = UNSET
    sorted_: bool | Unset = UNSET
    empty: bool | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        unsorted = self.unsorted

        sorted_ = self.sorted_

        empty = self.empty


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if unsorted is not UNSET:
            field_dict["unsorted"] = unsorted
        if sorted_ is not UNSET:
            field_dict["sorted"] = sorted_
        if empty is not UNSET:
            field_dict["empty"] = empty

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        unsorted = d.pop("unsorted", UNSET)

        sorted_ = d.pop("sorted", UNSET)

        empty = d.pop("empty", UNSET)

        sort_object = cls(
            unsorted=unsorted,
            sorted_=sorted_,
            empty=empty,
        )


        sort_object.additional_properties = d
        return sort_object

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

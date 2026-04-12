from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast

if TYPE_CHECKING:
  from ..models.sort_object import SortObject





T = TypeVar("T", bound="PageableObject")



@_attrs_define
class PageableObject:
    """ 
        Attributes:
            unpaged (bool | Unset):
            page_number (int | Unset):
            paged (bool | Unset):
            page_size (int | Unset):
            offset (int | Unset):
            sort (SortObject | Unset):
     """

    unpaged: bool | Unset = UNSET
    page_number: int | Unset = UNSET
    paged: bool | Unset = UNSET
    page_size: int | Unset = UNSET
    offset: int | Unset = UNSET
    sort: SortObject | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.sort_object import SortObject
        unpaged = self.unpaged

        page_number = self.page_number

        paged = self.paged

        page_size = self.page_size

        offset = self.offset

        sort: dict[str, Any] | Unset = UNSET
        if not isinstance(self.sort, Unset):
            sort = self.sort.to_dict()


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if unpaged is not UNSET:
            field_dict["unpaged"] = unpaged
        if page_number is not UNSET:
            field_dict["pageNumber"] = page_number
        if paged is not UNSET:
            field_dict["paged"] = paged
        if page_size is not UNSET:
            field_dict["pageSize"] = page_size
        if offset is not UNSET:
            field_dict["offset"] = offset
        if sort is not UNSET:
            field_dict["sort"] = sort

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.sort_object import SortObject
        d = dict(src_dict)
        unpaged = d.pop("unpaged", UNSET)

        page_number = d.pop("pageNumber", UNSET)

        paged = d.pop("paged", UNSET)

        page_size = d.pop("pageSize", UNSET)

        offset = d.pop("offset", UNSET)

        _sort = d.pop("sort", UNSET)
        sort: SortObject | Unset
        if isinstance(_sort,  Unset):
            sort = UNSET
        else:
            sort = SortObject.from_dict(_sort)




        pageable_object = cls(
            unpaged=unpaged,
            page_number=page_number,
            paged=paged,
            page_size=page_size,
            offset=offset,
            sort=sort,
        )


        pageable_object.additional_properties = d
        return pageable_object

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

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast

if TYPE_CHECKING:
  from ..models.bff_error_body_field_errors import BffErrorBodyFieldErrors





T = TypeVar("T", bound="BffErrorBody")



@_attrs_define
class BffErrorBody:
    """ Обобщённое тело ошибки (BFF/шлюз; фактический JSON может отличаться).

        Attributes:
            message (str | Unset):
            code (str | Unset):
            field_errors (BffErrorBodyFieldErrors | Unset):
     """

    message: str | Unset = UNSET
    code: str | Unset = UNSET
    field_errors: BffErrorBodyFieldErrors | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.bff_error_body_field_errors import BffErrorBodyFieldErrors
        message = self.message

        code = self.code

        field_errors: dict[str, Any] | Unset = UNSET
        if not isinstance(self.field_errors, Unset):
            field_errors = self.field_errors.to_dict()


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if message is not UNSET:
            field_dict["message"] = message
        if code is not UNSET:
            field_dict["code"] = code
        if field_errors is not UNSET:
            field_dict["fieldErrors"] = field_errors

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.bff_error_body_field_errors import BffErrorBodyFieldErrors
        d = dict(src_dict)
        message = d.pop("message", UNSET)

        code = d.pop("code", UNSET)

        _field_errors = d.pop("fieldErrors", UNSET)
        field_errors: BffErrorBodyFieldErrors | Unset
        if isinstance(_field_errors,  Unset):
            field_errors = UNSET
        else:
            field_errors = BffErrorBodyFieldErrors.from_dict(_field_errors)




        bff_error_body = cls(
            message=message,
            code=code,
            field_errors=field_errors,
        )


        bff_error_body.additional_properties = d
        return bff_error_body

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

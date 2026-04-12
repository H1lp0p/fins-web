from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
import datetime

if TYPE_CHECKING:
  from ..models.currency_client_dto_valute import CurrencyClientDtoValute





T = TypeVar("T", bound="CurrencyClientDto")



@_attrs_define
class CurrencyClientDto:
    """ 
        Attributes:
            date (datetime.datetime | Unset):
            previous_date (datetime.datetime | Unset):
            previous_url (str | Unset):
            timestamp (datetime.datetime | Unset):
            valute (CurrencyClientDtoValute | Unset):
     """

    date: datetime.datetime | Unset = UNSET
    previous_date: datetime.datetime | Unset = UNSET
    previous_url: str | Unset = UNSET
    timestamp: datetime.datetime | Unset = UNSET
    valute: CurrencyClientDtoValute | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.currency_client_dto_valute import CurrencyClientDtoValute
        date: str | Unset = UNSET
        if not isinstance(self.date, Unset):
            date = self.date.isoformat()

        previous_date: str | Unset = UNSET
        if not isinstance(self.previous_date, Unset):
            previous_date = self.previous_date.isoformat()

        previous_url = self.previous_url

        timestamp: str | Unset = UNSET
        if not isinstance(self.timestamp, Unset):
            timestamp = self.timestamp.isoformat()

        valute: dict[str, Any] | Unset = UNSET
        if not isinstance(self.valute, Unset):
            valute = self.valute.to_dict()


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if date is not UNSET:
            field_dict["Date"] = date
        if previous_date is not UNSET:
            field_dict["PreviousDate"] = previous_date
        if previous_url is not UNSET:
            field_dict["PreviousURL"] = previous_url
        if timestamp is not UNSET:
            field_dict["Timestamp"] = timestamp
        if valute is not UNSET:
            field_dict["Valute"] = valute

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.currency_client_dto_valute import CurrencyClientDtoValute
        d = dict(src_dict)
        _date = d.pop("Date", UNSET)
        date: datetime.datetime | Unset
        if isinstance(_date,  Unset):
            date = UNSET
        else:
            date = isoparse(_date)




        _previous_date = d.pop("PreviousDate", UNSET)
        previous_date: datetime.datetime | Unset
        if isinstance(_previous_date,  Unset):
            previous_date = UNSET
        else:
            previous_date = isoparse(_previous_date)




        previous_url = d.pop("PreviousURL", UNSET)

        _timestamp = d.pop("Timestamp", UNSET)
        timestamp: datetime.datetime | Unset
        if isinstance(_timestamp,  Unset):
            timestamp = UNSET
        else:
            timestamp = isoparse(_timestamp)




        _valute = d.pop("Valute", UNSET)
        valute: CurrencyClientDtoValute | Unset
        if isinstance(_valute,  Unset):
            valute = UNSET
        else:
            valute = CurrencyClientDtoValute.from_dict(_valute)




        currency_client_dto = cls(
            date=date,
            previous_date=previous_date,
            previous_url=previous_url,
            timestamp=timestamp,
            valute=valute,
        )


        currency_client_dto.additional_properties = d
        return currency_client_dto

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

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.credit_rule_percentage_strategy import CreditRulePercentageStrategy
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from uuid import UUID
import datetime






T = TypeVar("T", bound="CreditRule")



@_attrs_define
class CreditRule:
    """ 
        Attributes:
            id (UUID | Unset):
            percentage_strategy (CreditRulePercentageStrategy | Unset):
            collection_period_seconds (int | Unset):
            opening_date (datetime.datetime | Unset):
            rule_name (str | Unset):
            percentage (float | Unset):
     """

    id: UUID | Unset = UNSET
    percentage_strategy: CreditRulePercentageStrategy | Unset = UNSET
    collection_period_seconds: int | Unset = UNSET
    opening_date: datetime.datetime | Unset = UNSET
    rule_name: str | Unset = UNSET
    percentage: float | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        id: str | Unset = UNSET
        if not isinstance(self.id, Unset):
            id = str(self.id)

        percentage_strategy: str | Unset = UNSET
        if not isinstance(self.percentage_strategy, Unset):
            percentage_strategy = self.percentage_strategy.value


        collection_period_seconds = self.collection_period_seconds

        opening_date: str | Unset = UNSET
        if not isinstance(self.opening_date, Unset):
            opening_date = self.opening_date.isoformat()

        rule_name = self.rule_name

        percentage = self.percentage


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["id"] = id
        if percentage_strategy is not UNSET:
            field_dict["percentageStrategy"] = percentage_strategy
        if collection_period_seconds is not UNSET:
            field_dict["collectionPeriodSeconds"] = collection_period_seconds
        if opening_date is not UNSET:
            field_dict["openingDate"] = opening_date
        if rule_name is not UNSET:
            field_dict["ruleName"] = rule_name
        if percentage is not UNSET:
            field_dict["percentage"] = percentage

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




        _percentage_strategy = d.pop("percentageStrategy", UNSET)
        percentage_strategy: CreditRulePercentageStrategy | Unset
        if isinstance(_percentage_strategy,  Unset):
            percentage_strategy = UNSET
        else:
            percentage_strategy = CreditRulePercentageStrategy(_percentage_strategy)




        collection_period_seconds = d.pop("collectionPeriodSeconds", UNSET)

        _opening_date = d.pop("openingDate", UNSET)
        opening_date: datetime.datetime | Unset
        if isinstance(_opening_date,  Unset):
            opening_date = UNSET
        else:
            opening_date = isoparse(_opening_date)




        rule_name = d.pop("ruleName", UNSET)

        percentage = d.pop("percentage", UNSET)

        credit_rule = cls(
            id=id,
            percentage_strategy=percentage_strategy,
            collection_period_seconds=collection_period_seconds,
            opening_date=opening_date,
            rule_name=rule_name,
            percentage=percentage,
        )


        credit_rule.additional_properties = d
        return credit_rule

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

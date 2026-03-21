from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from uuid import UUID






T = TypeVar("T", bound="CreditCreateModelDto")



@_attrs_define
class CreditCreateModelDto:
    """ 
        Attributes:
            user_id (UUID | Unset):
            card_account (UUID | Unset):
            currency (str | Unset):
            total_debt (float | Unset):
            credit_rule_id (UUID | Unset):
     """

    user_id: UUID | Unset = UNSET
    card_account: UUID | Unset = UNSET
    currency: str | Unset = UNSET
    total_debt: float | Unset = UNSET
    credit_rule_id: UUID | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        user_id: str | Unset = UNSET
        if not isinstance(self.user_id, Unset):
            user_id = str(self.user_id)

        card_account: str | Unset = UNSET
        if not isinstance(self.card_account, Unset):
            card_account = str(self.card_account)

        currency = self.currency

        total_debt = self.total_debt

        credit_rule_id: str | Unset = UNSET
        if not isinstance(self.credit_rule_id, Unset):
            credit_rule_id = str(self.credit_rule_id)


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if card_account is not UNSET:
            field_dict["cardAccount"] = card_account
        if currency is not UNSET:
            field_dict["currency"] = currency
        if total_debt is not UNSET:
            field_dict["totalDebt"] = total_debt
        if credit_rule_id is not UNSET:
            field_dict["creditRuleId"] = credit_rule_id

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _user_id = d.pop("userId", UNSET)
        user_id: UUID | Unset
        if isinstance(_user_id,  Unset):
            user_id = UNSET
        else:
            user_id = UUID(_user_id)




        _card_account = d.pop("cardAccount", UNSET)
        card_account: UUID | Unset
        if isinstance(_card_account,  Unset):
            card_account = UNSET
        else:
            card_account = UUID(_card_account)




        currency = d.pop("currency", UNSET)

        total_debt = d.pop("totalDebt", UNSET)

        _credit_rule_id = d.pop("creditRuleId", UNSET)
        credit_rule_id: UUID | Unset
        if isinstance(_credit_rule_id,  Unset):
            credit_rule_id = UNSET
        else:
            credit_rule_id = UUID(_credit_rule_id)




        credit_create_model_dto = cls(
            user_id=user_id,
            card_account=card_account,
            currency=currency,
            total_debt=total_debt,
            credit_rule_id=credit_rule_id,
        )


        credit_create_model_dto.additional_properties = d
        return credit_create_model_dto

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

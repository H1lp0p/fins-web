from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from uuid import UUID
import datetime

if TYPE_CHECKING:
  from ..models.credit_rule import CreditRule





T = TypeVar("T", bound="Credit")



@_attrs_define
class Credit:
    """ 
        Attributes:
            id (UUID | Unset):
            user_id (UUID | Unset):
            card_account (UUID | Unset):
            last_interest_update (datetime.datetime | Unset):
            current_debt_sum (float | Unset):
            initial_debt (float | Unset):
            interest_debt_sum (float | Unset):
            credit_rule (CreditRule | Unset):
     """

    id: UUID | Unset = UNSET
    user_id: UUID | Unset = UNSET
    card_account: UUID | Unset = UNSET
    last_interest_update: datetime.datetime | Unset = UNSET
    current_debt_sum: float | Unset = UNSET
    initial_debt: float | Unset = UNSET
    interest_debt_sum: float | Unset = UNSET
    credit_rule: CreditRule | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.credit_rule import CreditRule
        id: str | Unset = UNSET
        if not isinstance(self.id, Unset):
            id = str(self.id)

        user_id: str | Unset = UNSET
        if not isinstance(self.user_id, Unset):
            user_id = str(self.user_id)

        card_account: str | Unset = UNSET
        if not isinstance(self.card_account, Unset):
            card_account = str(self.card_account)

        last_interest_update: str | Unset = UNSET
        if not isinstance(self.last_interest_update, Unset):
            last_interest_update = self.last_interest_update.isoformat()

        current_debt_sum = self.current_debt_sum

        initial_debt = self.initial_debt

        interest_debt_sum = self.interest_debt_sum

        credit_rule: dict[str, Any] | Unset = UNSET
        if not isinstance(self.credit_rule, Unset):
            credit_rule = self.credit_rule.to_dict()


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["id"] = id
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if card_account is not UNSET:
            field_dict["cardAccount"] = card_account
        if last_interest_update is not UNSET:
            field_dict["lastInterestUpdate"] = last_interest_update
        if current_debt_sum is not UNSET:
            field_dict["currentDebtSum"] = current_debt_sum
        if initial_debt is not UNSET:
            field_dict["initialDebt"] = initial_debt
        if interest_debt_sum is not UNSET:
            field_dict["interestDebtSum"] = interest_debt_sum
        if credit_rule is not UNSET:
            field_dict["creditRule"] = credit_rule

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.credit_rule import CreditRule
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




        _card_account = d.pop("cardAccount", UNSET)
        card_account: UUID | Unset
        if isinstance(_card_account,  Unset):
            card_account = UNSET
        else:
            card_account = UUID(_card_account)




        _last_interest_update = d.pop("lastInterestUpdate", UNSET)
        last_interest_update: datetime.datetime | Unset
        if isinstance(_last_interest_update,  Unset):
            last_interest_update = UNSET
        else:
            last_interest_update = isoparse(_last_interest_update)




        current_debt_sum = d.pop("currentDebtSum", UNSET)

        initial_debt = d.pop("initialDebt", UNSET)

        interest_debt_sum = d.pop("interestDebtSum", UNSET)

        _credit_rule = d.pop("creditRule", UNSET)
        credit_rule: CreditRule | Unset
        if isinstance(_credit_rule,  Unset):
            credit_rule = UNSET
        else:
            credit_rule = CreditRule.from_dict(_credit_rule)




        credit = cls(
            id=id,
            user_id=user_id,
            card_account=card_account,
            last_interest_update=last_interest_update,
            current_debt_sum=current_debt_sum,
            initial_debt=initial_debt,
            interest_debt_sum=interest_debt_sum,
            credit_rule=credit_rule,
        )


        credit.additional_properties = d
        return credit

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

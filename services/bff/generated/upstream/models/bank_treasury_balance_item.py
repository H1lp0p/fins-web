from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from typing import cast
from uuid import UUID

if TYPE_CHECKING:
  from ..models.money_value_dto import MoneyValueDto





T = TypeVar("T", bound="BankTreasuryBalanceItem")



@_attrs_define
class BankTreasuryBalanceItem:
    """ 
        Attributes:
            card_account_id (UUID):
            balance (MoneyValueDto):
     """

    card_account_id: UUID
    balance: MoneyValueDto
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.money_value_dto import MoneyValueDto
        card_account_id = str(self.card_account_id)

        balance = self.balance.to_dict()


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "cardAccountId": card_account_id,
            "balance": balance,
        })

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.money_value_dto import MoneyValueDto
        d = dict(src_dict)
        card_account_id = UUID(d.pop("cardAccountId"))




        balance = MoneyValueDto.from_dict(d.pop("balance"))




        bank_treasury_balance_item = cls(
            card_account_id=card_account_id,
            balance=balance,
        )


        bank_treasury_balance_item.additional_properties = d
        return bank_treasury_balance_item

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

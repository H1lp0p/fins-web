from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from typing import cast

if TYPE_CHECKING:
  from ..models.bank_treasury_balance_item import BankTreasuryBalanceItem





T = TypeVar("T", bound="BankTreasuryBalancesDto")



@_attrs_define
class BankTreasuryBalancesDto:
    """ 
        Attributes:
            accounts (list[BankTreasuryBalanceItem]):
     """

    accounts: list[BankTreasuryBalanceItem]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.bank_treasury_balance_item import BankTreasuryBalanceItem
        accounts = []
        for accounts_item_data in self.accounts:
            accounts_item = accounts_item_data.to_dict()
            accounts.append(accounts_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "accounts": accounts,
        })

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.bank_treasury_balance_item import BankTreasuryBalanceItem
        d = dict(src_dict)
        accounts = []
        _accounts = d.pop("accounts")
        for accounts_item_data in (_accounts):
            accounts_item = BankTreasuryBalanceItem.from_dict(accounts_item_data)



            accounts.append(accounts_item)


        bank_treasury_balances_dto = cls(
            accounts=accounts,
        )


        bank_treasury_balances_dto.additional_properties = d
        return bank_treasury_balances_dto

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

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, BinaryIO, TextIO, TYPE_CHECKING, Generator

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from uuid import UUID

if TYPE_CHECKING:
  from ..models.transaction_operation import TransactionOperation





T = TypeVar("T", bound="CardAccount")



@_attrs_define
class CardAccount:
    """ 
        Attributes:
            id (UUID | Unset):
            user_id (UUID | Unset):
            money (float | Unset):
            deleted (bool | Unset):
            transaction_operations (list[TransactionOperation] | Unset):
     """

    id: UUID | Unset = UNSET
    user_id: UUID | Unset = UNSET
    money: float | Unset = UNSET
    deleted: bool | Unset = UNSET
    transaction_operations: list[TransactionOperation] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)





    def to_dict(self) -> dict[str, Any]:
        from ..models.transaction_operation import TransactionOperation
        id: str | Unset = UNSET
        if not isinstance(self.id, Unset):
            id = str(self.id)

        user_id: str | Unset = UNSET
        if not isinstance(self.user_id, Unset):
            user_id = str(self.user_id)

        money = self.money

        deleted = self.deleted

        transaction_operations: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.transaction_operations, Unset):
            transaction_operations = []
            for transaction_operations_item_data in self.transaction_operations:
                transaction_operations_item = transaction_operations_item_data.to_dict()
                transaction_operations.append(transaction_operations_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["id"] = id
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if money is not UNSET:
            field_dict["money"] = money
        if deleted is not UNSET:
            field_dict["deleted"] = deleted
        if transaction_operations is not UNSET:
            field_dict["transactionOperations"] = transaction_operations

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.transaction_operation import TransactionOperation
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




        money = d.pop("money", UNSET)

        deleted = d.pop("deleted", UNSET)

        _transaction_operations = d.pop("transactionOperations", UNSET)
        transaction_operations: list[TransactionOperation] | Unset = UNSET
        if _transaction_operations is not UNSET:
            transaction_operations = []
            for transaction_operations_item_data in _transaction_operations:
                transaction_operations_item = TransactionOperation.from_dict(transaction_operations_item_data)



                transaction_operations.append(transaction_operations_item)


        card_account = cls(
            id=id,
            user_id=user_id,
            money=money,
            deleted=deleted,
            transaction_operations=transaction_operations,
        )


        card_account.additional_properties = d
        return card_account

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

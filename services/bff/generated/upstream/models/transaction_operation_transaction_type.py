from enum import Enum

class TransactionOperationTransactionType(str, Enum):
    ENROLLMENT = "ENROLLMENT"
    WITHDRAWAL = "WITHDRAWAL"

    def __str__(self) -> str:
        return str(self.value)

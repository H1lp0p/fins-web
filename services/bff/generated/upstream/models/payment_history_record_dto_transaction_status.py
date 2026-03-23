from enum import Enum

class PaymentHistoryRecordDTOTransactionStatus(str, Enum):
    COMPLETE = "COMPLETE"
    DECLINED = "DECLINED"
    IN_PROGRESS = "IN_PROGRESS"

    def __str__(self) -> str:
        return str(self.value)

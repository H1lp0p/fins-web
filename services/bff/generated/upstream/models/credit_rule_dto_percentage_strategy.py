from enum import Enum

class CreditRuleDTOPercentageStrategy(str, Enum):
    FROM_REMAINING_DEBT = "FROM_REMAINING_DEBT"
    FROM_TOTAL_DEBT = "FROM_TOTAL_DEBT"

    def __str__(self) -> str:
        return str(self.value)

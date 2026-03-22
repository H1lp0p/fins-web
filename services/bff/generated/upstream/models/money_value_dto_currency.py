from enum import Enum

class MoneyValueDtoCurrency(str, Enum):
    DOLLAR = "DOLLAR"
    EURO = "EURO"
    RUBLE = "RUBLE"

    def __str__(self) -> str:
        return str(self.value)

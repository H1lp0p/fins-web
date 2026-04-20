from __future__ import annotations
from typing import Literal

Cur = Literal["USD", "EUR", "RUB"]
USD_PER_EUR = 1 / 0.87
USD_PER_RUB = 1 / 82.37


def triple_for_base(base: Cur) -> dict[Cur, float]:
    if base == "USD":
        return {"USD": 1.0, "EUR": 0.87, "RUB": 82.37}
    if base == "EUR":
        return {"USD": USD_PER_EUR, "EUR": 1.0, "RUB": 82.37 * USD_PER_EUR}
    return {"USD": USD_PER_RUB, "EUR": 0.87 * USD_PER_RUB, "RUB": 1.0}


def convert_amount(amount: float, from_c: Cur, to_c: Cur) -> float:
    if from_c == to_c:
        return amount
    row = triple_for_base(from_c)
    return amount * row[to_c]

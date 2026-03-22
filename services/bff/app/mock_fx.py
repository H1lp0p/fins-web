from __future__ import annotations
from typing import Literal

Cur = Literal["DOLLAR", "EURO", "RUBLE"]
USD_PER_EUR = 1 / 0.87
USD_PER_RUB = 1 / 82.37


def triple_for_base(base: Cur) -> dict[Cur, float]:
    if base == "DOLLAR":
        return {"DOLLAR": 1.0, "EURO": 0.87, "RUBLE": 82.37}
    if base == "EURO":
        return {"DOLLAR": USD_PER_EUR, "EURO": 1.0, "RUBLE": 82.37 * USD_PER_EUR}
    return {"DOLLAR": USD_PER_RUB, "EURO": 0.87 * USD_PER_RUB, "RUBLE": 1.0}


def convert_amount(amount: float, from_c: Cur, to_c: Cur) -> float:
    if from_c == to_c:
        return amount
    row = triple_for_base(from_c)
    return amount * row[to_c]

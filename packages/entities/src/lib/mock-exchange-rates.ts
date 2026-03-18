import type { CurrencyCode } from "@fins/api";

/** Курсы относительно USD (мок до бэкенда). */
export const USD_PER_EUR = 1 / 0.87;
export const USD_PER_RUB = 1 / 82.37;

/**
 * Сколько единиц каждой валюты в 1 единице базы `base`
 * (как в виджете курса: при базе DOLLAR — 1 $, 0.87 €, 82.37 ₽).
 */
export function tripleForBase(base: CurrencyCode): Record<CurrencyCode, number> {
  switch (base) {
    case "DOLLAR":
      return { DOLLAR: 1, EURO: 0.87, RUBLE: 82.37 };
    case "EURO":
      return {
        DOLLAR: USD_PER_EUR,
        EURO: 1,
        RUBLE: 82.37 * USD_PER_EUR,
      };
    case "RUBLE":
      return {
        DOLLAR: USD_PER_RUB,
        EURO: 0.87 * USD_PER_RUB,
        RUBLE: 1,
      };
    default:
      return { DOLLAR: 1, EURO: 0.87, RUBLE: 82.37 };
  }
}

/** Сколько единиц `to` за 1 единицу `from`. */
export function mockRateFromTo(
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return 1;
  const t = tripleForBase(from);
  return t[to];
}

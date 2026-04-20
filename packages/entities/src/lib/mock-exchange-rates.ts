import type { CurrencyCode } from "@fins/api";

export const USD_PER_EUR = 1 / 0.87;
export const USD_PER_RUB = 1 / 82.37;

export function tripleForBase(base: CurrencyCode): Record<CurrencyCode, number> {
  switch (base) {
    case "USD":
      return { USD: 1, EUR: 0.87, RUB: 82.37 };
    case "EUR":
      return {
        USD: USD_PER_EUR,
        EUR: 1,
        RUB: 82.37 * USD_PER_EUR,
      };
    case "RUB":
      return {
        USD: USD_PER_RUB,
        EUR: 0.87 * USD_PER_RUB,
        RUB: 1,
      };
    default:
      return { USD: 1, EUR: 0.87, RUB: 82.37 };
  }
}

export function mockRateFromTo(
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return 1;
  const t = tripleForBase(from);
  return t[to];
}

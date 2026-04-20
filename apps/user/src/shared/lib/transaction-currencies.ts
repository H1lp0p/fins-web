import type { CurrencyCode } from "@fins/api";
import { DEFAULT_CHARS } from "@fins/ui-kit";

export const TRANSACTION_CURRENCY_SYMBOLS: readonly string[] = [
  DEFAULT_CHARS.USD,
  DEFAULT_CHARS.EUR,
  DEFAULT_CHARS.RUB,
];

const TRANSACTION_CURRENCY_CODES: readonly CurrencyCode[] = [
  "USD",
  "EUR",
  "RUB",
];

export function currencyCodeFromTransactionIndex(index: number): CurrencyCode {
  const n = TRANSACTION_CURRENCY_CODES.length;
  return TRANSACTION_CURRENCY_CODES[((index % n) + n) % n]!;
}

export function symbolIndexInTransactionCurrencies(symbol: string): number {
  const i = TRANSACTION_CURRENCY_SYMBOLS.indexOf(symbol);
  return i >= 0 ? i : 0;
}

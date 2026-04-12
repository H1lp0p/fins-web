import type { CurrencyCode } from "@fins/api";
import { DEFAULT_CHARS } from "@fins/ui-kit";

export function currencyCodeToAmountSymbol(
  code: CurrencyCode | undefined,
): DEFAULT_CHARS {
  switch (code) {
    case "DOLLAR":
      return DEFAULT_CHARS.DOLLAR;
    case "EURO":
      return DEFAULT_CHARS.EURO;
    case "RUBLE":
    default:
      return DEFAULT_CHARS.RUBLE;
  }
}

import type { CurrencyCode } from "@fins/api";
import { DEFAULT_CHARS } from "@fins/ui-kit";

export function currencyCodeToAmountSymbol(
  code: CurrencyCode | undefined,
): DEFAULT_CHARS {
  switch (code) {
    case "USD":
      return DEFAULT_CHARS.USD;
    case "EUR":
      return DEFAULT_CHARS.EUR;
    case "RUB":
    default:
      return DEFAULT_CHARS.RUB;
  }
}

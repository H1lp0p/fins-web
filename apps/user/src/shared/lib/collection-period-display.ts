import { DEFAULT_CHARS } from "@fins/ui-kit";

/** Максимум для отображения в формате `formatNumber` как у ui-kit (до 99.99). */
const MAX_AMOUNT = 99.99;

const SECOND = 1;
const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
/** Условный месяц для выбора единицы (как в типичных фин. расчётах). */
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export type CollectionPeriodDisplay =
  | { kind: "ok"; amount: number; symbol: DEFAULT_CHARS }
  | { kind: "empty" };

/**
 * Из секунд — самая «мелкая» единица из [DEFAULT_CHARS](ui-kit), при которой
 * значение не превышает `99.99` (две цифры до запятой в `formatNumber`).
 * Иначе — годы, при необходимости с ограничением до 99.99.
 */
export function collectionPeriodFromSeconds(
  totalSeconds: number | undefined,
): CollectionPeriodDisplay {
  if (totalSeconds == null || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    return { kind: "empty" };
  }

  const candidates: { divisor: number; symbol: DEFAULT_CHARS }[] = [
    { divisor: SECOND, symbol: DEFAULT_CHARS.SECOND },
    { divisor: MINUTE, symbol: DEFAULT_CHARS.MINUTE },
    { divisor: HOUR, symbol: DEFAULT_CHARS.HOUR },
    { divisor: DAY, symbol: DEFAULT_CHARS.DAY },
    { divisor: MONTH, symbol: DEFAULT_CHARS.MONTH },
    { divisor: YEAR, symbol: DEFAULT_CHARS.YEAR },
  ];

  for (const { divisor, symbol } of candidates) {
    const amount = totalSeconds / divisor;
    if (amount <= MAX_AMOUNT) {
      return { kind: "ok", amount, symbol };
    }
  }

  const years = totalSeconds / YEAR;
  return {
    kind: "ok",
    amount: Math.min(years, MAX_AMOUNT),
    symbol: DEFAULT_CHARS.YEAR,
  };
}

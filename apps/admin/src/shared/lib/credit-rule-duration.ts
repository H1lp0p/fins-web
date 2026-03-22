import { DEFAULT_CHARS } from "@fins/ui-kit";

const DAY = 86400;

/** Согласовано с `collection-period-display` в entities. */
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export const CREDIT_RULE_DURATION_UNITS = [
  "seconds",
  "hours",
  "days",
  "months",
  "years",
] as const;

export type CreditRuleDurationUnit = (typeof CREDIT_RULE_DURATION_UNITS)[number];

export function secondsPerDurationUnit(unit: CreditRuleDurationUnit): number {
  switch (unit) {
    case "seconds":
      return 1;
    case "hours":
      return 3600;
    case "days":
      return DAY;
    case "months":
      return MONTH;
    case "years":
      return YEAR;
    default: {
      const _x: never = unit;
      return _x;
    }
  }
}

export function trailingCharForUnit(unit: CreditRuleDurationUnit): DEFAULT_CHARS {
  switch (unit) {
    case "seconds":
      return DEFAULT_CHARS.SECOND;
    case "hours":
      return DEFAULT_CHARS.HOUR;
    case "days":
      return DEFAULT_CHARS.DAY;
    case "months":
      return DEFAULT_CHARS.MONTH;
    case "years":
      return DEFAULT_CHARS.YEAR;
    default: {
      const _x: never = unit;
      return _x;
    }
  }
}

export function nextDurationUnit(
  unit: CreditRuleDurationUnit,
): CreditRuleDurationUnit {
  const i = CREDIT_RULE_DURATION_UNITS.indexOf(unit);
  return CREDIT_RULE_DURATION_UNITS[(i + 1) % CREDIT_RULE_DURATION_UNITS.length];
}

import type {
  CreditCreateModelDto,
  CreditRuleDto,
  Currency,
  MoneyValueDto,
} from "../generated/public/generatedPublicApi";
import {
  fieldError,
  mergeFormFieldErrors,
  type FormFieldErrors,
  type FormValidationResult,
  validationFailed,
  validationOk,
} from "./types";
import {
  isMeaningfullyPresent,
  isNonEmptyId,
  parseNonNegativeNumber,
  parseStrictPositiveNumber,
  trimString,
} from "./utils";

const STRATEGIES = new Set<CreditRuleDto["percentageStrategy"]>([
  "FROM_REMAINING_DEBT",
  "FROM_TOTAL_DEBT",
]);

const CURRENCIES = new Set<Currency>(["USD", "EUR", "RUB"]);

export type CreditRuleFormInput = {
  ruleName?: unknown;
  percentage?: unknown;
  percentageStrategy?: unknown;
  collectionPeriodSeconds?: unknown;
  openingDate?: unknown;
};

export function validateCreditRuleForm(
  input: CreditRuleFormInput,
): FormValidationResult<CreditRuleDto> {
  const errors: FormFieldErrors[] = [];
  const ruleName = trimString(input.ruleName);
  if (ruleName.length === 0) {
    errors.push(fieldError("ruleName", "Укажите название правила"));
  }
  let percentage: number | undefined;
  if (isMeaningfullyPresent(input.percentage)) {
    const pct = parseNonNegativeNumber(input.percentage);
    if (!pct.ok) {
      errors.push(fieldError("percentage", pct.message));
    } else if (pct.value > 100) {
      errors.push(fieldError("percentage", "Процент не может быть больше 100"));
    } else {
      percentage = pct.value;
    }
  }
  let percentageStrategy: CreditRuleDto["percentageStrategy"] | undefined;
  if (input.percentageStrategy !== undefined && input.percentageStrategy !== "") {
    const s = input.percentageStrategy as CreditRuleDto["percentageStrategy"];
    if (!STRATEGIES.has(s)) {
      errors.push(fieldError("percentageStrategy", "Выберите стратегию"));
    } else {
      percentageStrategy = s;
    }
  }
  let collectionPeriodSeconds: number | undefined;
  if (isMeaningfullyPresent(input.collectionPeriodSeconds)) {
    const sec = parseStrictPositiveNumber(input.collectionPeriodSeconds);
    if (!sec.ok) {
      errors.push(fieldError("collectionPeriodSeconds", sec.message));
    } else if (!Number.isInteger(sec.value)) {
      errors.push(
        fieldError("collectionPeriodSeconds", "Укажите целое число секунд"),
      );
    } else {
      collectionPeriodSeconds = sec.value;
    }
  }
  const openingDateRaw = trimString(input.openingDate);
  let openingDate: string | undefined;
  if (openingDateRaw.length > 0) {
    // datetime-local даёт «YYYY-MM-DDTHH:mm» — дополняем секунды; бэкенд (Java LocalDateTime) ждёт строку без таймзоны.
    let normalized = openingDateRaw;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
      normalized = `${normalized}:00`;
    }
    const t = Date.parse(normalized);
    if (Number.isNaN(t)) {
      errors.push(fieldError("openingDate", "Некорректная дата"));
    } else {
      openingDate = normalized;
    }
  }
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  return validationOk({
    ruleName,
    ...(percentage !== undefined ? { percentage } : {}),
    ...(percentageStrategy !== undefined ? { percentageStrategy } : {}),
    ...(collectionPeriodSeconds !== undefined ? { collectionPeriodSeconds } : {}),
    ...(openingDate !== undefined ? { openingDate } : {}),
  });
}

export type CreditCreateFormInput = {
  userId?: unknown;
  cardAccount?: unknown;
  creditRuleId?: unknown;
  moneyValue?: unknown;
  moneyCurrency?: unknown;
};

export function validateCreditCreateForm(
  input: CreditCreateFormInput,
): FormValidationResult<CreditCreateModelDto> {
  const errors: FormFieldErrors[] = [];
  if (!isNonEmptyId(input.userId)) {
    errors.push(fieldError("userId", "Signed-in user is required"));
  }
  if (!isNonEmptyId(input.cardAccount)) {
    errors.push(fieldError("cardAccount", "Pick a debit account"));
  }
  if (!isNonEmptyId(input.creditRuleId)) {
    errors.push(fieldError("creditRuleId", "Pick a credit rule"));
  }

  let moneyValue: number | undefined;
  if (typeof input.moneyValue === "number") {
    if (!Number.isFinite(input.moneyValue) || input.moneyValue <= 0) {
      errors.push(
        fieldError("money.value", "Principal must be a positive number"),
      );
    } else {
      moneyValue = input.moneyValue;
    }
  } else if (typeof input.moneyValue === "string") {
    const t = input.moneyValue.trim();
    if (t.length === 0) {
      errors.push(fieldError("money.value", "Principal is required"));
    } else {
      const n = Number(t);
      if (!Number.isFinite(n) || n <= 0) {
        errors.push(
          fieldError("money.value", "Principal must be a positive number"),
        );
      } else {
        moneyValue = n;
      }
    }
  } else if (input.moneyValue !== undefined && input.moneyValue !== null) {
    errors.push(
      fieldError("money.value", "Principal must be a positive number"),
    );
  } else {
    errors.push(fieldError("money.value", "Principal is required"));
  }

  const curRaw = trimString(input.moneyCurrency);
  const currency = CURRENCIES.has(curRaw as Currency)
    ? (curRaw as Currency)
    : undefined;
  if (currency === undefined) {
    errors.push(
      fieldError(
        "money.currency",
        "Currency comes from the account — pick an account first",
      ),
    );
  }
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  if (moneyValue === undefined || currency === undefined) {
    return validationFailed(
      fieldError("money.value", "Principal must be a positive number"),
    );
  }
  const money: MoneyValueDto = {
    value: moneyValue,
    currency,
  };
  return validationOk({
    userId: trimString(input.userId),
    cardAccount: trimString(input.cardAccount),
    creditRuleId: trimString(input.creditRuleId),
    money,
  });
}

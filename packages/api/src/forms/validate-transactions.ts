import type {
  Currency,
  EnrollDto,
  MoneyValueDto,
  WithdrawDto,
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
  isNonEmptyId,
  parseStrictPositiveNumber,
  trimString,
} from "./utils";

const CURRENCIES = new Set<Currency>(["USD", "EUR", "RUB"]);

export type WithdrawFormInput = {
  cardAccountId?: unknown;
  sum?: unknown;
  destination?: unknown;
};

export function validateWithdrawForm(
  input: WithdrawFormInput,
): FormValidationResult<WithdrawDto> {
  const errors: FormFieldErrors[] = [];
  if (!isNonEmptyId(input.cardAccountId)) {
    errors.push(fieldError("cardAccountId", "Выберите счёт"));
  }
  const sumParsed = parseStrictPositiveNumber(input.sum);
  if (!sumParsed.ok) {
    errors.push(fieldError("sum", sumParsed.message));
  }
  const destination = trimString(input.destination);
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  if (!sumParsed.ok) {
    return validationFailed(fieldError("sum", sumParsed.message));
  }
  return validationOk({
    cardAccountId: trimString(input.cardAccountId),
    sum: sumParsed.value,
    ...(destination.length > 0 ? { destination } : {}),
  });
}

export type EnrollFormInput = {
  cardAccountId?: unknown;
  moneyValue?: unknown;
  moneyCurrency?: unknown;
  destination?: unknown;
};

export function validateEnrollForm(
  input: EnrollFormInput,
): FormValidationResult<EnrollDto> {
  const errors: FormFieldErrors[] = [];
  if (!isNonEmptyId(input.cardAccountId)) {
    errors.push(fieldError("cardAccountId", "Выберите счёт"));
  }
  const valueParsed = parseStrictPositiveNumber(input.moneyValue);
  if (!valueParsed.ok) {
    errors.push(fieldError("money.value", valueParsed.message));
  }
  const curRaw = trimString(input.moneyCurrency);
  const currency = CURRENCIES.has(curRaw as Currency)
    ? (curRaw as Currency)
    : undefined;
  if (currency === undefined) {
    errors.push(fieldError("money.currency", "Выберите валюту"));
  }
  const destination = trimString(input.destination);
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  if (!valueParsed.ok) {
    return validationFailed(fieldError("money.value", valueParsed.message));
  }
  const money: MoneyValueDto = {
    value: valueParsed.value,
    currency,
  };
  return validationOk({
    cardAccountId: trimString(input.cardAccountId),
    money,
    ...(destination.length > 0 ? { destination } : {}),
  });
}

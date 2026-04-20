import type {
  CardAccountCreateModelDto,
  Currency,
} from "../generated/public/generatedPublicApi";
import {
  fieldError,
  mergeFormFieldErrors,
  type FormFieldErrors,
  type FormValidationResult,
  validationFailed,
  validationOk,
} from "./types";
import { trimString } from "./utils";

const CURRENCIES = new Set<Currency>(["USD", "EUR", "RUB"]);

export type OpenCardAccountFormInput = {
  name?: unknown;
  currency?: unknown;
};

export function validateOpenCardAccountForm(
  input: OpenCardAccountFormInput,
): FormValidationResult<CardAccountCreateModelDto> {
  const errors: FormFieldErrors[] = [];
  const name = trimString(input.name);
  if (name.length === 0) {
    errors.push(fieldError("name", "Укажите название счёта"));
  }
  const rawCur = trimString(input.currency);
  const currency = CURRENCIES.has(rawCur as Currency)
    ? (rawCur as Currency)
    : undefined;
  if (currency === undefined) {
    errors.push(fieldError("currency", "Выберите валюту"));
  }
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  return validationOk({ name, currency });
}

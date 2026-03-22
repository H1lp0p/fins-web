import type { BffError } from "../entities/bff-error";
import type { FormValidationErr } from "./types";

/** Превращает ошибку BFF в результат «форма не прошла» для единообразного UI. */
export function bffErrorToFormFailure(err: BffError): FormValidationErr {
  const formErrors: string[] = [];
  if (err.message) formErrors.push(err.message);
  if (err.code && err.code !== err.message) formErrors.push(err.code);
  return {
    ok: false,
    fieldErrors: err.fieldErrors ? { ...err.fieldErrors } : {},
    ...(formErrors.length > 0 ? { formErrors } : {}),
  };
}

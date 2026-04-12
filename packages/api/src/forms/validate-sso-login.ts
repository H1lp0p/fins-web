import type { SsoLoginBody } from "../generated/sso/generatedSsoApi";
import {
  fieldError,
  mergeFormFieldErrors,
  type FormFieldErrors,
  type FormValidationResult,
  validationFailed,
  validationOk,
} from "./types";
import { trimString } from "./utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SsoLoginFormInput = {
  email: unknown;
  password: unknown;
};

export function validateSsoLoginForm(
  input: SsoLoginFormInput,
): FormValidationResult<SsoLoginBody> {
  const errors: FormFieldErrors[] = [];
  const email = trimString(input.email);
  if (email.length === 0) {
    errors.push(fieldError("email", "Укажите email"));
  } else if (!EMAIL_RE.test(email)) {
    errors.push(fieldError("email", "Некорректный email"));
  }
  const password =
    typeof input.password === "string" ? input.password : "";
  if (password.length === 0) {
    errors.push(fieldError("password", "Укажите пароль"));
  }
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  return validationOk({ email, password });
}

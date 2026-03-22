import type { SsoRegisterBody } from "../generated/sso/generatedSsoApi";
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

export type SsoRegistrationFormInput = {
  name: unknown;
  email: unknown;
  password: unknown;
  confirmPassword: unknown;
};

const MIN_PASSWORD_LEN = 8;
const MAX_NAME_LEN = 128;

export function validateSsoRegistrationForm(
  input: SsoRegistrationFormInput,
): FormValidationResult<SsoRegisterBody> {
  const errors: FormFieldErrors[] = [];
  const name = trimString(input.name);
  if (name.length === 0) {
    errors.push(fieldError("name", "Укажите ник"));
  } else if (name.length > MAX_NAME_LEN) {
    errors.push(fieldError("name", "Слишком длинный ник"));
  }
  const email = trimString(input.email);
  if (email.length === 0) {
    errors.push(fieldError("email", "Укажите email"));
  } else if (!EMAIL_RE.test(email)) {
    errors.push(fieldError("email", "Некорректный email"));
  }
  const password =
    typeof input.password === "string" ? input.password : "";
  if (password.length < MIN_PASSWORD_LEN) {
    errors.push(
      fieldError(
        "password",
        `Пароль не короче ${MIN_PASSWORD_LEN} символов`,
      ),
    );
  }
  const confirmPassword =
    typeof input.confirmPassword === "string" ? input.confirmPassword : "";
  if (confirmPassword !== password) {
    errors.push(fieldError("confirmPassword", "Пароли не совпадают"));
  }
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  return validationOk({ name, email, password });
}

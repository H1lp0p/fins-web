import type { UserEditModelDto } from "../generated/public/generatedPublicApi";
import {
  fieldError,
  mergeFormFieldErrors,
  type FormFieldErrors,
  type FormValidationResult,
  validationFailed,
  validationOk,
} from "./types";
import { normalizeUserRoles, trimString } from "./utils";

export type UserEditFormInput = {
  name: unknown;
  newRoles?: unknown;
};

export function validateUserEditForm(
  input: UserEditFormInput,
): FormValidationResult<UserEditModelDto> {
  const name = trimString(input.name);
  const errors: FormFieldErrors[] = [];
  if (name.length === 0) {
    errors.push(fieldError("name", "Укажите имя"));
  }
  const newRoles = normalizeUserRoles(input.newRoles);
  if (input.newRoles !== undefined && newRoles === undefined) {
    errors.push(fieldError("newRoles", "Некорректные роли"));
  }
  if (errors.length > 0) {
    return validationFailed(mergeFormFieldErrors(...errors));
  }
  return validationOk({
    name,
    ...(newRoles !== undefined ? { newRoles } : {}),
  });
}


export type FormFieldErrors = Record<string, string[]>;

export type FormValidationOk<T> = { ok: true; value: T };

export type FormValidationErr = {
  ok: false;
  fieldErrors: FormFieldErrors;
  
  formErrors?: string[];
};

export type FormValidationResult<T> = FormValidationOk<T> | FormValidationErr;

export function validationOk<T>(value: T): FormValidationOk<T> {
  return { ok: true, value };
}

export function validationFailed(
  fieldErrors: FormFieldErrors,
  formErrors?: string[],
): FormValidationErr {
  return {
    ok: false,
    fieldErrors,
    ...(formErrors !== undefined && formErrors.length > 0
      ? { formErrors }
      : {}),
  };
}

export function fieldError(field: string, message: string): FormFieldErrors {
  return { [field]: [message] };
}

export function mergeFormFieldErrors(
  ...chunks: FormFieldErrors[]
): FormFieldErrors {
  const out: FormFieldErrors = {};
  for (const c of chunks) {
    for (const [key, messages] of Object.entries(c)) {
      const prev = out[key];
      out[key] = prev ? [...prev, ...messages] : [...messages];
    }
  }
  return out;
}

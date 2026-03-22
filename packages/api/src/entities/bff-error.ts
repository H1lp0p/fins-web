import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { BffErrorBody } from "../generated/public/generatedPublicApi";

/** Доменное представление тела ошибки BFF (вместо сырого `BffErrorBody`). */
export type BffError = {
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

function cloneFieldErrors(
  raw: Record<string, unknown> | undefined,
): Record<string, string[]> | undefined {
  if (!raw) return undefined;
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (
      Array.isArray(value) &&
      value.every((item): item is string => typeof item === "string")
    ) {
      out[key] = [...value];
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function shallowCloneFieldErrors(
  fe: NonNullable<BffErrorBody["fieldErrors"]>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fe).map(([key, messages]) => [key, [...messages]]),
  );
}

export function mapBffErrorFromBody(body: BffErrorBody): BffError {
  const fe = body.fieldErrors;
  return {
    message: body.message,
    code: body.code,
    fieldErrors:
      fe && Object.keys(fe).length > 0 ? shallowCloneFieldErrors(fe) : undefined,
  };
}

/**
 * Разбор тела ответа (например `error.data` из RTK Query), без привязки к codegen.
 */
export function tryParseBffError(data: unknown): BffError | undefined {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }
  const o = data as Record<string, unknown>;
  const message = typeof o.message === "string" ? o.message : undefined;
  const code = typeof o.code === "string" ? o.code : undefined;
  const fieldErrors =
    o.fieldErrors !== undefined && typeof o.fieldErrors === "object"
      ? cloneFieldErrors(o.fieldErrors as Record<string, unknown>)
      : undefined;
  if (
    message === undefined &&
    code === undefined &&
    fieldErrors === undefined
  ) {
    return undefined;
  }
  return { message, code, fieldErrors };
}

/**
 * Достаёт структурированную ошибку BFF из результата `fetchBaseQuery` / хука `useXQuery`.
 * Для `FETCH_ERROR` / `PARSING_ERROR` / `TIMEOUT_ERROR` возвращает `undefined`.
 */
export function extractBffError(
  error: FetchBaseQueryError | undefined,
): BffError | undefined {
  if (error === undefined) return undefined;
  if (
    error.status === "FETCH_ERROR" ||
    error.status === "PARSING_ERROR" ||
    error.status === "TIMEOUT_ERROR"
  ) {
    return typeof error.error === "string" && error.error.length > 0
      ? { message: error.error }
      : undefined;
  }
  return tryParseBffError(error.data);
}

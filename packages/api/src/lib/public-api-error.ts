import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { extractBffError } from "../entities/bff-error";

export type RtkRejectedPayload = FetchBaseQueryError | SerializedError | undefined;

export function shouldNavigateToForbidden(
  error: RtkRejectedPayload,
): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }
  if (!("status" in error)) {
    return false;
  }
  return error.status === 403;
}

export function shouldNavigateToServerError(
  error: RtkRejectedPayload,
): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }
  if (!("status" in error)) {
    return false;
  }
  const s = error.status as FetchBaseQueryError["status"];
  if (typeof s === "number" && s >= 500) {
    return true;
  }
  if (
    s === "FETCH_ERROR" ||
    s === "TIMEOUT_ERROR" ||
    s === "PARSING_ERROR"
  ) {
    return true;
  }
  return false;
}

export function getRejectedRequestMessage(
  error: RtkRejectedPayload,
): string | undefined {
  if (error == null || typeof error !== "object") {
    return undefined;
  }
  if (!("status" in error)) {
    return undefined;
  }
  const fe = error as FetchBaseQueryError;
  const bff = extractBffError(fe);
  if (bff?.message?.trim()) {
    return bff.message.trim();
  }
  if (typeof fe.status === "number") {
    return `Server returned ${fe.status}`;
  }
  if (fe.status === "FETCH_ERROR" && typeof fe.error === "string" && fe.error) {
    return fe.error;
  }
  if (fe.status === "FETCH_ERROR") {
    return "Network error";
  }
  if (fe.status === "TIMEOUT_ERROR") {
    return "Request timeout";
  }
  if (fe.status === "PARSING_ERROR") {
    return "Response parsing error";
  }
  return undefined;
}

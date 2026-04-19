import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { extractBffError } from "@fins/api";
import { getAppNavigate } from "./navigationRef";

export const apiErrorListener = createListenerMiddleware();

function messageForServerErrorPage(
  payload: FetchBaseQueryError,
): string | undefined {
  if (payload.status === "CUSTOM_ERROR") {
    const bff = extractBffError(payload);
    if (bff?.code === "BFF_CIRCUIT_OPEN") {
      return "CB state — open (browser)";
    }
    return bff?.message;
  }
  const bff = extractBffError(payload);
  if (bff?.code === "UPSTREAM_CIRCUIT_OPEN") {
    return "CB state — open (upstream)";
  }
  if (bff?.code === "NOTIFICATION_CIRCUIT_OPEN") {
    return "CB state — open (notifications)";
  }
  if (payload.status === 503) {
    return bff?.message ?? "503 — service unavailable";
  }
  if (typeof payload.status === "number" && payload.status >= 500) {
    return bff?.message;
  }
  return undefined;
}

function shouldRedirectToServerError(
  payload: FetchBaseQueryError | undefined,
): boolean {
  if (!payload) {
    return false;
  }
  if (payload.status === 403) {
    return true;
  }
  if (payload.status === 500 || payload.status === 503) {
    return true;
  }
  if (payload.status === "CUSTOM_ERROR") {
    const bff = extractBffError(payload);
    return bff?.code === "BFF_CIRCUIT_OPEN";
  }
  return false;
}

apiErrorListener.startListening({
  predicate: (action) => {
    if (!isRejected(action)) {
      return false;
    }
    if (!action.type.startsWith("finsPublicApi/")) {
      return false;
    }
    const payload = action.payload as FetchBaseQueryError | undefined;
    return shouldRedirectToServerError(payload);
  },
  effect: (action) => {
    const payload = action.payload as RtkRejectedPayload;
    const nav = getAppNavigate();
    if (!nav) {
      return;
    }
    const path = window.location.pathname;
    if (payload.status === 403) {
      if (path === "/403") {
        return;
      }
      nav("/403", { replace: true });
      return;
    }
    if (path === "/500") {
      return;
    }
    const message = messageForServerErrorPage(payload);
    nav("/500", {
      replace: true,
      ...(message !== undefined ? { state: { message } } : {}),
    });
  },
});

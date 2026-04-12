import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";
import {
  getRejectedRequestMessage,
  shouldNavigateToForbidden,
  shouldNavigateToServerError,
  type RtkRejectedPayload,
} from "@fins/api";
import { getAppNavigate } from "./navigationRef";

export const apiErrorListener = createListenerMiddleware();

apiErrorListener.startListening({
  predicate: (action) => {
    if (!isRejected(action)) return false;
    if (!action.type.startsWith("finsSsoApi/")) return false;
    const payload = action.payload as RtkRejectedPayload;
    return (
      shouldNavigateToForbidden(payload) || shouldNavigateToServerError(payload)
    );
  },
  effect: (action) => {
    const payload = action.payload as RtkRejectedPayload;
    const nav = getAppNavigate();
    if (!nav) return;
    const path = window.location.pathname;
    if (shouldNavigateToForbidden(payload)) {
      if (path === "/403") return;
      nav("/403", { replace: true });
      return;
    }
    if (shouldNavigateToServerError(payload)) {
      if (path === "/500") return;
      const msg = getRejectedRequestMessage(payload);
      nav("/500", {
        replace: true,
        ...(msg !== undefined ? { state: { errorMessage: msg } } : {}),
      });
    }
  },
});

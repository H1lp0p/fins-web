import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getAppNavigate } from "./navigationRef";

export const apiErrorListener = createListenerMiddleware();

apiErrorListener.startListening({
  predicate: (action) => {
    if (!isRejected(action)) return false;
    if (!action.type.startsWith("finsPublicApi/")) return false;
    const payload = action.payload as FetchBaseQueryError | undefined;
    const status = payload?.status;
    return status === 403 || status === 500;
  },
  effect: (action) => {
    const payload = action.payload as FetchBaseQueryError;
    const nav = getAppNavigate();
    if (!nav) return;
    const path = window.location.pathname;
    if (payload.status === 403) {
      if (path === "/403") return;
      nav("/403", { replace: true });
      return;
    }
    if (payload.status === 500) {
      if (path === "/500") return;
      nav("/500", { replace: true });
    }
  },
});

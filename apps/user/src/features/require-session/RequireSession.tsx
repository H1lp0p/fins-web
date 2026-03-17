import { useGetUserQuery } from "@fins/api";
import { BgText, useMessageStack } from "@fins/ui-kit";import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect, useRef, type ReactNode } from "react";

function normalizeSsoOrigin(): string {
  return (import.meta.env.VITE_SSO_URL ?? "http://127.0.0.1:5173").replace(
    /\/+$/,
    "",
  );
}

type RequireSessionProps = {
  children: ReactNode;
};

/**
 * Проверка сессии через `GET /user-service/account`.
 * 401 → редирект на SSO с `returnUrl` (для будущего использования на стороне SSO).
 */
export function RequireSession({ children }: RequireSessionProps) {
  const { pushMessage } = useMessageStack();
  const warnedRef = useRef(false);

  const account = useGetUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (account.isSuccess) {
      warnedRef.current = false;
    }
  }, [account.isSuccess]);

  useEffect(() => {
    if (!account.isError || !account.error) return;
    const e = account.error as FetchBaseQueryError;
    if (e.status === 401) {
      const sso = normalizeSsoOrigin();
      const next = encodeURIComponent(window.location.href);
      window.location.replace(`${sso}/?returnUrl=${next}`);
      return;
    }
    if (warnedRef.current) return;
    warnedRef.current = true;
    const text =
      e.status === "FETCH_ERROR"
        ? "Cannot reach the bank API. Is BFF running and the Vite /api proxy configured?"
        : `Could not load your account (${String(e.status)}).`;
    pushMessage({
      type: "error",
      title: "Account",
      text,
    });
  }, [account.isError, account.error, pushMessage]);

  const pending =
    !account.isSuccess &&
    !account.isError &&
    (account.isUninitialized || account.isLoading);

  if (pending) {
    return (
      <main className="bg-background">
        <BgText text="…" />
      </main>
    );
  }

  if (account.isError) {
    const e = account.error as FetchBaseQueryError;
    if (e.status === 401) {
      return null;
    }
    return (
      <main className="bg-background">
        <BgText text="Error" />
        <div className="ph-max pv-max">
          <p style={{ margin: 0 }}>Something went wrong. Use the message stack or reload.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

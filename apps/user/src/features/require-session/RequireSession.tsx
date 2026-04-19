import {
  shouldNavigateToForbidden,
  shouldNavigateToServerError,
  useGetUserQuery,
} from "@fins/api";
import { BgText, LoadingFrameIndicator, useMessageStack } from "@fins/ui-kit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { accountSessionErrorMessage } from "../../lib/userStackMessages";
import { getSsoOrigin } from "../../shared/lib/sso-origin";
import { WebPushRegistration } from "../../app/WebPushRegistration";

export function RequireSession() {
  const navigate = useNavigate();
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
      const sso = getSsoOrigin();
      const next = encodeURIComponent(window.location.href);
      window.location.replace(`${sso}/?returnUrl=${next}`);
      return;
    }
    if (shouldNavigateToForbidden(e)) {
      navigate("/403", { replace: true });
      return;
    }
    if (shouldNavigateToServerError(e)) {
      return;
    }
    if (warnedRef.current) return;
    warnedRef.current = true;
    pushMessage(accountSessionErrorMessage(e));
  }, [account.isError, account.error, navigate, pushMessage]);

  const pending =
    !account.isSuccess &&
    !account.isError &&
    (account.isUninitialized || account.isLoading);

  if (pending) {
    return (
      <main
        className="bg-background"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BgText text="Account" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <LoadingFrameIndicator />
        </div>
      </main>
    );
  }

  if (account.isError) {
    const e = account.error as FetchBaseQueryError;
    if (e.status === 401) {
      return null;
    }
    if (shouldNavigateToForbidden(e) || shouldNavigateToServerError(e)) {
      return null;
    }
    return (
      <main
        className="bg-background"
        style={{ position: "relative", minHeight: "100vh" }}
      >
        <BgText text="Error" />
      </main>
    );
  }

  return (
    <>
      <WebPushRegistration />
      <Outlet />
    </>
  );
}

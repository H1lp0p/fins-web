import { BgText } from "@fins/ui-kit";
import { useLayoutEffect, useState } from "react";
import { ActiveSessionPanel } from "../active-session/ActiveSessionPanel";
import { tryRedirectAfterSsoSuccess } from "../../shared/lib/sso-post-login-redirect";

/**
 * Пользователь уже с сессией: сразу редирект, если есть куда; иначе панель «Continue / Sign out».
 */
export function SsoAuthenticatedView() {
  const [redirecting, setRedirecting] = useState(true);

  useLayoutEffect(() => {
    if (tryRedirectAfterSsoSuccess()) return;
    setRedirecting(false);
  }, []);

  if (redirecting) {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <BgText text="…" />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <ActiveSessionPanel />
    </div>
  );
}

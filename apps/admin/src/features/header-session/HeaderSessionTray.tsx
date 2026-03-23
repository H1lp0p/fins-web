import {
  useGetPreferencesQuery,
  useGetUserQuery,
  useUpdatePreferencesMutation,
} from "@fins/api";
import { LinkButton, getFinsTheme, setFinsTheme } from "@fins/ui-kit";
import { useEffect } from "react";
import { getSsoOrigin } from "../../shared/lib/sso-origin";

const BFF_BASE = import.meta.env.VITE_BFF_URL ?? "/api";

async function revokeSessionAndGoSso(): Promise<void> {
  try {
    await fetch(`${BFF_BASE.replace(/\/+$/, "")}/user-service/auth/revoke`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    
  }
  window.location.href = getSsoOrigin();
}

export function HeaderSessionTray() {
  const { data: user } = useGetUserQuery();
  const { data: prefs } = useGetPreferencesQuery(undefined, {
    skip: !user?.id,
  });
  const [updatePrefs] = useUpdatePreferencesMutation();

  useEffect(() => {
    if (!user?.id) return;
    const t = prefs?.theme === "dark" ? "dark" : "light";
    setFinsTheme(t);
  }, [user?.id, prefs?.theme]);

  if (!user?.id) return null;

  const themeLabel =
    (prefs?.theme ?? getFinsTheme() ?? "light") === "dark" ? "dark" : "light";

  return (
    <div
      className="color-info text-info"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "0.25rem",
      }}
    >
      <span className="text-info" style={{ textAlign: "right" }}>
        {user.name}
      </span>
      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <LinkButton
          text={themeLabel === "dark" ? "Theme: dark" : "Theme: light"}
          variant="success"
          textClassName="text-info"
          onClick={() => {
            const next = themeLabel === "dark" ? "light" : "dark";
            setFinsTheme(next);
            void updatePrefs({
              userPreferencesDto: {
                theme: next,
                hiddenAccounts: prefs?.hiddenAccounts ?? [],
              },
            });
          }}
        />
        <LinkButton
          text="Log-out"
          variant="error"
          textClassName="text-info"
          onClick={() => void revokeSessionAndGoSso()}
        />
      </div>
    </div>
  );
}

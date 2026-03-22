import { useGetUserQuery } from "@fins/api";
import { LinkButton } from "@fins/ui-kit";
import { useLocation } from "react-router-dom";

function normalizeSsoOrigin(): string {
  return (import.meta.env.VITE_SSO_URL ?? "http://127.0.0.1:5173").replace(
    /\/+$/,
    "",
  );
}

const BFF_BASE = import.meta.env.VITE_BFF_URL ?? "/api";

async function revokeSessionAndGoSso(): Promise<void> {
  try {
    await fetch(`${BFF_BASE.replace(/\/+$/, "")}/user-service/auth/revoke`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* ignore */
  }
  window.location.href = normalizeSsoOrigin();
}

export function HeaderSessionTray() {
  const { pathname } = useLocation();
  const skip = pathname === "/preview";
  const { data: user } = useGetUserQuery(undefined, { skip });

  if (skip || !user?.id) return null;

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
      <LinkButton
        text="Log-out"
        variant="error"
        textClassName="text-info"
        onClick={() => void revokeSessionAndGoSso()}
      />
    </div>
  );
}

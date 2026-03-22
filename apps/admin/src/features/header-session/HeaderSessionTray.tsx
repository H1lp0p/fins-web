import { useGetUserQuery } from "@fins/api";
import { LinkButton } from "@fins/ui-kit";
import { getSsoOrigin } from "../../shared/lib/sso-origin";

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
  window.location.href = getSsoOrigin();
}

export function HeaderSessionTray() {
  const { data: user } = useGetUserQuery();

  if (!user?.id) return null;

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

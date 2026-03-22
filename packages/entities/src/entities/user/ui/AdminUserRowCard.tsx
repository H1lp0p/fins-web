import type { User } from "@fins/api";
import type { CSSProperties } from "react";
import { OnBlurContainer } from "@fins/ui-kit";
import "./AdminUserRowCard.css";

export type AdminUserRowCardProps = {
  user: User;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
};

export function AdminUserRowCard({
  user,
  onClick,
  className,
  style,
}: AdminUserRowCardProps) {
  const hasClient = user.roles?.includes("CLIENT") ?? false;
  const hasWorker = user.roles?.includes("WORKER") ?? false;
  const active = user.active !== false;

  const interactive = Boolean(onClick);

  return (
    <OnBlurContainer
      className={`user-row-card ph-mid pv-mid ${className ?? ""}`.trim()}
      style={style}
    >
      <div
        className="gap-mid color-info"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-between",
          gap: "1rem",
          width: "100%",
          boxSizing: "border-box",
          cursor: interactive ? "pointer" : undefined,
        }}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
      >
        <div
          className="text-info-accent color-success gap-min"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "center",
            minWidth: "5.5rem",
          }}
        >
          {hasClient ? <span>[Client]</span> : null}
          {hasWorker ? <span>[Worker]</span> : null}
        </div>

        <div
          className="gap-min"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "center",
          }}
        >
          <span className="user-row-card-name text-title color-success">{user.name}</span>
          <span className="text-info color-info">{user.email}</span>
        </div>

        <div
          className="gap-min"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "5.5rem",
          }}
        >
          <span className="text-info-accent color-info">status</span>
          {active ? (
            <span className="text-title color-success">[Active]</span>
          ) : (
            <span className="text-title color-error">[Blocked]</span>
          )}
        </div>
      </div>
    </OnBlurContainer>
  );
}

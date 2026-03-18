import type { CSSProperties } from "react";
import styles from "./UserCard.module.css";
import { OnBlurContainer } from "@fins/ui-kit";

export type UserCardProps = {
  name: string;
  currencySymbol: string;
  className?: string;
  style?: CSSProperties;
  selected?: boolean;
  onClick?: () => void;
};

export function UserCard({
  name,
  currencySymbol,
  className,
  style,
  selected,
  onClick,
}: UserCardProps) {
  const interactive = Boolean(onClick);
  return (
    <OnBlurContainer 
      className={`ph-mid pv-mid ${className ?? ""}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <div
        className="gap-mid"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
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
        <p className={`${styles.name} text-info-accent color-info`}>
          {selected ? <span className="color-success">{"<"}</span> : null}
          {name}
          {selected ? <span className="color-success">{">"}</span> : null}
        </p>
        <p className={`${styles.currencyLine} text-info color-info`}>
          currency :{" "}
          <span className="color-success">{currencySymbol}</span>
        </p>
      </div>
    </OnBlurContainer>
  );
}

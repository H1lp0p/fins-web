import type { CSSProperties } from "react";
import styles from "./UserCard.module.css";

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
    <div
      className={`${styles.root} ${styles.mono} ph-mid pv-mid gap-mid ${className ?? ""}`.trim()}
      style={style}
      data-selected={selected ? "" : undefined}
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
      <p className={`${styles.name} text-info color-info`}>{name}</p>
      <p className={`${styles.currencyLine} text-info color-info`}>
        currency :{" "}
        <span className="color-success">{currencySymbol}</span>
      </p>
    </div>
  );
}

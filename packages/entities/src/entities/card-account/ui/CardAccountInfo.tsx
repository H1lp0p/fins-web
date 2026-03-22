import type { CSSProperties } from "react";
import type { CardAccountEntity } from "@fins/api";
import { AmountWithSymbol, OnBlurContainer } from "@fins/ui-kit";
import { currencyCodeToAmountSymbol } from "../../../lib/currency-symbol";
import styles from "./CardAccountInfo.module.css";

export type CardAccountDisplayStatus =
  | "default"
  | "hidden"
  | "closed"
  | "main";

export type CardAccountInfoProps = {
  account: CardAccountEntity;
  /** В API имени счёта нет — задаётся с экрана/мока. */
  name?: string;
  /**
   * Состояние из макета Figma `card-account-info`.
   * Если не задано: `deleted` → closed, `visible === false` → hidden, `main` → main, иначе default.
   */
  displayStatus?: CardAccountDisplayStatus;
  className?: string;
  style?: CSSProperties;
  selected?: boolean;
};

function resolveDisplayStatus(
  account: CardAccountEntity,
  explicit?: CardAccountDisplayStatus,
): CardAccountDisplayStatus {
  if (explicit) return explicit;
  if (account.deleted) return "closed";
  if (account.visible === false) return "hidden";
  if (account.main) return "main";
  return "default";
}

function statusBadge(status: CardAccountDisplayStatus): string | null {
  switch (status) {
    case "hidden":
      return "hidden";
    case "closed":
      return "closed";
    case "main":
      return "main";
    default:
      return null;
  }
}

function nameColorClass(status: CardAccountDisplayStatus): string {
  switch (status) {
    case "hidden":
      return "color-input-placeholder";
    case "closed":
      return "color-error";
    case "main":
      return "color-success";
    default:
      return "color-info";
  }
}

/**
 * Карточка счёта (макет Figma `card-account-info`).
 */
export function CardAccountInfo({
  account,
  name,
  displayStatus: displayStatusProp,
  className,
  style,
  selected,
}: CardAccountInfoProps) {
  const displayName =
    name?.trim() || account.name?.trim() || "Account name";
  const status = resolveDisplayStatus(account, displayStatusProp);
  const badge = statusBadge(status);
  const money = account.money;

  return (
    <OnBlurContainer
      className={`${styles.root} ${styles.flexCol} ph-mid pv-mid gap-mid ${className ?? ""}`.trim()}
      data-entity="card-account-info"
      data-status={status}
      style={style}
    >
      <div className={styles.topRow}>
        <h3
          className={`${styles.titleReset} text-info-accent ${nameColorClass(status)}`}
        >
          {selected ? <span className="color-success">{"<"}</span> : null}
          {displayName}
          {selected ? <span className="color-success">{">"}</span> : null}
        </h3>
        {badge ? (
          <span
            className={`${styles.badge} text-info color-input-placeholder`}
            aria-label={`Account status: ${badge}`}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {money != null ? (
        <AmountWithSymbol
          amount={money.value}
          symbol={currencyCodeToAmountSymbol(money.currency)}
          textClassName="text-info-accent"
          className={styles.amountRow}
        />
      ) : (
        <span className={`text-title color-input-placeholder`}>—</span>
      )}
    </OnBlurContainer>
  );
}

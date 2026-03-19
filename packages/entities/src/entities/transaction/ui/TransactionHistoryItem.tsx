import type { CSSProperties } from "react";
import type { TransactionOperationEntity } from "@fins/api";
import { formatNumber, OnBlurContainer } from "@fins/ui-kit";
import { currencyCodeToAmountSymbol } from "../../../lib/currency-symbol";
import { formatDateDdMmYyyy } from "../../../lib/format-date-time";
import styles from "./TransactionHistoryItem.module.css";

export type TransactionHistoryItemProps = {
  operation: TransactionOperationEntity;
  className?: string;
  style?: CSSProperties;
};

function typeBracketLabel(
  type: TransactionOperationEntity["transactionType"],
): string {
  switch (type) {
    case "WITHDRAWAL":
      return "[Withdraw]";
    case "ENROLLMENT":
      return "[Enroll]";
    default:
      return "[—]";
  }
}

function typeLabelColorClass(
  type: TransactionOperationEntity["transactionType"],
): string {
  switch (type) {
    case "WITHDRAWAL":
      return "color-error";
    case "ENROLLMENT":
      return "color-success";
    default:
      return "color-input-placeholder";
  }
}

/**
 * Строка истории операций (макет Figma `transaction-history-item`).
 */
export function TransactionHistoryItem({
  operation,
  className,
  style,
}: TransactionHistoryItemProps) {
  const t = operation.transactionType;
  const desc =
    operation.transactionAction?.trim() ||
    (t === "WITHDRAWAL"
      ? "Withdrawal"
      : t === "ENROLLMENT"
        ? "Enrollment"
        : "—");
  const money = operation.money;
  const abs =
    money != null && !Number.isNaN(money.value)
      ? Math.abs(money.value)
      : null;
  const symbol =
    money != null ? currencyCodeToAmountSymbol(money.currency) : null;
  const dateStr = formatDateDdMmYyyy(operation.dateTime);

  const signEl =
    t === "WITHDRAWAL" ? (
      <span className="color-error">-</span>
    ) : t === "ENROLLMENT" ? (
      <span className="color-success">+</span>
    ) : null;

  return (
    <OnBlurContainer
      className={`${styles.root} ${styles.mono} ph-mid pv-mid ${className ?? ""}`.trim()}
      data-entity="transaction-history-item"
      style={style}
    >
      <div className={styles.grid}>
        <div className={styles.leftTop}>
          <span
            className={`${styles.typeLabel} text-info-accent ${typeLabelColorClass(t)}`}
          >
            {typeBracketLabel(t)}
          </span>
        </div>
        <div className={styles.rightTop}>
          {abs != null && symbol != null ? (
            <div
              className={`${styles.amountLine} text-info-accent`}
              aria-label="Transaction amount"
            >
              {signEl}
              <span className="color-info">{formatNumber(abs)}</span>
              <span className={`color-success ${styles.amountSymbol}`}>{symbol}</span>
            </div>
          ) : (
            <span className="text-info-accent color-input-placeholder">—</span>
          )}
        </div>
        <div className={styles.leftBottom}>
          <p className={`${styles.desc} text-info color-info`}>{desc}</p>
        </div>
        <div className={styles.rightBottom}>
          <span className="text-info color-input-placeholder">{dateStr}</span>
        </div>
      </div>
    </OnBlurContainer>
  );
}

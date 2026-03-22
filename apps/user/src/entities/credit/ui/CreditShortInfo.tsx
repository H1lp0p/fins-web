import type { CSSProperties } from "react";
import type { CreditEntity } from "@fins/api";
import {
  AmountWithSymbol,
  BluredContainer,
  DEFAULT_CHARS,
  OnBlurContainer,
} from "@fins/ui-kit";
import { currencyCodeToAmountSymbol } from "../../../shared/lib/currency-symbol";
import styles from "./CreditShortInfo.module.css";

const BAR_INNER_LEN = 10;

export type CreditShortInfoProps = {
  credit: CreditEntity;
  className?: string;
  style?: CSSProperties;
  selected?: boolean;
};

/** Отображаемый долг: только тело + проценты, без прочих полей. */
export function creditTotalDebtDisplay(credit: CreditEntity): number {
  return (credit.currentDebtSum ?? 0) + (credit.interestDebtSum ?? 0);
}

/**
 * Прогресс по контракту: `currentDebtSum / initialDebt` (0…1).
 * При невалидном `initialDebt` — `null`.
 */
export function creditProgressRatio(credit: CreditEntity): number | null {
  const initial = credit.initialDebt;
  if (initial == null || initial <= 0 || Number.isNaN(initial)) {
    return null;
  }
  const current = credit.currentDebtSum ?? 0;
  return Math.min(1, Math.max(0, current / initial));
}

/** Сколько «ячееек» по 10% закрасить (округление к ближайшим 10%). */
export function filledBarSegments(ratio: number): number {
  return Math.min(
    BAR_INNER_LEN,
    Math.max(0, Math.round((ratio * 100) / 10)),
  );
}

function formatPercentCommaOneDecimal(ratio: number): string {
  return (ratio * 100).toFixed(1).replace(".", ",");
}

/**
 * Краткая карточка кредита (макет Figma `credit-short-info`).
 */
export function CreditShortInfo({
  credit,
  className,
  style,
  selected,
}: CreditShortInfoProps) {
  const title = credit.creditRule?.ruleName?.trim() || "Rule name";
  const totalDebt = creditTotalDebtDisplay(credit);
  const symbol = currencyCodeToAmountSymbol(credit.currency);
  const ratio = creditProgressRatio(credit);
  const filled = ratio == null ? 0 : filledBarSegments(ratio);
  const empty = BAR_INNER_LEN - filled;

  return (
    <OnBlurContainer
      className={`${styles.root} ${styles.mono} ${styles.flexCol} ph-mid pv-mid gap-mid ${className ?? ""}`.trim()}
      data-entity="credit-short-info"
      style={style}
    >
      <h3
        className={`${styles.titleReset} ${styles.title} text-title color-info`}
      >
        {selected ? <span className="text-success">{"<"}</span> : null}
        {title}
        {selected ? <span className="text-success">{">"}</span> : null}
      </h3>

      <div className={`${styles.debtRow} text-info-accent`}
        style={{ width: "100%",display: "flex",justifyContent: "center",alignItems: "baseline"}}
        aria-label="Total debt">
        <span className="text-info-accent color-info">debt =</span>
        <AmountWithSymbol
          amount={totalDebt}
          symbol={symbol}
          textClassName="text-info-accent"
        />
      </div>

      <div className={styles.progressBlock}>
        <span className="text-info-accent color-info">progress</span>
        <div className={styles.progressRow}>
          <span
            className={`${styles.bar} text-info-accent`}
            aria-hidden={ratio == null}
            aria-label={
              ratio == null
                ? undefined
                : `Progress ${Math.round(ratio * 100)} percent`
            }
          >
            <span className="text-info-accent color-info">[</span>
            <span className="text-info-accent color-success">{"/".repeat(filled)}</span>
            <span className="text-info-accent color-info">{"-".repeat(empty)}</span>
            <span className="text-info-accent color-info">]</span>
          </span>
          <span className={`${styles.percentWrap} text-info-accent`}>
            {ratio == null ? (
              <span className="text-info-accent color-input-placeholder">—</span>
            ) : (
              <>
                <span className="text-info-accent color-info">
                  {formatPercentCommaOneDecimal(ratio)}
                </span>
                <span className="text-info-accent color-success">{DEFAULT_CHARS.PERCENT}</span>
              </>
            )}
          </span>
        </div>
      </div>
    </OnBlurContainer>
  );
}

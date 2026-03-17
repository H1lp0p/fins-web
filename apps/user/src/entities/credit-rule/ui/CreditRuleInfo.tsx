import type { CSSProperties } from "react";
import type { CreditRuleEntity } from "@fins/api";
import {
  AmountWithSymbol,
  BluredContainer,
  DEFAULT_CHARS,
} from "@fins/ui-kit";
import { collectionPeriodFromSeconds } from "../../../shared/lib/collection-period-display";
import styles from "./CreditRuleInfo.module.css";

export type CreditRuleInfoProps = {
  rule: CreditRuleEntity;
  className?: string;
  style?: CSSProperties;
};

/**
 * Карточка правила кредита (макет Figma `credit-rule-info`).
 * Классы `text-*`, `color-*`, `ph-*`, `pv-*`, `gap-*` — из ui-kit (тема).
 */
export function CreditRuleInfo({ rule, className, style }: CreditRuleInfoProps) {
  const title = rule.ruleName?.trim() || "—";
  const period = collectionPeriodFromSeconds(rule.collectionPeriodSeconds);
  const pct =
    rule.percentage != null && !Number.isNaN(rule.percentage) ? rule.percentage : null;

  return (
    <BluredContainer
      className={`${styles.root} ${styles.flexCol} ph-mid pv-mid gap-mid ${className ?? ""}`.trim()}
      data-entity="credit-rule-info"
      style={style}
    >
      <h3 className={`${styles.titleReset} text-title color-info`}>{title}</h3>

      <div
        className={`${styles.flexCol} gap-min text-info-accent color-info`}
      >
        <span className="text-info color-info">Percentage</span>
        <div className={styles.flexEnd}>
          {pct == null ? (
            <span className="text-info color-input-placeholder">—</span>
          ) : (
            <AmountWithSymbol
              amount={pct}
              symbol={DEFAULT_CHARS.PERCENT}
              textClassName="text-info"
            />
          )}
        </div>
      </div>

      <div
        className={`${styles.flexCol} gap-min text-info-accent color-info`}
      >
        <span className="text-info color-info">Collection period</span>
        <div
          className={`${styles.rowBetween} text-info color-info`}
          aria-label="Collection period value"
        >
          <span className="text-info color-input-placeholder">every</span>
          {period.kind === "empty" ? (
            <span className="text-info color-input-placeholder">—</span>
          ) : (
            <AmountWithSymbol
              amount={period.amount}
              symbol={period.symbol}
              textClassName="text-info"
            />
          )}
        </div>
      </div>
    </BluredContainer>
  );
}

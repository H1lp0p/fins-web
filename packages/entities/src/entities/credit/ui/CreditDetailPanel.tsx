import type { CSSProperties } from "react";
import type { CardAccountEntity, CreditEntity } from "@fins/api";
import {
  AmountWithSymbol,
  BluredContainer,
  DEFAULT_CHARS,
} from "@fins/ui-kit";
import { CreditRuleInfo } from "../../credit-rule";
import { currencyCodeToAmountSymbol } from "../../../lib/currency-symbol";
import { formatDateDdMmYyyy } from "../../../lib/format-date-time";
import styles from "./CreditDetailPanel.module.css";

export type CreditDetailPanelProps = {
  credit: CreditEntity;
  /** Счёт, привязанный к кредиту (баланс для блока Account). */
  linkedAccount?: CardAccountEntity | null;
  className?: string;
  style?: CSSProperties;
};

function daysAgoLabel(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days < 0) return "—";
  return `${days} ${DEFAULT_CHARS.DAY} ago`;
}

/**
 * Подробная информация по кредиту (скролл: счёт, долги, правило, дата обновления).
 */
export function CreditDetailPanel({
  credit,
  linkedAccount,
  className,
  style,
}: CreditDetailPanelProps) {
  const symbol = currencyCodeToAmountSymbol(credit.currency);
  const rule = credit.creditRule;
  const balance = linkedAccount?.money;

  return (
    <div
      className={`${styles.scroll} ph-mid pv-mid ${className ?? ""}`.trim()}
      style={style}
    >
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} text-title color-input-placeholder`}>
          Account
        </h4>
        <BluredContainer className="ph-mid pv-mid">
          <div className={styles.accountCardInner}>
            <span className={`${styles.accountLabel} text-info color-input-placeholder`}>
              Credit account
            </span>
            {balance != null ? (
              <AmountWithSymbol
                amount={balance.value}
                symbol={currencyCodeToAmountSymbol(balance.currency)}
                textClassName="text-title"
              />
            ) : (
              <span className="text-title color-input-placeholder">—</span>
            )}
          </div>
        </BluredContainer>
      </section>

      <section className={styles.section}>
        <div className={styles.debtRow}>
          <span className="text-info color-info">Initial debt sum</span>
          <AmountWithSymbol
            amount={credit.initialDebt ?? 0}
            symbol={symbol}
            textClassName="text-info"
          />
        </div>
        <div className={styles.debtRow}>
          <span className="text-info color-info">Current debt sum</span>
          <AmountWithSymbol
            amount={credit.currentDebtSum ?? 0}
            symbol={symbol}
            textClassName="text-info"
          />
        </div>
        <div className={styles.debtRow}>
          <span className="text-info color-info">Interest debt sum</span>
          <AmountWithSymbol
            amount={credit.interestDebtSum ?? 0}
            symbol={symbol}
            textClassName="text-info"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} text-title color-input-placeholder`}>
          Rule
        </h4>
        {rule ? (
          <CreditRuleInfo rule={rule} />
        ) : (
          <span className="text-info color-input-placeholder">—</span>
        )}
      </section>

      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} text-title color-input-placeholder`}>
          Last repayment
        </h4>
        <div className={styles.lastRepayRow}>
          <span className="text-info color-success">
            {daysAgoLabel(credit.lastInterestUpdate)}
          </span>
          <span className="text-info color-success">
            {formatDateDdMmYyyy(credit.lastInterestUpdate)}
          </span>
        </div>
      </section>
    </div>
  );
}

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
  
  linkedAccount?: CardAccountEntity | null;
  className?: string;
  style?: CSSProperties;
};

function daysAgoLabel(iso: string | undefined): {amount: number, unit: DEFAULT_CHARS} {
  if (!iso) return {amount: -1, unit: DEFAULT_CHARS.DAY};
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return {amount: -1, unit: DEFAULT_CHARS.DAY};
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days < 0) return {amount: -1, unit: DEFAULT_CHARS.DAY};
  return {amount: days, unit: DEFAULT_CHARS.DAY};
}

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
      className={`${styles.scroll} ph-mid pv-mid color-info ${className ?? ""}`.trim()}
      style={style}
    >
      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} text-title`}>
          Account
        </h4>
        <BluredContainer className="ph-mid pv-mid">
          <div className={styles.accountCardInner}>
            <span className={`${styles.accountLabel} text-title`}>
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

      <section className={`${styles.section} ph-mid gap-mid text-info-accent`}>
        <div className={styles.debtRow}>
          <span className="text-info-accent color-info">Initial debt sum</span>
          <AmountWithSymbol
            amount={credit.initialDebt ?? 0}
            symbol={symbol}
            textClassName="text-info-accent"
            style={{ alignSelf: "flex-end" }}
          />
        </div>
        <div className={styles.debtRow}>
          <span className="text-info-accent color-info">Current debt sum</span>
          <AmountWithSymbol
            amount={credit.currentDebtSum ?? 0}
            symbol={symbol}
            textClassName="text-info-accent"
            style={{ alignSelf: "flex-end" }}
          />
        </div>
        <div className={styles.debtRow}>
          <span className="text-info-accent color-info">Interest debt sum</span>
          <AmountWithSymbol
            amount={credit.interestDebtSum ?? 0}
            symbol={symbol}
            textClassName="text-info-accent"
            style={{ alignSelf: "flex-end" }}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={`${styles.sectionTitle} text-title`}>
          Rule
        </h4>
        {rule ? (
          <CreditRuleInfo 
            rule={rule}
            style={{width: "100%"}}
          />
        ) : (
          <span className="text-info-accent color-info">—</span>
        )}
      </section>

      <section className={styles.section}>
        <h4 className={`text-title`}>
          Last repayment
        </h4>
        <div className={`${styles.lastRepayRow} gap-min text-info-accent`}>
          <div 
            className={`${styles.lastRepayRow} gap-min`}
            style={{ alignSelf: "flex-start" }}
          >
            <AmountWithSymbol
              amount={daysAgoLabel(credit.lastInterestUpdate).amount}
              symbol={daysAgoLabel(credit.lastInterestUpdate).unit}
              textClassName="text-info-accent"
              style={{ alignSelf: "flex-start" }}
            />
              ago
          </div>
          <span className="text-info-accent color-input-placeholder">
            {formatDateDdMmYyyy(credit.lastInterestUpdate)}
          </span>
        </div>
      </section>
    </div>
  );
}

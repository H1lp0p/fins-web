import { OnBlurContainer } from "@fins/ui-kit";
import { TRANSACTION_CURRENCY_SYMBOLS } from "../../../shared/lib/transaction-currencies";
import styles from "./OtherServiceCurrencyPanel.module.css";

export type OtherServiceCurrencyPanelProps = {
  
  currencyIndex: number;
  onCycleCurrency: () => void;
  className?: string;
};

export function OtherServiceCurrencyPanel({
  currencyIndex,
  onCycleCurrency,
  className,
}: OtherServiceCurrencyPanelProps) {
  const sym =
    TRANSACTION_CURRENCY_SYMBOLS[
      currencyIndex % TRANSACTION_CURRENCY_SYMBOLS.length
    ] ?? TRANSACTION_CURRENCY_SYMBOLS[0];

  return (
    <OnBlurContainer
      className={`${styles.wrap} text-info ph-mid pv-mid ${className ?? ""}`.trim()}
    >
      <p className={`${styles.title} color-info`}>
        ~Other service~
      </p>
      <div className={styles.row}>
        <span className="color-info">select currency</span>
        <button
          type="button"
          className={`${styles.currencyBtn} color-success text-info-accent`}
          aria-label="Cycle currency"
          onClick={onCycleCurrency}
        >
          [{sym}]
        </button>
      </div>
    </OnBlurContainer>
  );
}

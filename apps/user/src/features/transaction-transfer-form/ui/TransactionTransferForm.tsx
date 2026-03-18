import type { DEFAULT_CHARS } from "@fins/ui-kit";
import {
  AmountWithSymbol,
  formatNumber,
  Input,
  OnBlurContainer,
} from "@fins/ui-kit";
import styles from "./TransactionTransferForm.module.css";

export type TransactionTransferFormProps = {
  amount: string;
  onAmountChange: (v: string) => void;
  amountValid: boolean;
  fromTrailingChar: DEFAULT_CHARS;
  toSymbol: DEFAULT_CHARS;
  /** Сколько единиц «куда» за 1 единицу «откуда». */
  rateToPerFrom: number;
  resultAmount: number;
};

export function TransactionTransferForm({
  amount,
  onAmountChange,
  amountValid,
  fromTrailingChar,
  toSymbol,
  rateToPerFrom,
  resultAmount,
}: TransactionTransferFormProps) {
  return (
    <div className={`${styles.root} ph-mid pv-mid`}>
      <OnBlurContainer className={`${styles.card} ph-mid pv-mid`}>
        
          <Input
            title="Amount"
            placeholder="0.00"
            value={amount}
            onChange={onAmountChange}
            isValid={amountValid}
            type="text"
            textClassName="text-info"
            trailingChar={fromTrailingChar}
          />
      </OnBlurContainer>

      <div className={styles.chevron} aria-hidden>
        &gt;&gt;&gt;
      </div>

      <OnBlurContainer className={`${styles.card} ph-mid pv-mid`}>
        <div className={`${styles.rateBlock} text-info-accent`}>
          <div className={styles.rateRow}>
            <span className="color-success">{fromTrailingChar}</span>
            <span className="color-info">&lt;to&gt;</span>
            <span className="color-success">{toSymbol}</span>
          </div>
          <div className={styles.rateRow}>
            <span className="color-info">1.00 {fromTrailingChar}</span>
            <span className="color-info">=</span>
            <span className="color-info">{formatNumber(rateToPerFrom)}</span>
            <span className="color-success">{toSymbol}</span>
          </div>
        </div>
      </OnBlurContainer>

      <div className={styles.chevron} aria-hidden>
        &gt;&gt;&gt;
      </div>

      <OnBlurContainer className={`${styles.card} ph-mid pv-mid`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      >
        <p className={`${styles.resultLabel} text-title color-info`}>Result</p>
        <div className={styles.resultRow}>
          <AmountWithSymbol
            amount={resultAmount}
            symbol={toSymbol}
            textClassName="text-info-accent"
          />
        </div>
      </OnBlurContainer>
    </div>
  );
}

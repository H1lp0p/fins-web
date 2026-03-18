import type { CardAccountEntity } from "@fins/api";
import { LinkButton } from "@fins/ui-kit";
import { CardAccountInfo } from "../../../entities/card-account";
import { OtherServiceCurrencyPanel } from "../../other-service-currency";
import styles from "./TransactionFromTopSlot.module.css";

export type TransactionFromTopSlotProps = {
  mode: "other-service" | "account";
  account: CardAccountEntity | null;
  leftCurrencyIndex: number;
  onCycleLeftCurrency: () => void;
  onResetAccount: () => void;
};

export function TransactionFromTopSlot({
  mode,
  account,
  leftCurrencyIndex,
  onCycleLeftCurrency,
  onResetAccount,
}: TransactionFromTopSlotProps) {
  if (mode === "account" && account) {
    return (
      <div className={`${styles.row} ph-mid pv-mid`}>
        <div className={styles.cardGrow}>
          <CardAccountInfo account={account} />
        </div>
        <LinkButton
          text="Reset"
          variant="info"
          textClassName="text-info"
          onClick={onResetAccount}
        />
      </div>
    );
  }

  return (
    <div 
      className="ph-mid pv-max"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <OtherServiceCurrencyPanel
        currencyIndex={leftCurrencyIndex}
        onCycleCurrency={onCycleLeftCurrency}
      />
    </div>
  );
}

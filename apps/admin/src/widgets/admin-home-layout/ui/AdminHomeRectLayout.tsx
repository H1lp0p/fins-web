import {
  BankTreasuryBalancesWidget,
  BankTreasuryTransactionsPanel,
  ExchangeRateWidget,
} from "@fins/entities";
import { RectSpaceLayout } from "@fins/ui-kit";

export function AdminHomeRectLayout() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <RectSpaceLayout
        topLeftContent={<BankTreasuryBalancesWidget />}
        topRightContent={<ExchangeRateWidget />}
        bottomLeftContent={<BankTreasuryTransactionsPanel />}
      />
    </div>
  );
}

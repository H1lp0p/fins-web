import type { CreditEntity } from "@fins/api";
import {
  AmountWithSymbol,
  DEFAULT_CHARS,
} from "@fins/ui-kit";
import {
  creditTotalDebtDisplay,
  currencyCodeToAmountSymbol,
} from "@fins/entities";

export type CreditSummaryHeaderProps = {
  credit: CreditEntity;
};

export function CreditSummaryHeader({ credit }: CreditSummaryHeaderProps) {
  const ruleName =
    credit.creditRule?.ruleName?.trim() || "Rule name {selected}";
  const total = creditTotalDebtDisplay(credit);
  const symbol = credit.currency
    ? currencyCodeToAmountSymbol(credit.currency)
    : DEFAULT_CHARS.DOLLAR;

  return (
    <div
      className="ph-min pv-min gap-min color-info"
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <h3 className="text-title color-info" style={{ margin: 0 }}>
        {ruleName}
      </h3>
      <div
        className="text-info-accent gap-min"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "center",
        }}
      >
        <span className="color-info">debt =</span>
        <AmountWithSymbol
          amount={total}
          symbol={symbol}
          textClassName="text-info-accent"
        />
      </div>
    </div>
  );
}

import type { CreditEntity } from "@fins/api";
import { AmountWithSymbol } from "@fins/ui-kit";
import { creditTotalDebtDisplay, currencyCodeToAmountSymbol } from "@fins/entities";

type CreditsTopLeftWidgetProps =
  | { mode: "creditSummary"; credit: CreditEntity }
  | { mode: "ruleTitle"; title: string };

export function CreditsTopLeftWidget(props: CreditsTopLeftWidgetProps) {
  if (props.mode === "ruleTitle") {
    return (
      <div
        className="ph-mid pv-mid"
        style={{
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h3
          className="text-title color-info"
          style={{ margin: 0, textAlign: "center" }}
        >
          {props.title}
        </h3>
      </div>
    );
  }

  const { credit } = props;
  const title = credit.creditRule?.ruleName?.trim() || "Rule name";
  const total = creditTotalDebtDisplay(credit);
  const sym = currencyCodeToAmountSymbol(credit.currency);

  return (
    <div
      className="ph-mid pv-mid gap-mid"
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h3 className="text-title color-info" style={{ margin: 0 }}>
        {title}
      </h3>
      <div
        className="text-info-accent"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "0.25rem",
        }}
        aria-label="Total debt"
      >
        <span className="color-info">debt =</span>
        <AmountWithSymbol
          amount={total}
          symbol={sym}
          textClassName="text-info-accent"
        />
      </div>
    </div>
  );
}

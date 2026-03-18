import { LinkButton } from "@fins/ui-kit";
import { CreditPaybackLink } from "../../../features/credit-payback/CreditPaybackLink";

type CreditsTopRightWidgetProps =
  | { kind: "createEntry"; onCreate: () => void }
  | { kind: "payback"; creditId: string }
  | { kind: "reset"; onReset: () => void };

export function CreditsTopRightWidget(props: CreditsTopRightWidgetProps) {
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
      {props.kind === "createEntry" ? (
        <LinkButton
          text="Create"
          variant="success"
          onClick={props.onCreate}
        />
      ) : props.kind === "payback" ? (
        <CreditPaybackLink creditId={props.creditId} />
      ) : (
        <LinkButton text="Reset" variant="info" onClick={props.onReset} />
      )}
    </div>
  );
}

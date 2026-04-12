import type { CardAccountEntity, CreditEntity, CreditRuleEntity } from "@fins/api";
import { CreditDetailPanel } from "@fins/entities";
import { CreditCreateForm } from "../../../features/credit-create-form/CreditCreateForm";

type CreditsBottomLeftWidgetProps =
  | {
      kind: "detail";
      credit: CreditEntity;
      linkedAccount?: CardAccountEntity | null;
    }
  | {
      kind: "create";
      userId: string;
      rule: CreditRuleEntity | null;
      account: CardAccountEntity | null;
      amount: string;
      onAmountChange: (value: string) => void;
      onCreated: () => void;
    };

export function CreditsBottomLeftWidget(props: CreditsBottomLeftWidgetProps) {
  if (props.kind === "detail") {
    return (
      <CreditDetailPanel
        credit={props.credit}
        linkedAccount={props.linkedAccount}
      />
    );
  }
  return (
    <CreditCreateForm
      userId={props.userId}
      rule={props.rule}
      account={props.account}
      amount={props.amount}
      onAmountChange={props.onAmountChange}
      onCreated={props.onCreated}
    />
  );
}

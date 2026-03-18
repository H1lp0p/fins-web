import type {
  CardAccountEntity,
  CreditEntity,
  CreditRuleEntity,
} from "@fins/api";
import { CreditsGrid } from "../../../features/credit-list/CreditsGrid";
import { CreditRulesAccountsPicker } from "../../../features/credit-rules-accounts-picker/CreditRulesAccountsPicker";

type CreditsBottomRightWidgetProps =
  | {
      kind: "credits";
      credits: CreditEntity[];
      selectedId: string | null;
      onToggleCredit: (creditId: string) => void;
    }
  | {
      kind: "picker";
      rules: CreditRuleEntity[];
      accounts: CardAccountEntity[];
      selectedRuleId: string | null;
      selectedAccountId: string | null;
      onSelectRule: (ruleId: string) => void;
      onSelectAccount: (accountId: string) => void;
    };

export function CreditsBottomRightWidget(props: CreditsBottomRightWidgetProps) {
  if (props.kind === "credits") {
    return (
      <CreditsGrid
        credits={props.credits}
        selectedId={props.selectedId}
        onToggleCredit={props.onToggleCredit}
      />
    );
  }
  return (
    <CreditRulesAccountsPicker
      rules={props.rules}
      accounts={props.accounts}
      selectedRuleId={props.selectedRuleId}
      selectedAccountId={props.selectedAccountId}
      onSelectRule={props.onSelectRule}
      onSelectAccount={props.onSelectAccount}
    />
  );
}

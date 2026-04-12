import type { CardAccountEntity, CreditRuleEntity } from "@fins/api";
import type { Tab } from "@fins/ui-kit";
import { TabList } from "@fins/ui-kit";
import { useState } from "react";
import { CardAccountInfo, CreditRuleInfo } from "@fins/entities";
import styles from "./CreditRulesAccountsPicker.module.css";

const PICKER_TABS: Tab[] = [
  { id: "rules", label: "Rules" },
  { id: "accounts", label: "Accounts" },
];

type PickerTab = "rules" | "accounts";

type CreditRulesAccountsPickerProps = {
  rules: CreditRuleEntity[];
  accounts: CardAccountEntity[];
  selectedRuleId: string | null;
  selectedAccountId: string | null;
  onSelectRule: (ruleId: string) => void;
  onSelectAccount: (accountId: string) => void;
};

export function CreditRulesAccountsPicker({
  rules,
  accounts,
  selectedRuleId,
  selectedAccountId,
  onSelectRule,
  onSelectAccount,
}: CreditRulesAccountsPickerProps) {
  const [tab, setTab] = useState<PickerTab>("rules");

  const activeTab = tab === "accounts" ? PICKER_TABS[1] : PICKER_TABS[0];

  return (
    <div className={`${styles.wrap} ph-mid pv-mid`}>
      <TabList
        tabs={PICKER_TABS}
        activeTab={activeTab}
        onTabClick={(t) => setTab(t.id as PickerTab)}
        textClassName="text-info"
        className={styles.tabsCentered}
      />

      {tab === "rules" ? (
        <div className={styles.grid}>
          {rules.map((rule) => {
            const id = rule.id;
            if (!id) return null;
            const selected = selectedRuleId === id;
            return (
              <button
                key={id}
                type="button"
                className={styles.pickBtn}
                onClick={() => onSelectRule(id)}
              >
                <CreditRuleInfo rule={rule} selected={selected} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.grid}>
          {accounts.map((acc) => {
            const id = acc.id;
            if (!id || acc.deleted) return null;
            const selected = selectedAccountId === id;
            return (
              <button
                key={id}
                type="button"
                className={styles.pickBtn}
                onClick={() => onSelectAccount(id)}
              >
                <CardAccountInfo account={acc} selected={selected} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

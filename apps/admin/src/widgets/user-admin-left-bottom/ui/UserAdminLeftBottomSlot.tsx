import type { CardAccountEntity, CreditEntity } from "@fins/api";
import {
  AccountTransactionsPanel,
  CreditDetailPanel,
} from "@fins/entities";

export type UserAdminLeftBottomSlotProps = {
  entityTab: "accounts" | "credits";
  selectedAccount: CardAccountEntity | undefined;
  selectedCredit: CreditEntity | undefined;
  linkedAccount: CardAccountEntity | null;
};

export function UserAdminLeftBottomSlot({
  entityTab,
  selectedAccount,
  selectedCredit,
  linkedAccount,
}: UserAdminLeftBottomSlotProps) {
  if (entityTab === "accounts" && selectedAccount?.id) {
    return (
      <div
        style={{
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <AccountTransactionsPanel accountId={selectedAccount.id} />
      </div>
    );
  }
  if (entityTab === "credits" && selectedCredit) {
    return (
      <CreditDetailPanel
        credit={selectedCredit}
        linkedAccount={linkedAccount}
      />
    );
  }
  return null;
}

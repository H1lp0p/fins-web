import type { CardAccountEntity, CreditEntity } from "@fins/api";
import { CardAccountInfo } from "@fins/entities";
import { CreditSummaryHeader } from "../../../features/users";

export type UserAdminLeftTopSlotProps = {
  entityTab: "accounts" | "credits";
  selectedAccount: CardAccountEntity | undefined;
  selectedCredit: CreditEntity | undefined;
};

export function UserAdminLeftTopSlot({
  entityTab,
  selectedAccount,
  selectedCredit,
}: UserAdminLeftTopSlotProps) {
  if (entityTab === "accounts" && selectedAccount) {
    return (
      <div
        className="ph-mid pv-mid"
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <CardAccountInfo account={selectedAccount} />
      </div>
    );
  }
  if (entityTab === "credits" && selectedCredit) {
    return <CreditSummaryHeader credit={selectedCredit} />;
  }
  return null;
}

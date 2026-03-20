import type { CardAccountEntity, CreditEntity } from "@fins/api";
import type { Tab } from "@fins/ui-kit";
import { CenteredPlaceholder, TabList } from "@fins/ui-kit";
import { CardAccountInfo, CreditShortInfo } from "@fins/entities";

const ENTITY_TABS: Tab[] = [
  { id: "accounts", label: "Accounts" },
  { id: "credits", label: "Credits" },
];

export type UserEntityPickerPanelProps = {
  entityTab: "accounts" | "credits";
  onEntityTabChange: (tab: "accounts" | "credits") => void;
  accounts: CardAccountEntity[];
  credits: CreditEntity[];
  selectedAccountId: string | null;
  selectedCreditId: string | null;
  onSelectAccount: (id: string | null) => void;
  onSelectCredit: (id: string | null) => void;
};

export function UserEntityPickerPanel({
  entityTab,
  onEntityTabChange,
  accounts,
  credits,
  selectedAccountId,
  selectedCreditId,
  onSelectAccount,
  onSelectCredit,
}: UserEntityPickerPanelProps) {
  const activeTab: Tab =
    ENTITY_TABS.find((t) => t.id === entityTab) ?? ENTITY_TABS[0];

  return (
    <div
      className="pv-mid gap-mid color-info"
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <TabList
        tabs={ENTITY_TABS}
        activeTab={activeTab}
        onTabClick={(tab) => {
          if (tab.id === "accounts" || tab.id === "credits") {
            onEntityTabChange(tab.id);
          }
        }}
        textClassName="text-title"
      />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          alignItems: "center",
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--fins-min-gap, 0.5rem)",
        }}
      >
        {entityTab === "accounts" ? (
          accounts.length === 0 ? (
            <CenteredPlaceholder text="accounts.length === 0" />
          ) : (
            <div
              className="gap-min ph-mid"
              style={{
                display: "grid",
                width: "100%",
                boxSizing: "border-box",
                height: "100%",
                gridTemplateColumns: "1fr 1fr",
                alignContent: "start",
              }}
            >
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectAccount(acc.id ?? null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectAccount(acc.id ?? null);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <CardAccountInfo
                    account={acc}
                    selected={acc.id === selectedAccountId}
                  />
                </div>
              ))}
            </div>
          )
        ) : credits.length === 0 ? (
          <CenteredPlaceholder text="credits.length === 0" />
        ) : (
          credits.map((cr) => (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                cursor: "pointer",
              }}
              key={cr.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectCredit(cr.id ?? null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCredit(cr.id ?? null);
                }
              }}
            >
              <CreditShortInfo
                credit={cr}
                selected={cr.id === selectedCreditId}
                style={{width: "100%"}}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

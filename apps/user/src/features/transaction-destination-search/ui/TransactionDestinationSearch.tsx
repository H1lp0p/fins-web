import { Input, LinkButton, TabList, type Tab } from "@fins/ui-kit";
import { OtherServiceCurrencyPanel } from "../../other-service-currency";
import {
  TRANSACTION_DESTINATION_TABS,
  type TransactionDestinationTabId,
} from "../lib/destination-tabs";
import styles from "./TransactionDestinationSearch.module.css";

const INPUT_BY_TAB: Record<
  TransactionDestinationTabId,
  { title: string; placeholder: string } | null
> = {
  accounts: { title: "Name", placeholder: "Account name" },
  credits: { title: "Credit", placeholder: "Credit rule name" },
  users: { title: "Email", placeholder: "user.email@gmail.com" },
  "other-service": null,
};

export type TransactionDestinationSearchProps = {
  activeTabId: TransactionDestinationTabId;
  onTabChange: (id: TransactionDestinationTabId) => void;
  searchDraft: string;
  onSearchDraftChange: (v: string) => void;
  onApplySearch: () => void;
  otherCurrencyIndex: number;
  onCycleOtherCurrency: () => void;
  onResetFromOtherService: () => void;
};

export function TransactionDestinationSearch({
  activeTabId,
  onTabChange,
  searchDraft,
  onSearchDraftChange,
  onApplySearch,
  otherCurrencyIndex,
  onCycleOtherCurrency,
  onResetFromOtherService,
}: TransactionDestinationSearchProps) {
  const activeTab: Tab =
    TRANSACTION_DESTINATION_TABS.find((t) => t.id === activeTabId) ??
    TRANSACTION_DESTINATION_TABS[0];
  const inputCfg = INPUT_BY_TAB[activeTabId];

  return (
    <div 
      className={`${styles.root} ph-mid pv-mid gap-mid`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <TabList
        tabs={TRANSACTION_DESTINATION_TABS}
        activeTab={activeTab}
        onTabClick={(tab) => onTabChange(tab.id as TransactionDestinationTabId)}
        textClassName="text-info"
      />
      {inputCfg ? (
        <div className={styles.searchRow}>
          <Input
            title={inputCfg.title}
            placeholder={inputCfg.placeholder}
            value={searchDraft}
            onChange={onSearchDraftChange}
            textClassName="text-info"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <LinkButton
              text="Search"
              variant="info"
              textClassName="text-info"
              onClick={onApplySearch}
            />
          </div>
        </div>
      ) : (
        <div className={styles.otherRow}>
          <div className={styles.otherInner}>
            <OtherServiceCurrencyPanel
              currencyIndex={otherCurrencyIndex}
              onCycleCurrency={onCycleOtherCurrency}
            />
          </div>
          <LinkButton
            text="Reset"
            variant="info"
            textClassName="text-info"
            onClick={onResetFromOtherService}
          />
        </div>
      )}
    </div>
  );
}

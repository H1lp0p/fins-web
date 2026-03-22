import type {
  CardAccountEntity,
  CreditEntity,
  TransferDestinationUser,
} from "@fins/api";
import {
  CenteredPlaceholder,
  LoadingFrameIndicator,
} from "@fins/ui-kit";
import {
  CardAccountInfo,
  CreditShortInfo,
  UserCard,
  currencyCodeToAmountSymbol,
} from "@fins/entities";
import type { TransactionDestinationTabId } from "../../transaction-destination-search";
import {
  filterCardAccountsByQuery,
  filterCreditsByQuery,
  filterUsersByQuery,
} from "../../../shared/lib/filter-entities-by-query";
import styles from "./TransactionDestinationResults.module.css";

const busyCenter = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

export type TransactionDestinationResultsProps = {
  tabId: TransactionDestinationTabId;
  appliedQuery: string;
  accounts: CardAccountEntity[];
  credits: CreditEntity[];
  users: TransferDestinationUser[];
  selectedAccountId: string | null;
  selectedCreditId: string | null;
  selectedUserId: string | null;
  onSelectAccount: (id: string) => void;
  onSelectCredit: (id: string) => void;
  onSelectUser: (id: string) => void;
  
  usersDirectoryLoading?: boolean;
};

export function TransactionDestinationResults({
  tabId,
  appliedQuery,
  accounts,
  credits,
  users,
  selectedAccountId,
  selectedCreditId,
  selectedUserId,
  onSelectAccount,
  onSelectCredit,
  onSelectUser,
  usersDirectoryLoading = false,
}: TransactionDestinationResultsProps) {
  if (tabId === "other-service") {
    return null;
  }

  const accFiltered = filterCardAccountsByQuery(accounts, appliedQuery);
  const crFiltered = filterCreditsByQuery(credits, appliedQuery);
  const usFiltered = filterUsersByQuery(users, appliedQuery);

  return (
    <div
      className={`${styles.wrap} ph-mid pv-mid`}
      style={{
        height: "100%",
        boxSizing: "border-box",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {tabId === "accounts" ? (
        accFiltered.length === 0 ? (
          <CenteredPlaceholder text="matchedAccounts.length === 0" />
        ) : (
          <div className={styles.grid}>
            {accFiltered.map((acc) => {
              const id = acc.id;
              if (!id) return null;
              const deleted = acc.deleted === true;
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.cardBtn}
                  disabled={deleted}
                  onClick={() => {
                    if (!deleted) onSelectAccount(id);
                  }}
                >
                  <CardAccountInfo
                    account={acc}
                    selected={selectedAccountId === id}
                  />
                </button>
              );
            })}
          </div>
        )
      ) : null}

      {tabId === "credits" ? (
        crFiltered.length === 0 ? (
          <CenteredPlaceholder text="matchedCredits.length === 0" />
        ) : (
          <div className={styles.listColumn}>
            {crFiltered.map((c) => {
              const id = c.id;
              if (!id) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.cardBtn}
                  onClick={() => onSelectCredit(id)}
                >
                  <CreditShortInfo
                    credit={c}
                    selected={selectedCreditId === id}
                  />
                </button>
              );
            })}
          </div>
        )
      ) : null}

      {tabId === "users" ? (
        usersDirectoryLoading ? (
          <div style={busyCenter}>
            <LoadingFrameIndicator />
          </div>
        ) : usFiltered.length === 0 ? (
          <CenteredPlaceholder text="matchedUsers.length === 0" />
        ) : (
          <div className={styles.grid}>
            {usFiltered.map((u) => (
              <button
                key={u.id}
                type="button"
                className={styles.cardBtn}
                onClick={() => onSelectUser(u.id)}
              >
                <UserCard
                  name={u.name || u.email || u.id}
                  currencySymbol={currencyCodeToAmountSymbol(
                    u.mainAccountCurrency,
                  )}
                  selected={selectedUserId === u.id}
                />
              </button>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

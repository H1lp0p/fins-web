import type {
  CardAccountEntity,
  CreditEntity,
  TransferDestinationUser,
} from "@fins/api";
import { CardAccountInfo } from "../../../entities/card-account";
import { CreditShortInfo } from "../../../entities/credit";
import { UserCard } from "../../../entities/user";
import type { TransactionDestinationTabId } from "../../transaction-destination-search";
import {
  filterCardAccountsByQuery,
  filterCreditsByQuery,
  filterUsersByQuery,
} from "../../../shared/lib/filter-entities-by-query";
import { currencyCodeToAmountSymbol } from "../../../shared/lib/currency-symbol";
import styles from "./TransactionDestinationResults.module.css";

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
      style={{ height: "100%", boxSizing: "border-box", overflow: "auto" }}
    >
      {tabId === "accounts" ? (
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
      ) : null}

      {tabId === "credits" ? (
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
      ) : null}

      {tabId === "users" ? (
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
      ) : null}
    </div>
  );
}

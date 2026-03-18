import type { User } from "@fins/api";
import { currencyCodeFromTransactionIndex } from "../../../shared/lib/transaction-currencies";
import type { TransactionDestinationTabId } from "../../transaction-destination-search";

export function buildTransactionDestinationToken(
  tabId: TransactionDestinationTabId,
  opts: {
    selectedAccountId: string | null;
    selectedCreditId: string | null;
    selectedUserId: string | null;
    rightCurrencyIndex: number;
    users: User[];
  },
): string {
  switch (tabId) {
    case "accounts":
      return opts.selectedAccountId
        ? `account:${opts.selectedAccountId}`
        : "";
    case "credits":
      return opts.selectedCreditId ? `credit:${opts.selectedCreditId}` : "";
    case "users": {
      const u = opts.users.find((x) => x.id === opts.selectedUserId);
      return u ? `user:${u.email}` : "";
    }
    case "other-service":
      return `other:${currencyCodeFromTransactionIndex(opts.rightCurrencyIndex)}`;
    default:
      return "";
  }
}

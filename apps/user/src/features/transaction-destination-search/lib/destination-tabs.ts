import type { Tab } from "@fins/ui-kit";

export type TransactionDestinationTabId =
  | "accounts"
  | "credits"
  | "users"
  | "other-service";

export const TRANSACTION_DESTINATION_TABS: Tab[] = [
  { id: "accounts", label: "Accounts" },
  { id: "credits", label: "Credits" },
  { id: "users", label: "Users" },
  { id: "other-service", label: "Other service" },
];

export function destinationTabFromToType(
  t: string | undefined,
): TransactionDestinationTabId {
  switch (t) {
    case "Account":
      return "accounts";
    case "Credit":
      return "credits";
    case "User":
      return "users";
    case "Other service":
      return "other-service";
    default:
      return "accounts";
  }
}

import type { CardAccountEntity } from "@fins/api";
import type { CardAccountDisplayStatus } from "../entities/card-account";

const baseAccount: CardAccountEntity = {
  id: "22222222-2222-2222-2222-222222222222",
  userId: "33333333-3333-3333-3333-333333333333",
  money: { value: 100_000, currency: "DOLLAR" },
  deleted: false,
};

export type CardAccountInfoDemo = {
  name: string;
  account: CardAccountEntity;
  displayStatus?: CardAccountDisplayStatus;
  selected?: boolean;
};

/** Четыре варианта `card-account-info` как в Figma. */
export const CARD_ACCOUNT_INFO_DEMOS: CardAccountInfoDemo[] = [
  { name: "Account name", account: { ...baseAccount, deleted: false } },
  {
    name: "Account name",
    account: { ...baseAccount, deleted: false },
    displayStatus: "hidden",
    selected: false,
  },
  {
    name: "Account name",
    account: { ...baseAccount, deleted: false },
    displayStatus: "closed",
    selected: false,
  },
  {
    name: "Account name",
    account: { ...baseAccount, deleted: false },
    displayStatus: "main",
    selected: true,
  },
];

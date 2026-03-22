import type { CreditEntity } from "@fins/api";

export const DEMO_CREDIT_SHORT: CreditEntity = {
  id: "44444444-4444-4444-4444-444444444444",
  userId: "33333333-3333-3333-3333-333333333333",
  cardAccountId: "22222222-2222-2222-2222-222222222222",
  initialDebt: 1_000_000,
  currentDebtSum: 721_000,
  interestDebtSum: 279_000,
  currency: "DOLLAR",
  creditRule: {
    id: "55555555-5555-5555-5555-555555555555",
    ruleName: "Rule name",
    percentage: 12,
    percentageStrategy: "FROM_REMAINING_DEBT",
    collectionPeriodSeconds: 86400,
    openingDate: "2024-01-01T00:00:00.000Z",
  },
};

import type { CreditRuleEntity } from "@fins/api";

export const DEMO_CREDIT_RULE: CreditRuleEntity = {
  ruleName: "Rule name",
  percentage: 53,
  collectionPeriodSeconds: 12 * 86400,
  percentageStrategy: "FROM_REMAINING_DEBT",
  openingDate: "2024-01-15T10:00:00.000Z",
  id: "11111111-1111-1111-1111-111111111111",
};

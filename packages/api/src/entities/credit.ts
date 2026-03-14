import type {
  Credit,
  CreditRule,
  CreditRuleDto,
} from "../generated/public/generatedPublicApi";
import type { CurrencyCode } from "./money";

export type CreditPercentageStrategy =
  | "FROM_REMAINING_DEBT"
  | "FROM_TOTAL_DEBT";

export type CreditRuleEntity = {
  id?: string;
  percentageStrategy?: CreditPercentageStrategy;
  collectionPeriodSeconds?: number;
  openingDate?: string;
  ruleName?: string;
  percentage?: number;
};

export type CreditEntity = {
  id?: string;
  userId?: string;
  /** В API поле называется `cardAccount` (uuid счёта). */
  cardAccountId?: string;
  lastInterestUpdate?: string;
  currentDebtSum?: number;
  initialDebt?: number;
  interestDebtSum?: number;
  currency?: CurrencyCode;
  creditRule?: CreditRuleEntity;
};

export function mapCreditRuleFromDto(
  dto: CreditRule | CreditRuleDto,
): CreditRuleEntity {
  return {
    id: "id" in dto ? dto.id : undefined,
    percentageStrategy: dto.percentageStrategy,
    collectionPeriodSeconds: dto.collectionPeriodSeconds,
    openingDate: dto.openingDate,
    ruleName: dto.ruleName,
    percentage: dto.percentage,
  };
}

export function mapCreditFromDto(dto: Credit): CreditEntity {
  return {
    id: dto.id,
    userId: dto.userId,
    cardAccountId: dto.cardAccount,
    lastInterestUpdate: dto.lastInterestUpdate,
    currentDebtSum: dto.currentDebtSum,
    initialDebt: dto.initialDebt,
    interestDebtSum: dto.interestDebtSum,
    currency: dto.currency,
    creditRule: dto.creditRule
      ? mapCreditRuleFromDto(dto.creditRule)
      : undefined,
  };
}

export function mapCreditsFromDto(dtos: Credit[] | undefined): CreditEntity[] {
  return (dtos ?? []).map(mapCreditFromDto);
}

export function mapCreditRulesFromDto(
  rules: CreditRule[] | undefined,
): CreditRuleEntity[] {
  return (rules ?? []).map((r) => mapCreditRuleFromDto(r));
}

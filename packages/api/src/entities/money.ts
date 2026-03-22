import type { Currency, MoneyValueDto } from "../generated/public/generatedPublicApi";

export type CurrencyCode = Currency;

export type Money = {
  value: number;
  currency: CurrencyCode;
};

export function mapMoneyFromDto(
  dto: MoneyValueDto | undefined,
): Money | undefined {
  if (dto?.value === undefined || dto.currency === undefined) {
    return undefined;
  }
  return { value: dto.value, currency: dto.currency };
}

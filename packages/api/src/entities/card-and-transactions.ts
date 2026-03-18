import type {
  CardAccount,
  PageCardAccount,
  PageTransactionOperation,
  TransactionOperation,
} from "../generated/public/generatedPublicApi";
import { mapMoneyFromDto, type Money } from "./money";

export type CardAccountEntity = {
  id?: string;
  userId?: string;
  name?: string;
  main?: boolean;
  /** false = hidden в UI */
  visible?: boolean;
  money?: Money;
  deleted?: boolean;
  transactionOperations?: TransactionOperationEntity[];
};

export type TransactionOperationEntity = {
  id?: string;
  cardAccountId?: string;
  dateTime?: string;
  transactionType?: "WITHDRAWAL" | "ENROLLMENT";
  /** С API приходит как `transactionActoin` — в домене исправленное имя. */
  transactionAction?: string;
  transactionStatus?: "COMPLETE" | "IN_PROGRESS" | "DECLINED";
  money?: Money;
};

export type PagedCardAccounts = Omit<PageCardAccount, "content"> & {
  content: CardAccountEntity[];
};

export type PagedTransactionOperations = Omit<
  PageTransactionOperation,
  "content"
> & {
  content: TransactionOperationEntity[];
};

export type MapTransactionOperationContext = {
  /** Если в DTO нет `cardAccountId`, подставляется (например id родительского счёта). */
  cardAccountId?: string;
};

export function mapTransactionOperationFromDto(
  dto: TransactionOperation,
  context?: MapTransactionOperationContext,
): TransactionOperationEntity {
  return {
    id: dto.id,
    cardAccountId: dto.cardAccountId ?? context?.cardAccountId,
    dateTime: dto.dateTime,
    transactionType: dto.transactionType,
    transactionAction: dto.transactionActoin,
    transactionStatus: dto.transactionStatus,
    money: mapMoneyFromDto(dto.money),
  };
}

export function mapCardAccountFromDto(dto: CardAccount): CardAccountEntity {
  return {
    id: dto.id,
    userId: dto.userId,
    name: dto.name,
    main: dto.main,
    visible: dto.visible,
    money: mapMoneyFromDto(dto.money),
    deleted: dto.deleted,
    transactionOperations: dto.transactionOperations?.map((op) =>
      mapTransactionOperationFromDto(op, { cardAccountId: dto.id }),
    ),
  };
}

export function mapPagedCardAccountsFromDto(
  dto: PageCardAccount,
): PagedCardAccounts;
export function mapPagedCardAccountsFromDto(
  dto: PageCardAccount | undefined,
): PagedCardAccounts | undefined;
export function mapPagedCardAccountsFromDto(
  dto: PageCardAccount | undefined,
): PagedCardAccounts | undefined {
  if (dto === undefined) return undefined;
  return {
    totalPages: dto.totalPages,
    totalElements: dto.totalElements,
    size: dto.size,
    content: (dto.content ?? []).map(mapCardAccountFromDto),
    number: dto.number,
    sort: dto.sort,
    numberOfElements: dto.numberOfElements,
    first: dto.first,
    last: dto.last,
    pageable: dto.pageable,
    empty: dto.empty,
  };
}

export function mapPagedTransactionOperationsFromDto(
  dto: PageTransactionOperation,
): PagedTransactionOperations;
export function mapPagedTransactionOperationsFromDto(
  dto: PageTransactionOperation | undefined,
): PagedTransactionOperations | undefined;
export function mapPagedTransactionOperationsFromDto(
  dto: PageTransactionOperation | undefined,
): PagedTransactionOperations | undefined {
  if (dto === undefined) return undefined;
  return {
    totalPages: dto.totalPages,
    totalElements: dto.totalElements,
    size: dto.size,
    content: (dto.content ?? []).map((op) =>
      mapTransactionOperationFromDto(op),
    ),
    number: dto.number,
    sort: dto.sort,
    numberOfElements: dto.numberOfElements,
    first: dto.first,
    last: dto.last,
    pageable: dto.pageable,
    empty: dto.empty,
  };
}

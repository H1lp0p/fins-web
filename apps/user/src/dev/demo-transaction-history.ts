import type { TransactionOperationEntity } from "@fins/api";

export const DEMO_TRANSACTION_WITHDRAWAL: TransactionOperationEntity = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  cardAccountId: "22222222-2222-2222-2222-222222222222",
  transactionType: "WITHDRAWAL",
  transactionAction: "Simple withdrawal",
  transactionStatus: "COMPLETE",
  dateTime: "2025-01-01T12:00:00.000Z",
  money: { value: 10_001.12, currency: "EUR" },
};

export const DEMO_TRANSACTION_ENROLLMENT: TransactionOperationEntity = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  cardAccountId: "22222222-2222-2222-2222-222222222222",
  transactionType: "ENROLLMENT",
  transactionAction: "Simple Enrollment",
  transactionStatus: "COMPLETE",
  dateTime: "2025-01-01T12:00:00.000Z",
  money: { value: 10_001.12, currency: "EUR" },
};

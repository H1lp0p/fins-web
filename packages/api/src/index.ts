/**
 * Общий entry для клиентов (user, admin): без SSO-only модулей.
 */
export {
  createBffFetchBaseQuery,
  type BffClientOptions,
} from "./lib/bff-fetch-base-query";
export { initPublicBffApi } from "./generated/public/emptyPublicApi";
export type * from "./generated/public/generatedPublicApi";
export { addTagTypes } from "./generated/public/generatedPublicApi";
export {
  generatedPublicApi,
  publicBffApi,
  useCloseAccountMutation,
  useCreateCreditMutation,
  useCreateCreditRuleMutation,
  useDeleteCreditMutation,
  useDeleteCreditRuleMutation,
  useDeleteUserByIdMutation,
  useEditCreditRuleMutation,
  useEditUser1Mutation,
  useEditUserMutation,
  useEnrollMoneyMutation,
  useGetAllCreditRulesQuery,
  useGetAllUsersQuery,
  useGetByCardAccountIdQuery,
  useGetByUserIdQuery,
  useGetCreditRuleByIdQuery,
  useGetTransactionOperationsQuery,
  useGetUserById1Query,
  useGetUserByIdQuery,
  useGetUserCardAccountQuery,
  useGetUserCardAccountsQuery,
  useGetUserQuery,
  useIsUserActiveByIdQuery,
  useMakeEnrollmentMutation,
  useOpenAccountMutation,
  useSetAccountVisibilityMutation,
  useSetMainAccountMutation,
  useTransferMoneyMutation,
  useWithdrawMoneyMutation,
  useCheckAccountExistsQuery,
} from "./public-bff-api";
export type { CurrencyCode, Money } from "./entities/money";
export { mapMoneyFromDto } from "./entities/money";
export type { User, UserRole } from "./entities/user";
export { mapUserFromDto } from "./entities/user";
export type {
  CardAccountEntity,
  MapTransactionOperationContext,
  PagedCardAccounts,
  PagedTransactionOperations,
  TransactionOperationEntity,
} from "./entities/card-and-transactions";
export {
  mapCardAccountFromDto,
  mapPagedCardAccountsFromDto,
  mapPagedTransactionOperationsFromDto,
  mapTransactionOperationFromDto,
} from "./entities/card-and-transactions";
export type {
  CreditEntity,
  CreditPercentageStrategy,
  CreditRuleEntity,
} from "./entities/credit";
export {
  mapCreditFromDto,
  mapCreditRuleFromDto,
  mapCreditRulesFromDto,
  mapCreditsFromDto,
} from "./entities/credit";
export type { BffError } from "./entities/bff-error";
export {
  extractBffError,
  mapBffErrorFromBody,
  tryParseBffError,
} from "./entities/bff-error";
export * from "./forms";

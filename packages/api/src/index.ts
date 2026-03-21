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
  useGetUsersDirectoryQuery,
  useGetByCardAccountIdQuery,
  useGetByUserIdQuery,
  useGetCreditRuleByIdQuery,
  useGetTransactionOperationsQuery,
  useGetBankTreasuryBalancesQuery,
  useGetBankTreasuryTransactionsQuery,
  useGetUserById1Query,
  useGetUserByIdQuery,
  useGetUserCardAccountQuery,
  useGetUserCardAccountsQuery,
  useGetUserQuery,
  useIsUserActiveByIdQuery,
  useMakeEnrollmentMutation,
  useOpenAccountMutation,
  useSetMainAccountMutation,
  useTransferMoneyMutation,
  useWithdrawMoneyMutation,
  useCheckAccountExistsQuery,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
} from "./public-bff-api";
export type { CurrencyCode, Money } from "./entities/money";
export { mapMoneyFromDto } from "./entities/money";
export type {
  TransferDestinationUser,
  User,
  UserRole,
} from "./entities/user";
export {
  mapUserDirectoryEntryFromDto,
  mapUserFromDto,
  mapUserToTransferDestinationUser,
} from "./entities/user";
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

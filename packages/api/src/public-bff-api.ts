import { generatedPublicApi as rawPublicBffApi } from "./generated/public/generatedPublicApi";
import type {
  CardAccount,
  Credit,
  CreditRatingDto,
  CreditRule,
  PageCardAccount,
  PageTransactionOperation,
  UserDto,
} from "./generated/public/generatedPublicApi";
import { BFF_IDEMPOTENCY_KEY_HEADER } from "./lib/bff-idempotency-header";
import {
  mapCardAccountFromDto,
  mapPagedCardAccountsFromDto,
  mapPagedTransactionOperationsFromDto,
} from "./entities/card-and-transactions";
import {
  mapCreditFromDto,
  mapCreditRatingFromDto,
  mapCreditRuleFromDto,
  mapCreditRulesFromDto,
  mapCreditsFromDto,
} from "./entities/credit";
import { mapUserFromDto } from "./entities/user";

function idempotencyHeaders(queryArg: unknown): { headers?: Record<string, string> } {
  if (typeof queryArg !== "object" || queryArg === null) return {};
  const raw = (queryArg as { idempotencyKey?: unknown }).idempotencyKey;
  const key = typeof raw === "string" ? raw.trim() : "";
  if (!key) return {};
  return { headers: { [BFF_IDEMPOTENCY_KEY_HEADER]: key } };
}

export const generatedPublicApi = rawPublicBffApi.enhanceEndpoints({
  endpoints: {
    getAllUsers: {
      transformResponse: (rows: UserDto[]) => rows.map(mapUserFromDto),
    },
    getUserById: {
      transformResponse: (dto: UserDto) => mapUserFromDto(dto),
    },
    getUserById1: {
      transformResponse: (dto: UserDto) => mapUserFromDto(dto),
    },
    getUser: {
      transformResponse: (dto: UserDto) => mapUserFromDto(dto),
    },
    openAccount: {
      transformResponse: (dto: CardAccount) => mapCardAccountFromDto(dto),
    },
    getUserCardAccount: {
      transformResponse: (dto: CardAccount) => mapCardAccountFromDto(dto),
    },
    getTransactionOperations: {
      transformResponse: (page: PageTransactionOperation) =>
        mapPagedTransactionOperationsFromDto(page),
    },
    getBankTreasuryTransactions: {
      transformResponse: (page: PageTransactionOperation) =>
        mapPagedTransactionOperationsFromDto(page),
    },
    getUserCardAccounts: {
      transformResponse: (page: PageCardAccount) =>
        mapPagedCardAccountsFromDto(page),
    },
    setMainAccount: {
      transformResponse: (dto: CardAccount) => mapCardAccountFromDto(dto),
      query: (queryArg) => ({
        url: `/core-api/cardaccount/${queryArg.accountId}/set-main`,
        method: "POST" as const,
        ...idempotencyHeaders(queryArg),
      }),
    },
    withdrawMoney: {
      query: (queryArg) => ({
        url: `/core-api/transactions/withdraw`,
        method: "POST" as const,
        body: queryArg.withdrawDto,
        ...idempotencyHeaders(queryArg),
      }),
    },
    closeAccount: {
      query: (queryArg) => ({
        url: `/core-api/cardaccount/close/${queryArg.accountId}`,
        method: "POST" as const,
        ...idempotencyHeaders(queryArg),
      }),
    },
    editUser: {
      query: (queryArg) => ({
        url: `/user-service/users/${queryArg.id}/edit`,
        method: "PUT" as const,
        body: queryArg.userEditModelDto,
        ...idempotencyHeaders(queryArg),
      }),
    },
    updatePreferences: {
      invalidatesTags: ["preferences-controller", "card-account-controller"],
      query: (queryArg) => ({
        url: `/preferences-service/preferences`,
        method: "PUT" as const,
        body: queryArg.userPreferencesDto,
        ...idempotencyHeaders(queryArg),
      }),
    },
    editCreditRule: {
      transformResponse: (dto: CreditRule) => mapCreditRuleFromDto(dto),
    },
    createCreditRule: {
      transformResponse: (dto: CreditRule) => mapCreditRuleFromDto(dto),
      query: (queryArg) => ({
        url: `/credit-service/credit_rule/create`,
        method: "POST" as const,
        body: queryArg.creditRuleDto,
        ...idempotencyHeaders(queryArg),
      }),
    },
    makeEnrollment: {
      transformResponse: (dto: Credit) => mapCreditFromDto(dto),
    },
    createCredit: {
      transformResponse: (dto: Credit) => mapCreditFromDto(dto),
      query: (queryArg) => ({
        url: `/credit-service/credit/create`,
        method: "POST" as const,
        body: queryArg.creditCreateModelDto,
        ...idempotencyHeaders(queryArg),
      }),
    },
    getCreditRuleById: {
      transformResponse: (dto: CreditRule) => mapCreditRuleFromDto(dto),
    },
    getAllCreditRules: {
      transformResponse: (rows: CreditRule[]) => mapCreditRulesFromDto(rows),
    },
    getByUserId: {
      transformResponse: (rows: Credit[]) => mapCreditsFromDto(rows),
    },
    getCreditRatingByUser: {
      transformResponse: (dto: CreditRatingDto) => mapCreditRatingFromDto(dto),
    },
    getByCardAccountId: {
      transformResponse: (dto: Credit) => mapCreditFromDto(dto),
    },
    transferMoney: {
      query: (queryArg) => ({
        url: `/core-api/transactions/transfer`,
        method: "POST" as const,
        body: queryArg.transferMoneyDto,
        ...idempotencyHeaders(queryArg),
      }),
      invalidatesTags: ["transaction-operation-controller", "card-account-controller"],
    },
  },
});

export const {
  useEditUserMutation,
  useEditUser1Mutation,
  useGetAllUsersQuery,
  useGetUsersDirectoryQuery,
  useGetUserByIdQuery,
  useDeleteUserByIdMutation,
  useIsUserActiveByIdQuery,
  useGetUserById1Query,
  useGetUserQuery,
  useWithdrawMoneyMutation,
  useEnrollMoneyMutation,
  useTransferMoneyMutation,
  useOpenAccountMutation,
  useCloseAccountMutation,
  useSetMainAccountMutation,
  useGetTransactionOperationsQuery,
  useGetBankTreasuryBalancesQuery,
  useGetBankTreasuryTransactionsQuery,
  useGetUserCardAccountQuery,
  useCheckAccountExistsQuery,
  useGetUserCardAccountsQuery,
  useEditCreditRuleMutation,
  useCreateCreditRuleMutation,
  useMakeEnrollmentMutation,
  useCreateCreditMutation,
  useGetCreditRuleByIdQuery,
  useGetAllCreditRulesQuery,
  useGetByUserIdQuery,
  useGetCreditRatingByUserQuery,
  useGetByCardAccountIdQuery,
  useDeleteCreditRuleMutation,
  useDeleteCreditMutation,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useGetCurrencyListQuery,
} = generatedPublicApi;

import { generatedPublicApi as rawPublicBffApi } from "./generated/public/generatedPublicApi";
import type {
  CardAccount,
  Credit,
  CreditRule,
  PageCardAccount,
  PageTransactionOperation,
  UserDto,
} from "./generated/public/generatedPublicApi";
import {
  mapCardAccountFromDto,
  mapPagedCardAccountsFromDto,
  mapPagedTransactionOperationsFromDto,
} from "./entities/card-and-transactions";
import {
  mapCreditFromDto,
  mapCreditRuleFromDto,
  mapCreditRulesFromDto,
  mapCreditsFromDto,
} from "./entities/credit";
import { mapUserFromDto } from "./entities/user";

/**
 * Публичный BFF API с `transformResponse` → доменные сущности.
 * `generatedPublicApi` из codegen остаётся «сырым»; приложения подключают этот инстанс.
 */
export const publicBffApi = rawPublicBffApi.enhanceEndpoints({
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
    getUserCardAccounts: {
      transformResponse: (page: PageCardAccount) =>
        mapPagedCardAccountsFromDto(page),
    },
    setMainAccount: {
      transformResponse: (dto: CardAccount) => mapCardAccountFromDto(dto),
    },
    setAccountVisibility: {
      transformResponse: (dto: CardAccount) => mapCardAccountFromDto(dto),
    },
    editCreditRule: {
      transformResponse: (dto: CreditRule) => mapCreditRuleFromDto(dto),
    },
    createCreditRule: {
      transformResponse: (dto: CreditRule) => mapCreditRuleFromDto(dto),
    },
    makeEnrollment: {
      transformResponse: (dto: Credit) => mapCreditFromDto(dto),
    },
    createCredit: {
      transformResponse: (dto: Credit) => mapCreditFromDto(dto),
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
    getByCardAccountId: {
      transformResponse: (dto: Credit) => mapCreditFromDto(dto),
    },
    transferMoney: {
      invalidatesTags: ["transaction-operation-controller", "card-account-controller"],
    },
  },
});

export { publicBffApi as generatedPublicApi };

export const {
  useEditUserMutation,
  useEditUser1Mutation,
  useGetAllUsersQuery,
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
  useSetAccountVisibilityMutation,
  useGetTransactionOperationsQuery,
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
  useGetByCardAccountIdQuery,
  useDeleteCreditRuleMutation,
  useDeleteCreditMutation,
} = publicBffApi;

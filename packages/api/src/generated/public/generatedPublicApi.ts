import { emptySplitApi as api } from "./emptyPublicApi";
export const addTagTypes = [
  "Users",
  "Account",
  "Admin",
  "Users Internal",
  "transaction-operation-controller",
  "card-account-controller",
  "credit-rule-controller",
  "credit-controller",
  "preferences-controller",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      editUser: build.mutation<EditUserApiResponse, EditUserApiArg>({
        query: (queryArg) => ({
          url: `/user-service/users/${queryArg.id}/edit`,
          method: "PUT",
          body: queryArg.userEditModelDto,
        }),
        invalidatesTags: ["Users"],
      }),
      editUser1: build.mutation<EditUser1ApiResponse, EditUser1ApiArg>({
        query: (queryArg) => ({
          url: `/user-service/account/edit`,
          method: "PUT",
          body: queryArg.userEditModelDto,
        }),
        invalidatesTags: ["Account"],
      }),
      getAllUsers: build.query<GetAllUsersApiResponse, GetAllUsersApiArg>({
        query: () => ({ url: `/user-service/users` }),
        providesTags: ["Users"],
      }),
      getUsersDirectory: build.query<
        GetUsersDirectoryApiResponse,
        GetUsersDirectoryApiArg
      >({
        query: () => ({ url: `/user-service/users/directory` }),
        providesTags: ["Users"],
      }),
      getUserById: build.query<GetUserByIdApiResponse, GetUserByIdApiArg>({
        query: (queryArg) => ({ url: `/user-service/users/${queryArg.id}` }),
        providesTags: ["Users"],
      }),
      deleteUserById: build.mutation<
        DeleteUserByIdApiResponse,
        DeleteUserByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/user-service/users/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Users"],
      }),
      isUserActiveById: build.query<
        IsUserActiveByIdApiResponse,
        IsUserActiveByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/user-service/users/${queryArg.id}/isActive`,
        }),
        providesTags: ["Users"],
      }),
      getBankTreasuryBalances: build.query<
        GetBankTreasuryBalancesApiResponse,
        GetBankTreasuryBalancesApiArg
      >({
        query: () => ({ url: `/user-service/admin/bank-treasury/balances` }),
        providesTags: ["Admin"],
      }),
      getBankTreasuryTransactions: build.query<
        GetBankTreasuryTransactionsApiResponse,
        GetBankTreasuryTransactionsApiArg
      >({
        query: (queryArg) => ({
          url: `/user-service/admin/bank-treasury/transactions`,
          params: {
            pageIndex: queryArg.pageIndex,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Admin"],
      }),
      getUserById1: build.query<GetUserById1ApiResponse, GetUserById1ApiArg>({
        query: (queryArg) => ({
          url: `/user-service/internal/users/${queryArg.id}`,
          headers: {
            "X-API-KEY": queryArg["X-API-KEY"],
          },
        }),
        providesTags: ["Users Internal"],
      }),
      getUser: build.query<GetUserApiResponse, GetUserApiArg>({
        query: () => ({ url: `/user-service/account` }),
        providesTags: ["Account"],
      }),
      withdrawMoney: build.mutation<
        WithdrawMoneyApiResponse,
        WithdrawMoneyApiArg
      >({
        query: (queryArg) => ({
          url: `/core-api/transactions/withdraw`,
          method: "POST",
          body: queryArg.withdrawDto,
        }),
        invalidatesTags: ["transaction-operation-controller"],
      }),
      enrollMoney: build.mutation<EnrollMoneyApiResponse, EnrollMoneyApiArg>({
        query: (queryArg) => ({
          url: `/core-api/transactions/enroll`,
          method: "POST",
          body: queryArg.enrollDto,
        }),
        invalidatesTags: ["transaction-operation-controller"],
      }),
      transferMoney: build.mutation<
        TransferMoneyApiResponse,
        TransferMoneyApiArg
      >({
        query: (queryArg) => ({
          url: `/core-api/transactions/transfer`,
          method: "POST",
          body: queryArg.transferMoneyDto,
        }),
        invalidatesTags: ["transaction-operation-controller"],
      }),
      openAccount: build.mutation<OpenAccountApiResponse, OpenAccountApiArg>({
        query: (queryArg) => ({
          url: `/core-api/cardaccount/open/${queryArg.userId}`,
          method: "POST",
          body: queryArg.cardAccountCreateModelDto,
        }),
        invalidatesTags: ["card-account-controller"],
      }),
      closeAccount: build.mutation<CloseAccountApiResponse, CloseAccountApiArg>(
        {
          query: (queryArg) => ({
            url: `/core-api/cardaccount/close/${queryArg.accountId}`,
            method: "POST",
          }),
          invalidatesTags: ["card-account-controller"],
        },
      ),
      setMainAccount: build.mutation<
        SetMainAccountApiResponse,
        SetMainAccountApiArg
      >({
        query: (queryArg) => ({
          url: `/core-api/cardaccount/${queryArg.accountId}/set-main`,
          method: "POST",
        }),
        invalidatesTags: ["card-account-controller"],
      }),
      getTransactionOperations: build.query<
        GetTransactionOperationsApiResponse,
        GetTransactionOperationsApiArg
      >({
        query: (queryArg) => ({
          url: `/core-api/transactions/${queryArg.accountId}`,
          params: {
            pageIndex: queryArg.pageIndex,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["transaction-operation-controller"],
      }),
      getUserCardAccount: build.query<
        GetUserCardAccountApiResponse,
        GetUserCardAccountApiArg
      >({
        query: (queryArg) => ({
          url: `/core-api/cardaccount/${queryArg.accountId}`,
        }),
        providesTags: ["card-account-controller"],
      }),
      checkAccountExists: build.query<
        CheckAccountExistsApiResponse,
        CheckAccountExistsApiArg
      >({
        query: (queryArg) => ({
          url: `/core-api/cardaccount/exists/${queryArg.accountId}`,
        }),
        providesTags: ["card-account-controller"],
      }),
      getUserCardAccounts: build.query<
        GetUserCardAccountsApiResponse,
        GetUserCardAccountsApiArg
      >({
        query: (queryArg) => ({
          url: `/core-api/cardaccount/all/${queryArg.userId}`,
          params: {
            pageIndex: queryArg.pageIndex,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["card-account-controller"],
      }),
      editCreditRule: build.mutation<
        EditCreditRuleApiResponse,
        EditCreditRuleApiArg
      >({
        query: (queryArg) => ({
          url: `/credit-service/credit_rule/${queryArg.creditRuleId}/edit`,
          method: "PUT",
          body: queryArg.creditRuleDto,
        }),
        invalidatesTags: ["credit-rule-controller"],
      }),
      createCreditRule: build.mutation<
        CreateCreditRuleApiResponse,
        CreateCreditRuleApiArg
      >({
        query: (queryArg) => ({
          url: `/credit-service/credit_rule/create`,
          method: "POST",
          body: queryArg.creditRuleDto,
        }),
        invalidatesTags: ["credit-rule-controller"],
      }),
      makeEnrollment: build.mutation<
        MakeEnrollmentApiResponse,
        MakeEnrollmentApiArg
      >({
        query: (queryArg) => ({
          url: `/credit-service/credit/${queryArg.cardAccountId}/enrollment`,
          method: "POST",
          params: {
            money: queryArg.money,
          },
        }),
        invalidatesTags: ["credit-controller"],
      }),
      createCredit: build.mutation<CreateCreditApiResponse, CreateCreditApiArg>(
        {
          query: (queryArg) => ({
            url: `/credit-service/credit/create`,
            method: "POST",
            body: queryArg.creditCreateModelDto,
          }),
          invalidatesTags: ["credit-controller"],
        },
      ),
      getCreditRuleById: build.query<
        GetCreditRuleByIdApiResponse,
        GetCreditRuleByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/credit-service/credit_rule/${queryArg.creditRuleId}/get_by_id`,
        }),
        providesTags: ["credit-rule-controller"],
      }),
      getAllCreditRules: build.query<
        GetAllCreditRulesApiResponse,
        GetAllCreditRulesApiArg
      >({
        query: () => ({ url: `/credit-service/credit_rule/get_all` }),
        providesTags: ["credit-rule-controller"],
      }),
      getByUserId: build.query<GetByUserIdApiResponse, GetByUserIdApiArg>({
        query: (queryArg) => ({
          url: `/credit-service/credit/${queryArg.userId}/get_by_user_id`,
        }),
        providesTags: ["credit-controller"],
      }),
      getByCardAccountId: build.query<
        GetByCardAccountIdApiResponse,
        GetByCardAccountIdApiArg
      >({
        query: (queryArg) => ({
          url: `/credit-service/credit/${queryArg.cardAccountId}/get_by_card_account`,
        }),
        providesTags: ["credit-controller"],
      }),
      deleteCreditRule: build.mutation<
        DeleteCreditRuleApiResponse,
        DeleteCreditRuleApiArg
      >({
        query: (queryArg) => ({
          url: `/credit-service/credit_rule/${queryArg.creditRuleId}/delete`,
          method: "DELETE",
        }),
        invalidatesTags: ["credit-rule-controller"],
      }),
      deleteCredit: build.mutation<DeleteCreditApiResponse, DeleteCreditApiArg>(
        {
          query: (queryArg) => ({
            url: `/credit-service/credit/${queryArg.creditId}/delete`,
            method: "DELETE",
          }),
          invalidatesTags: ["credit-controller"],
        },
      ),
      getPreferences: build.query<
        GetPreferencesApiResponse,
        GetPreferencesApiArg
      >({
        query: () => ({ url: `/preferences-service/preferences` }),
        providesTags: ["preferences-controller"],
      }),
      updatePreferences: build.mutation<
        UpdatePreferencesApiResponse,
        UpdatePreferencesApiArg
      >({
        query: (queryArg) => ({
          url: `/preferences-service/preferences`,
          method: "PUT",
          body: queryArg.userPreferencesDto,
        }),
        invalidatesTags: ["preferences-controller"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedPublicApi };
export type EditUserApiResponse = unknown;
export type EditUserApiArg = {
  id: string;
  userEditModelDto: UserEditModelDto;
};
export type EditUser1ApiResponse = unknown;
export type EditUser1ApiArg = {
  userEditModelDto: UserEditModelDto;
};
export type GetAllUsersApiResponse = /** status 200 OK */ UserDto[];
export type GetAllUsersApiArg = void;
export type GetUsersDirectoryApiResponse =
  /** status 200 OK */ UserDirectoryEntryDto[];
export type GetUsersDirectoryApiArg = void;
export type GetUserByIdApiResponse = /** status 200 OK */ UserDto;
export type GetUserByIdApiArg = {
  id: string;
};
export type DeleteUserByIdApiResponse = unknown;
export type DeleteUserByIdApiArg = {
  id: string;
};
export type IsUserActiveByIdApiResponse = /** status 200 OK */ boolean;
export type IsUserActiveByIdApiArg = {
  id: string;
};
export type GetBankTreasuryBalancesApiResponse =
  /** status 200 OK */ BankTreasuryBalancesDto;
export type GetBankTreasuryBalancesApiArg = void;
export type GetBankTreasuryTransactionsApiResponse =
  /** status 200 OK */ PageTransactionOperation;
export type GetBankTreasuryTransactionsApiArg = {
  pageIndex?: number;
  pageSize?: number;
};
export type GetUserById1ApiResponse = /** status 200 OK */ UserDto;
export type GetUserById1ApiArg = {
  id: string;
  "X-API-KEY": string;
};
export type GetUserApiResponse = /** status 200 OK */ UserDto;
export type GetUserApiArg = void;
export type WithdrawMoneyApiResponse = unknown;
export type WithdrawMoneyApiArg = {
  withdrawDto: WithdrawDto;
};
export type EnrollMoneyApiResponse = unknown;
export type EnrollMoneyApiArg = {
  enrollDto: EnrollDto;
};
export type TransferMoneyApiResponse = unknown;
export type TransferMoneyApiArg = {
  transferMoneyDto: TransferMoneyDto;
};
export type OpenAccountApiResponse = /** status 200 OK */ CardAccount;
export type OpenAccountApiArg = {
  userId: string;
  cardAccountCreateModelDto: CardAccountCreateModelDto;
};
export type CloseAccountApiResponse = /** status 200 OK */ boolean;
export type CloseAccountApiArg = {
  accountId: string;
};
export type SetMainAccountApiResponse = /** status 200 OK */ CardAccount;
export type SetMainAccountApiArg = {
  accountId: string;
};
export type GetTransactionOperationsApiResponse =
  /** status 200 OK */ PageTransactionOperation;
export type GetTransactionOperationsApiArg = {
  accountId: string;
  pageIndex?: number;
  pageSize?: number;
};
export type GetUserCardAccountApiResponse = /** status 200 OK */ CardAccount;
export type GetUserCardAccountApiArg = {
  accountId: string;
};
export type CheckAccountExistsApiResponse = /** status 200 OK */ boolean;
export type CheckAccountExistsApiArg = {
  accountId: string;
};
export type GetUserCardAccountsApiResponse =
  /** status 200 OK */ PageCardAccount;
export type GetUserCardAccountsApiArg = {
  userId: string;
  pageIndex?: number;
  pageSize?: number;
};
export type EditCreditRuleApiResponse = /** status 200 OK */ CreditRule;
export type EditCreditRuleApiArg = {
  creditRuleId: string;
  creditRuleDto: CreditRuleDto;
};
export type CreateCreditRuleApiResponse = /** status 200 OK */ CreditRule;
export type CreateCreditRuleApiArg = {
  creditRuleDto: CreditRuleDto;
};
export type MakeEnrollmentApiResponse = /** status 200 OK */ Credit;
export type MakeEnrollmentApiArg = {
  cardAccountId: string;
  money: number;
};
export type CreateCreditApiResponse = /** status 200 OK */ Credit;
export type CreateCreditApiArg = {
  creditCreateModelDto: CreditCreateModelDto;
};
export type GetCreditRuleByIdApiResponse = /** status 200 OK */ CreditRule;
export type GetCreditRuleByIdApiArg = {
  creditRuleId: string;
};
export type GetAllCreditRulesApiResponse = /** status 200 OK */ CreditRule[];
export type GetAllCreditRulesApiArg = void;
export type GetByUserIdApiResponse = /** status 200 OK */ Credit[];
export type GetByUserIdApiArg = {
  userId: string;
};
export type GetByCardAccountIdApiResponse = /** status 200 OK */ Credit;
export type GetByCardAccountIdApiArg = {
  cardAccountId: string;
};
export type DeleteCreditRuleApiResponse = unknown;
export type DeleteCreditRuleApiArg = {
  creditRuleId: string;
};
export type DeleteCreditApiResponse = unknown;
export type DeleteCreditApiArg = {
  creditId: string;
};
export type GetPreferencesApiResponse = /** status 200 OK */ UserPreferencesDto;
export type GetPreferencesApiArg = void;
export type UpdatePreferencesApiResponse =
  /** status 200 OK */ UserPreferencesDto;
export type UpdatePreferencesApiArg = {
  userPreferencesDto: UserPreferencesDto;
};
export type BffErrorBody = {
  message?: string;
  code?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};
export type UserEditModelDto = {
  name: string;
  /** Новый набор ролей. Пустой массив снимает все роли (пользователь может остаться без ролей). Несколько ролей одновременно допустимы (например CLIENT и WORKER).
   */
  newRoles?: ("CLIENT" | "WORKER")[];
  /** При указании — выставить флаг активности пользователя (доступ / блокировка).
   */
  active?: boolean;
};
export type UserDto = {
  id: string;
  name: string;
  email: string;
  /** Роли пользователя. Может быть пустым: у пользователя может не быть ни одной роли. Значения CLIENT и WORKER не взаимоисключающие — допустимы оба одновременно.
   */
  roles?: ("CLIENT" | "WORKER" | "BLOCKED_CLIENT" | "BLOCKED_WORKER")[];
  active?: boolean;
};
export type Currency = "DOLLAR" | "EURO" | "RUBLE";
export type UserDirectoryEntryDto = {
  userId: string;
  username: string;
  mainAccountCurrency: Currency;
};
export type MoneyValueDto = {
  value?: number;
  currency?: Currency;
};
export type BankTreasuryBalanceItem = {
  cardAccountId: string;
  balance: MoneyValueDto;
};
export type BankTreasuryBalancesDto = {
  accounts: BankTreasuryBalanceItem[];
};
export type TransactionOperation = {
  id?: string;
  cardAccountId?: string;
  dateTime?: string;
  transactionType?: "WITHDRAWAL" | "ENROLLMENT";
  transactionActoin?: string;
  transactionStatus?: "COMPLETE" | "IN_PROGRESS" | "DECLINED";
  money?: MoneyValueDto;
};
export type SortObject = {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
};
export type PageableObject = {
  offset?: number;
  sort?: SortObject;
  paged?: boolean;
  unpaged?: boolean;
  pageNumber?: number;
  pageSize?: number;
};
export type PageTransactionOperation = {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: TransactionOperation[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  pageable?: PageableObject;
  empty?: boolean;
};
export type WithdrawDto = {
  cardAccountId?: string;
  sum?: number;
  destination?: string;
};
export type EnrollDto = {
  cardAccountId?: string;
  money?: MoneyValueDto;
  destination?: string;
};
export type TransferMoneyDto = {
  /** Счёт списания; null — зачисление только с внешнего источника */
  fromCardAccountId?: string | null;
  /** Сумма в валюте amountCurrency */
  amount: number;
  amountCurrency: Currency;
  /** Тип получателя */
  targetKind: "ACCOUNT" | "CREDIT";
  /** Обязателен при targetKind=ACCOUNT */
  targetCardAccountId?: string | null;
  /** Обязателен при targetKind=CREDIT */
  targetCreditId?: string | null;
};
export type CardAccount = {
  id?: string;
  userId?: string;
  /** Отображаемое имя счёта */
  name?: string;
  /** Главный счёт пользователя */
  main?: boolean;
  /** Видимость в списках (false = hidden) */
  visible?: boolean;
  money?: MoneyValueDto;
  deleted?: boolean;
  transactionOperations?: TransactionOperation[];
};
export type CardAccountCreateModelDto = {
  name?: string;
  currency?: Currency;
};
export type PageCardAccount = {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: CardAccount[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  pageable?: PageableObject;
  empty?: boolean;
};
export type CreditRule = {
  id?: string;
  percentageStrategy?: "FROM_REMAINING_DEBT" | "FROM_TOTAL_DEBT";
  collectionPeriodSeconds?: number;
  openingDate?: string;
  ruleName?: string;
  percentage?: number;
};
export type CreditRuleDto = {
  percentageStrategy?: "FROM_REMAINING_DEBT" | "FROM_TOTAL_DEBT";
  collectionPeriodSeconds?: number;
  openingDate?: string;
  ruleName?: string;
  percentage?: number;
};
export type Credit = {
  id?: string;
  userId?: string;
  cardAccount?: string;
  lastInterestUpdate?: string;
  currentDebtSum?: number;
  initialDebt?: number;
  interestDebtSum?: number;
  currency?: Currency;
  creditRule?: CreditRule;
};
export type CreditCreateModelDto = {
  userId?: string;
  cardAccount?: string;
  creditRuleId?: string;
  money?: MoneyValueDto;
};
export type UserPreferencesDto = {
  theme?: "light" | "dark";
  hiddenAccounts?: string[];
};
export const {
  useEditUserMutation,
  useEditUser1Mutation,
  useGetAllUsersQuery,
  useGetUsersDirectoryQuery,
  useGetUserByIdQuery,
  useDeleteUserByIdMutation,
  useIsUserActiveByIdQuery,
  useGetBankTreasuryBalancesQuery,
  useGetBankTreasuryTransactionsQuery,
  useGetUserById1Query,
  useGetUserQuery,
  useWithdrawMoneyMutation,
  useEnrollMoneyMutation,
  useTransferMoneyMutation,
  useOpenAccountMutation,
  useCloseAccountMutation,
  useSetMainAccountMutation,
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
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
} = injectedRtkApi;

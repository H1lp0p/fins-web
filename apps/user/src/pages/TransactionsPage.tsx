import type { CardAccountEntity, TransferDestinationUser } from "@fins/api";
import {
  mapUserDirectoryEntryFromDto,
  useGetByUserIdQuery,
  useGetUserCardAccountsQuery,
  useGetUsersDirectoryQuery,
  useGetUserQuery,
  useTransferMoneyMutation,
  useWithdrawMoneyMutation,
} from "@fins/api";
import { TriColSpaceLayout, useMessageStack } from "@fins/ui-kit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AccountGrid } from "../features/account-grid/AccountGrid";
import { RequireSession } from "../features/require-session/RequireSession";
import { TransactionDestinationResults } from "../features/transaction-destination-results";
import {
  TransactionDestinationSearch,
  destinationTabFromToType,
  type TransactionDestinationTabId,
} from "../features/transaction-destination-search";
import { TransactionFromTopSlot } from "../features/transaction-from-top-slot";
import {
  TransactionTransferForm,
  TransactionTransferTopBar,
  buildTransactionDestinationToken,
} from "../features/transaction-transfer-form";
import { mockRateFromTo } from "../shared/lib/mock-exchange-rates";
import { parseAmountInput } from "../shared/lib/parse-amount-input";
import { parseTransactionsSearchParams } from "../shared/lib/transactions-endpoint";
import { sortAccountsForIndex } from "../shared/lib/sort-accounts-for-index";
import { currencyCodeToAmountSymbol } from "../shared/lib/currency-symbol";
import {
  currencyCodeFromTransactionIndex,
  symbolIndexInTransactionCurrencies,
} from "../shared/lib/transaction-currencies";

function TransactionsContent() {
  const location = useLocation();
  const { pushMessage } = useMessageStack();
  const { data: user } = useGetUserQuery();
  const userId = user?.id ?? "";

  const { data: accountsPage, refetch: refetchAccounts } =
    useGetUserCardAccountsQuery(
    { userId, pageIndex: 0, pageSize: 100 },
    { skip: !userId },
  );
  const accounts = useMemo(
    () =>
      sortAccountsForIndex((accountsPage?.content ?? []) as CardAccountEntity[]),
    [accountsPage?.content],
  );

  const { data: credits = [], refetch: refetchCredits } = useGetByUserIdQuery(
    { userId },
    { skip: !userId },
  );

  const [transferMoney, { isLoading: transferLoading }] =
    useTransferMoneyMutation();
  const [withdrawMoney, { isLoading: withdrawLoading }] =
    useWithdrawMoneyMutation();

  const { data: directoryRaw = [] } = useGetUsersDirectoryQuery(undefined, {
    skip: !userId,
  });
  const users: TransferDestinationUser[] = useMemo(
    () => directoryRaw.map(mapUserDirectoryEntryFromDto),
    [directoryRaw],
  );

  const [fromSelectedAccountId, setFromSelectedAccountId] = useState<
    string | null
  >(null);
  const [leftCurrencyIndex, setLeftCurrencyIndex] = useState(0);

  const [destinationTabId, setDestinationTabId] =
    useState<TransactionDestinationTabId>("accounts");
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [rightCurrencyIndex, setRightCurrencyIndex] = useState(0);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(
    null,
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [transferAmount, setTransferAmount] = useState("");

  const appliedSearchKey = useRef<string | null>(null);

  useEffect(() => {
    const parsedNow = parseTransactionsSearchParams(
      new URLSearchParams(location.search),
    );
    const isNewSearch = appliedSearchKey.current !== location.search;
    if (isNewSearch) {
      appliedSearchKey.current = location.search;
    }

    if (isNewSearch) {
      if (parsedNow.from) {
        const ok = accounts.some((a) => a.id === parsedNow.from!.id);
        setFromSelectedAccountId(ok ? parsedNow.from!.id : null);
      }

      if (parsedNow.to) {
        const t = parsedNow.to;
        setDestinationTabId(destinationTabFromToType(t.type));
        setSelectedAccountId(null);
        setSelectedCreditId(null);
        setSelectedUserId(null);
        setSearchDraft("");
        setAppliedQuery("");

        switch (t.type) {
          case "Account": {
            const ok = accounts.some((a) => a.id === t.id);
            setSelectedAccountId(ok ? t.id : null);
            break;
          }
          case "Credit": {
            const ok = credits.some((c) => c.id === t.id);
            setSelectedCreditId(ok ? t.id : null);
            break;
          }
          case "User": {
            const ok = users.some((u) => u.id === t.id);
            setSelectedUserId(ok ? t.id : null);
            break;
          }
          case "Other service":
            setRightCurrencyIndex(symbolIndexInTransactionCurrencies(t.id));
            break;
          default:
            break;
        }
      } else {
        setDestinationTabId("accounts");
        setSelectedAccountId(null);
        setSelectedCreditId(null);
        setSelectedUserId(null);
        setRightCurrencyIndex(0);
        setSearchDraft("");
        setAppliedQuery("");
      }
      return;
    }

    if (parsedNow.from?.id) {
      const ok = accounts.some((a) => a.id === parsedNow.from!.id);
      if (ok) {
        setFromSelectedAccountId((prev) => prev ?? parsedNow.from!.id);
      }
    }

    if (!parsedNow.to) return;

    switch (parsedNow.to.type) {
      case "Account": {
        const id = parsedNow.to.id;
        const ok = accounts.some((a) => a.id === id);
        if (ok) {
          setSelectedAccountId((prev) => (prev == null ? id : prev));
        }
        break;
      }
      case "Credit": {
        const id = parsedNow.to.id;
        const ok = credits.some((c) => c.id === id);
        if (ok) {
          setSelectedCreditId((prev) => (prev == null ? id : prev));
        }
        break;
      }
      case "User": {
        const id = parsedNow.to.id;
        const ok = users.some((u) => u.id === id);
        if (ok) {
          setSelectedUserId((prev) => (prev == null ? id : prev));
        }
        break;
      }
      default:
        break;
    }
  }, [location.search, accounts, credits, users]);

  const selectedFromAccount =
    accounts.find((a) => a.id === fromSelectedAccountId) ?? null;
  const fromTopMode =
    fromSelectedAccountId && selectedFromAccount ? "account" : "other-service";

  const fromReady =
    (fromTopMode === "account" &&
      fromSelectedAccountId != null &&
      selectedFromAccount != null) ||
    fromTopMode === "other-service";

  const toReady =
    (destinationTabId === "accounts" && selectedAccountId != null) ||
    (destinationTabId === "credits" && selectedCreditId != null) ||
    (destinationTabId === "users" && selectedUserId != null) ||
    destinationTabId === "other-service";

  const fromCurrencyCode = useMemo(() => {
    if (fromTopMode === "account") {
      return selectedFromAccount?.money?.currency;
    }
    return currencyCodeFromTransactionIndex(leftCurrencyIndex);
  }, [fromTopMode, selectedFromAccount, leftCurrencyIndex]);

  const toCurrencyCode = useMemo(() => {
    switch (destinationTabId) {
      case "accounts": {
        const acc = accounts.find((a) => a.id === selectedAccountId);
        return acc?.money?.currency;
      }
      case "credits": {
        const c = credits.find((x) => x.id === selectedCreditId);
        return c?.currency;
      }
      case "users": {
        const u = users.find((x) => x.id === selectedUserId);
        return u?.mainAccountCurrency;
      }
      case "other-service":
        return currencyCodeFromTransactionIndex(rightCurrencyIndex);
      default:
        return undefined;
    }
  }, [
    destinationTabId,
    accounts,
    selectedAccountId,
    credits,
    selectedCreditId,
    selectedUserId,
    users,
    rightCurrencyIndex,
  ]);

  const transferFormVisible =
    fromReady &&
    toReady &&
    fromCurrencyCode !== undefined &&
    toCurrencyCode !== undefined;

  const rateToPerFrom = useMemo(
    () =>
      fromCurrencyCode && toCurrencyCode
        ? mockRateFromTo(fromCurrencyCode, toCurrencyCode)
        : 1,
    [fromCurrencyCode, toCurrencyCode],
  );

  const parsedTransferAmount = parseAmountInput(transferAmount);
  const maxFromBalance =
    fromTopMode === "account" && selectedFromAccount?.money?.value != null
      ? selectedFromAccount.money.value
      : null;
  const withinBalance =
    maxFromBalance == null ||
    parsedTransferAmount == null ||
    parsedTransferAmount <= maxFromBalance;

  const amountFieldValid =
    transferAmount.trim() === "" ||
    (parsedTransferAmount != null && withinBalance);

  const resultInToCurrency =
    parsedTransferAmount != null ? parsedTransferAmount * rateToPerFrom : 0;

  const canSubmitTransfer =
    transferFormVisible &&
    parsedTransferAmount != null &&
    withinBalance;

  const fromSymbol = currencyCodeToAmountSymbol(fromCurrencyCode);
  const toSymbol = currencyCodeToAmountSymbol(toCurrencyCode);

  const executeTransfer = useCallback(async () => {
    if (!canSubmitTransfer || !fromCurrencyCode || !toCurrencyCode) return;

    const destination = buildTransactionDestinationToken(destinationTabId, {
      selectedAccountId,
      selectedCreditId,
      selectedUserId,
      rightCurrencyIndex,
      users,
    });

    try {
      if (
        destinationTabId === "accounts" ||
        destinationTabId === "credits"
      ) {
        await transferMoney({
          transferMoneyDto: {
            fromCardAccountId:
              fromTopMode === "account" ? fromSelectedAccountId : null,
            amount: parsedTransferAmount!,
            amountCurrency: fromCurrencyCode,
            targetKind:
              destinationTabId === "credits" ? "CREDIT" : "ACCOUNT",
            targetCardAccountId:
              destinationTabId === "accounts" ? selectedAccountId : null,
            targetCreditId:
              destinationTabId === "credits" ? selectedCreditId : null,
          },
        }).unwrap();
      } else if (fromTopMode === "account" && fromSelectedAccountId) {
        await withdrawMoney({
          withdrawDto: {
            cardAccountId: fromSelectedAccountId,
            sum: parsedTransferAmount!,
            destination,
          },
        }).unwrap();
      } else {
        pushMessage({
          type: "error",
          title: "Transfer",
          text:
            "Для выбранной пары источник/получатель используйте счёт или обратитесь к поддержке.",
        });
        return;
      }

      pushMessage({
        type: "success",
        title: "Transfer",
        text: "Операция отправлена.",
      });
      setTransferAmount("");
      void refetchAccounts();
      void refetchCredits();
    } catch {
      pushMessage({
        type: "error",
        title: "Transfer",
        text: "Не удалось выполнить операцию.",
      });
    }
  }, [
    canSubmitTransfer,
    fromCurrencyCode,
    toCurrencyCode,
    destinationTabId,
    selectedAccountId,
    selectedCreditId,
    selectedUserId,
    rightCurrencyIndex,
    users,
    fromTopMode,
    fromSelectedAccountId,
    parsedTransferAmount,
    transferMoney,
    withdrawMoney,
    credits,
    pushMessage,
    refetchAccounts,
    refetchCredits,
  ]);

  const cycleLeft = useCallback(() => {
    setLeftCurrencyIndex((i) => i + 1);
  }, []);

  const cycleRight = useCallback(() => {
    setRightCurrencyIndex((i) => i + 1);
  }, []);

  const resetFromAccount = useCallback(() => {
    setFromSelectedAccountId(null);
  }, []);

  const onDestinationTabChange = useCallback(
    (id: TransactionDestinationTabId) => {
      setDestinationTabId(id);
      setSearchDraft("");
      setAppliedQuery("");
    },
    [],
  );

  const applySearch = useCallback(() => {
    setAppliedQuery(searchDraft.trim());
  }, [searchDraft]);

  const resetFromOtherService = useCallback(() => {
    setDestinationTabId("accounts");
    setRightCurrencyIndex(0);
    setSearchDraft("");
    setAppliedQuery("");
  }, []);

  const topCenterContent = (
    <TransactionTransferTopBar
      disabled={!canSubmitTransfer}
      loading={transferLoading || withdrawLoading}
      onTransfer={() => void executeTransfer()}
    />
  );

  const bottomCenterContent =
    transferFormVisible && fromCurrencyCode && toCurrencyCode ? (
      <TransactionTransferForm
        amount={transferAmount}
        onAmountChange={setTransferAmount}
        amountValid={amountFieldValid}
        fromTrailingChar={fromSymbol}
        toSymbol={toSymbol}
        rateToPerFrom={rateToPerFrom}
        resultAmount={resultInToCurrency}
      />
    ) : undefined;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "calc(100vh - 5rem)",
      }}
    >
      <TriColSpaceLayout
        topLeftContent={
          <TransactionFromTopSlot
            mode={fromTopMode}
            account={selectedFromAccount}
            leftCurrencyIndex={leftCurrencyIndex}
            onCycleLeftCurrency={cycleLeft}
            onResetAccount={resetFromAccount}
          />
        }
        bottomLeftContent={
          <AccountGrid
            accounts={accounts}
            selectedId={fromSelectedAccountId}
            onSelectAccount={setFromSelectedAccountId}
          />
        }
        topCenterContent={topCenterContent}
        bottomCenterContent={bottomCenterContent}
        topRightContent={
          <TransactionDestinationSearch
            activeTabId={destinationTabId}
            onTabChange={onDestinationTabChange}
            searchDraft={searchDraft}
            onSearchDraftChange={setSearchDraft}
            onApplySearch={applySearch}
            otherCurrencyIndex={rightCurrencyIndex}
            onCycleOtherCurrency={cycleRight}
            onResetFromOtherService={resetFromOtherService}
          />
        }
        bottomRightContent={
          <TransactionDestinationResults
            tabId={destinationTabId}
            appliedQuery={appliedQuery}
            accounts={accounts}
            credits={credits}
            users={users}
            selectedAccountId={selectedAccountId}
            selectedCreditId={selectedCreditId}
            selectedUserId={selectedUserId}
            onSelectAccount={setSelectedAccountId}
            onSelectCredit={setSelectedCreditId}
            onSelectUser={setSelectedUserId}
          />
        }
      />
    </div>
  );
}

export function TransactionsPage() {
  return (
    <RequireSession>
      <TransactionsContent />
    </RequireSession>
  );
}

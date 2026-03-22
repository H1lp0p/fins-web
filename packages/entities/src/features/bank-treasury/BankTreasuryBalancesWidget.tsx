import type { Money } from "@fins/api";
import {
  mapMoneyFromDto,
  useGetBankTreasuryBalancesQuery,
  useGetUserQuery,
} from "@fins/api";
import { AmountWithSymbol, useMessageStack } from "@fins/ui-kit";
import { useEffect, useRef } from "react";
import { currencyCodeToAmountSymbol } from "../../lib/currency-symbol";

const emptySlot = (
  <div className="ph-mid pv-mid" style={{ minHeight: "4rem" }} />
);

export function BankTreasuryBalancesWidget() {
  const { pushMessage } = useMessageStack();
  const notWorkerNotified = useRef(false);
  const loadFailureNotified = useRef(false);

  const { data: user } = useGetUserQuery();
  const isWorker = user?.roles?.includes("WORKER") ?? false;
  const { data, isLoading, isError } = useGetBankTreasuryBalancesQuery(
    undefined,
    { skip: !isWorker },
  );

  useEffect(() => {
    if (isWorker) {
      notWorkerNotified.current = false;
      return;
    }
    if (!notWorkerNotified.current) {
      notWorkerNotified.current = true;
      pushMessage({
        type: "info",
        title: "Bank treasury",
        text: "User is not a worker",
      });
    }
  }, [isWorker, pushMessage]);

  useEffect(() => {
    if (!isWorker || isLoading) return;
    const failed = isError || !data?.accounts?.length;
    if (failed) {
      if (!loadFailureNotified.current) {
        loadFailureNotified.current = true;
        pushMessage({
          type: "error",
          title: "Bank balances",
          text: isError
            ? "Failed to load bank treasury balances."
            : "No treasury accounts returned.",
        });
      }
    } else {
      loadFailureNotified.current = false;
    }
  }, [isWorker, isLoading, isError, data, pushMessage]);

  if (!isWorker) {
    return emptySlot;
  }

  if (isLoading) {
    return (
      <div className="ph-mid pv-mid">
        <span className="text-info color-input-placeholder">…</span>
      </div>
    );
  }

  if (isError || !data?.accounts?.length) {
    return emptySlot;
  }

  const rows = data.accounts
    .map((item) => mapMoneyFromDto(item.balance))
    .filter((m): m is Money => m != null);

  return (
    <div
      className="ph-min pv-min gap-mid color-info"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <h3
        className="text-title color-info"
        style={{ margin: 0, textAlign: "center" }}
      >
        Bank account
      </h3>
      <div
        className="gap-min text-info"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {rows.map((money, i) => (
          <AmountWithSymbol
            key={`${money.currency}-${i}`}
            amount={money.value}
            symbol={currencyCodeToAmountSymbol(money.currency)}
            style={{ justifyContent: "center" }}
          />
        ))}
      </div>
    </div>
  );
}

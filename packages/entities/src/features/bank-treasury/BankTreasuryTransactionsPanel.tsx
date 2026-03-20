import type { TransactionOperationEntity } from "@fins/api";
import {
  useGetBankTreasuryTransactionsQuery,
  useGetUserQuery,
} from "@fins/api";
import {
  CenteredPlaceholder,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
  useMessageStack,
} from "@fins/ui-kit";
import { useEffect, useRef } from "react";
import { TransactionHistoryItem } from "../../entities/transaction";

const listShellStyle = {
  flex: 1,
  overflow: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  minHeight: 0,
};

const centeredFlex = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

export function BankTreasuryTransactionsPanel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pushMessage } = useMessageStack();
  const notWorkerNotified = useRef(false);
  const loadErrorNotified = useRef(false);

  const { data: user } = useGetUserQuery();
  const isWorker = user?.roles?.includes("WORKER") ?? false;
  const { data, isLoading, isError } = useGetBankTreasuryTransactionsQuery(
    { pageIndex: 0, pageSize: 50 },
    { skip: !isWorker },
  );

  const items = data?.content ?? [];
  const newestFirst = [...items].reverse();

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
    if (isError) {
      if (!loadErrorNotified.current) {
        loadErrorNotified.current = true;
        pushMessage({
          type: "error",
          title: "Transactions",
          text: "Failed to load bank treasury transactions.",
        });
      }
    } else {
      loadErrorNotified.current = false;
    }
  }, [isWorker, isLoading, isError, pushMessage]);

  if (!isWorker) {
    return (
      <div
        className="pv-mid color-info gap-mid"
        style={{
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
        }}
      />
    );
  }

  return (
    <div
      className="pv-mid color-info gap-mid"
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        className="ph-mid"
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <OnBlurContainer
          className="ph-mid pv-mid"
          style={{
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <LinkButton
            text="Full up"
            variant="success"
            textClassName="text-info"
            onClick={() => {
              const el = scrollRef.current;
              if (el) el.scrollTop = 0;
            }}
          />
        </OnBlurContainer>
      </div>
      <div className="ph-mid gap-mid rounded" ref={scrollRef} style={listShellStyle}>
        {isLoading ? (
          <div style={centeredFlex}>
            <LoadingFrameIndicator />
          </div>
        ) : isError ? (
          <CenteredPlaceholder text="treasuryTransactionsQuery.status === 'rejected'" />
        ) : newestFirst.length === 0 ? (
          <CenteredPlaceholder text="operations.length === 0" />
        ) : (
          newestFirst.map((op, idx) => (
            <TransactionHistoryItem
              key={op.id ?? String(idx)}
              operation={op as TransactionOperationEntity}
            />
          ))
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <OnBlurContainer
          className="ph-mid pv-mid"
          style={{
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <LinkButton
            text="Full down"
            variant="success"
            textClassName="text-info"
            onClick={() => {
              const el = scrollRef.current;
              if (el) el.scrollTop = el.scrollHeight;
            }}
          />
        </OnBlurContainer>
      </div>
    </div>
  );
}

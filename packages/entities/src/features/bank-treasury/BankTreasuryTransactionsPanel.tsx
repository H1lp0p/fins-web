import type { TransactionOperationEntity } from "@fins/api";
import {
  useGetBankTreasuryTransactionsQuery,
  useGetUserQuery,
} from "@fins/api";
import { LinkButton, OnBlurContainer, useMessageStack } from "@fins/ui-kit";
import { useEffect, useRef } from "react";
import { TransactionHistoryItem } from "../../entities/transaction";

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
      <div
        className="ph-mid gap-mid rounded"
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {isLoading ? (
          <span className="text-info color-input-placeholder">…</span>
        ) : isError ? (
          <span className="text-info color-input-placeholder">—</span>
        ) : newestFirst.length === 0 ? (
          <span className="text-info color-input-placeholder">Нет операций</span>
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

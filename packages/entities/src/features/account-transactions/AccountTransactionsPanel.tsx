import type { TransactionOperation, TransactionOperationEntity } from "@fins/api";
import { mapTransactionOperationFromDto } from "@fins/api";
import { useTransactionsWebSocket } from "@fins/api/ws";
import {
  CenteredPlaceholder,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
} from "@fins/ui-kit";
import { useEffect, useRef, useState } from "react";
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

type AccountTransactionsPanelProps = {
  accountId: string;
};

export function AccountTransactionsPanel({
  accountId,
}: AccountTransactionsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<TransactionOperationEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems([]);
    setLoading(true);
    setErrorMessage(null);
  }, [accountId]);

  useTransactionsWebSocket({
    accountId,
    pageIndex: 0,
    pageSize: 50,
    onMessage: (msg) => {
      if (msg.type === "snapshot") {
        const raw = msg.page.content ?? [];
        setItems(
          raw.map((op) =>
            mapTransactionOperationFromDto(op as TransactionOperation),
          ),
        );
        setLoading(false);
        setErrorMessage(null);
        return;
      }
      if (msg.type === "transaction") {
        setItems((prev) => {
          const mapped = mapTransactionOperationFromDto(
            msg.operation as TransactionOperation,
          );
          const idx = prev.findIndex((x) => x.id === mapped.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = mapped;
            return next;
          }
          return [...prev, mapped];
        });
        return;
      }
      if (msg.type === "error") {
        setErrorMessage(msg.message);
        setLoading(false);
      }
    },
  });

  const newestFirst = [...items].reverse();

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
            width: "100%",
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
        {loading ? (
          <div style={centeredFlex}>
            <LoadingFrameIndicator />
          </div>
        ) : errorMessage != null ? (
          <div style={centeredFlex}>
            <CenteredPlaceholder text={errorMessage} />
          </div>
        ) : newestFirst.length === 0 ? (
          <CenteredPlaceholder text="page.content.length === 0" />
        ) : (
          newestFirst.map((op, idx) => (
            <TransactionHistoryItem
              key={op.id ?? String(idx)}
              operation={op}
            />
          ))
        )}
      </div>
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
            width: "100%",
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

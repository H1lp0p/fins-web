import { useGetTransactionOperationsQuery } from "@fins/api";
import { LinkButton, OnBlurContainer } from "@fins/ui-kit";
import { useRef } from "react";
import { TransactionHistoryItem } from "@fins/entities";

type AccountTransactionsPanelProps = {
  accountId: string;
};

export function AccountTransactionsPanel({
  accountId,
}: AccountTransactionsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetTransactionOperationsQuery({
    accountId,
    pageIndex: 0,
    pageSize: 50,
  });

  const items = data?.content ?? [];
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
      <div className="ph-mid" 
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <OnBlurContainer className="ph-mid pv-mid" 
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
        ) : newestFirst.length === 0 ? (
          <span className="text-info color-input-placeholder">Нет операций</span>
        ) : (
          newestFirst.map((op, idx) => (
            <TransactionHistoryItem
              key={op.id ?? String(idx)}
              operation={op}
            />
          ))
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <OnBlurContainer className="ph-mid pv-mid" 
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

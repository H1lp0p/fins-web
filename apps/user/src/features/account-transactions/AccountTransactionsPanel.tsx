import { useGetTransactionOperationsQuery } from "@fins/api";
import { LinkButton } from "@fins/ui-kit";
import { useRef } from "react";
import { TransactionHistoryItem } from "../../entities/transaction";

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
      className="ph-mid pv-mid color-info"
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <LinkButton
          text="Full up"
          variant="success"
          textClassName="text-info"
          onClick={() => {
            const el = scrollRef.current;
            if (el) el.scrollTop = 0;
          }}
        />
      </div>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <LinkButton
          text="Full down"
          variant="success"
          textClassName="text-info"
          onClick={() => {
            const el = scrollRef.current;
            if (el) el.scrollTop = el.scrollHeight;
          }}
        />
      </div>
    </div>
  );
}

import type { TransactionOperationEntity } from "@fins/api";
import { useGetTransactionOperationsQuery } from "@fins/api";
import {
  CenteredPlaceholder,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
} from "@fins/ui-kit";
import { useRef } from "react";
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
        {isLoading ? (
          <div style={centeredFlex}>
            <LoadingFrameIndicator />
          </div>
        ) : newestFirst.length === 0 ? (
          <CenteredPlaceholder text="page.content.length === 0" />
        ) : (
          newestFirst.map((op, idx) => (
            <TransactionHistoryItem
              key={op.id ?? String(idx)}
              operation={op as TransactionOperationEntity}
            />
          ))
        )}
      </div>
      <div className="ph-mid" 
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

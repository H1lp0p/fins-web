import { useGetUserCardAccountsQuery, useGetUserQuery } from "@fins/api";
import { RectSpaceLayout } from "@fins/ui-kit";
import { useMemo, useState } from "react";
import { AccountActionsBar } from "../features/account-actions/AccountActionsBar";
import { AccountGrid } from "../features/account-grid/AccountGrid";
import { AccountTransactionsPanel } from "../features/account-transactions/AccountTransactionsPanel";
import { ExchangeRateWidget } from "../features/exchange-rate/ExchangeRateWidget";
import { RequireSession } from "../features/require-session/RequireSession";
import { CardAccountInfo } from "../entities/card-account";
import { sortAccountsForIndex } from "../shared/lib/sort-accounts-for-index";

function IndexContent() {
  const { data: user } = useGetUserQuery();
  const userId = user?.id ?? "";
  const { data: page } = useGetUserCardAccountsQuery(
    { userId, pageIndex: 0, pageSize: 100 },
    { skip: !userId },
  );

  const accounts = useMemo(() => {
    const raw = page?.content ?? [];
    return sortAccountsForIndex(raw);
  }, [page?.content]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = accounts.find((a) => a.id === selectedId) ?? null;

  return (
    <div
      className="bg-background"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "calc(100vh - 5rem)",
      }}
    >
      <RectSpaceLayout
        topLeftContent={
          selected ? (
            <div className="ph-mid pv-mid" style={{ height: "100%", boxSizing: "border-box" }}>
              <CardAccountInfo account={selected} />
            </div>
          ) : undefined
        }
        topRightContent={
          selected && userId ? (
            <AccountActionsBar
              account={selected}
              userId={userId}
              onClosed={() => setSelectedId(null)}
            />
          ) : (
            <ExchangeRateWidget />
          )
        }
        bottomLeftContent={
          selected?.id ? (
            <AccountTransactionsPanel accountId={selected.id} />
          ) : undefined
        }
        bottomRightContent={
          <AccountGrid
            accounts={accounts}
            selectedId={selectedId}
            onSelectAccount={setSelectedId}
          />
        }
      />
    </div>
  );
}

export function HomePage() {
  return (
    <RequireSession>
      <IndexContent />
    </RequireSession>
  );
}

import { useGetUserCardAccountsQuery, useGetUserQuery } from "@fins/api";
import { LinkButton, OnBlurContainer, RectSpaceLayout } from "@fins/ui-kit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountActionsBar } from "../features/account-actions/AccountActionsBar";
import { AccountCreateForm } from "../features/account-create-form/AccountCreateForm";
import { AccountGrid } from "../features/account-grid/AccountGrid";
import { AccountTransactionsPanel } from "../features/account-transactions/AccountTransactionsPanel";
import { ExchangeRateWidget } from "../features/exchange-rate/ExchangeRateWidget";
import { RequireSession } from "../features/require-session/RequireSession";
import { CardAccountInfo } from "../entities/card-account";
import { sortAccountsForIndex } from "../shared/lib/sort-accounts-for-index";

type BottomLeftMode = "accounts" | "create";

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
  const [bottomMode, setBottomMode] = useState<BottomLeftMode>("accounts");
  const selected = accounts.find((a) => a.id === selectedId) ?? null;

  const openAccountCreate = useCallback(() => {
    setSelectedId(null);
    setBottomMode("create");
  }, []);

  const closeAccountCreate = useCallback(() => {
    setBottomMode("accounts");
  }, []);

  const onAccountCreated = useCallback((newId?: string) => {
    setBottomMode("accounts");
    if (newId) setSelectedId(newId);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const acc = accounts.find((a) => a.id === selectedId);
    if (acc?.deleted) setSelectedId(null);
  }, [accounts, selectedId]);

  return (
    <div
      className="bg-background"
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <RectSpaceLayout
        topLeftContent={
          selected ? (
            <div
              className="ph-mid pv-mid"
              style={{ height: "100%", width: "100%", minWidth: 0, boxSizing: "border-box" }}
            >
              <CardAccountInfo account={selected} />
            </div>
          ) : undefined
        }
        topRightContent={
          selected && userId ? (
            <AccountActionsBar
              account={selected}
              onClosed={() => setSelectedId(null)}
            />
          ) : (
            <ExchangeRateWidget />
          )
        }
        bottomLeftContent={
          bottomMode === "create" && userId ? (
            <AccountCreateForm
              userId={userId}
              onCancel={closeAccountCreate}
              onCreated={onAccountCreated}
            />
          ) : selected?.id ? (
            <div
              style={{
                height: "100%",
                minHeight: 0,
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <AccountTransactionsPanel accountId={selected.id} />
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                minHeight: 0,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <OnBlurContainer
                className="pv-mid ph-max"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LinkButton
                  text="Create"
                  variant="success"
                  onClick={openAccountCreate}
                />
              </OnBlurContainer>
            </div>
          )
        }
        bottomRightContent={
          <div
            style={{
              height: "100%",
              minHeight: 0,
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <AccountGrid
              accounts={accounts}
              selectedId={selectedId}
              onSelectAccount={setSelectedId}
            />
          </div>
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

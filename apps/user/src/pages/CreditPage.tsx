import {
  useGetAllCreditRulesQuery,
  useGetByUserIdQuery,
  useGetUserCardAccountQuery,
  useGetUserCardAccountsQuery,
  useGetUserQuery,
} from "@fins/api";
import { RectSpaceLayout } from "@fins/ui-kit";
import { useCallback, useMemo, useState } from "react";
import { RequireSession } from "../features/require-session/RequireSession";
import { sortAccountsForIndex } from "../shared/lib/sort-accounts-for-index";
import { CreditsBottomLeftWidget } from "../widgets/credits-bottom-left";
import { CreditsBottomRightWidget } from "../widgets/credits-bottom-right";
import { CreditsTopLeftWidget } from "../widgets/credits-top-left";
import { CreditsTopRightWidget } from "../widgets/credits-top-right";

type PageMode = "list" | "create";

function CreditPageContent() {
  const { data: user } = useGetUserQuery();
  const userId = user?.id ?? "";

  const { data: credits = [] } = useGetByUserIdQuery(
    { userId },
    { skip: !userId },
  );
  const { data: rules = [] } = useGetAllCreditRulesQuery();
  const { data: accountsPage } = useGetUserCardAccountsQuery(
    { userId, pageIndex: 0, pageSize: 100 },
    { skip: !userId },
  );

  const accounts = useMemo(
    () => sortAccountsForIndex(accountsPage?.content ?? []),
    [accountsPage?.content],
  );

  const [pageMode, setPageMode] = useState<PageMode>("list");
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [draftRuleId, setDraftRuleId] = useState<string | null>(null);
  const [draftAccountId, setDraftAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const selectedCredit =
    credits.find((c) => c.id === selectedCreditId) ?? null;
  const draftRule = rules.find((r) => r.id === draftRuleId) ?? null;
  const draftAccount = accounts.find((a) => a.id === draftAccountId) ?? null;

  const cardAccountId = selectedCredit?.cardAccountId;
  const { data: linkedAccount } = useGetUserCardAccountQuery(
    { accountId: cardAccountId ?? "" },
    { skip: !cardAccountId },
  );

  const onToggleCredit = useCallback((id: string) => {
    setSelectedCreditId((prev) => (prev === id ? null : id));
  }, []);

  const openCreate = useCallback(() => {
    setPageMode("create");
    setSelectedCreditId(null);
    setDraftRuleId(null);
    setDraftAccountId(null);
    setAmount("");
  }, []);

  const resetCreate = useCallback(() => {
    setPageMode("list");
    setDraftRuleId(null);
    setDraftAccountId(null);
    setAmount("");
  }, []);

  const onCreated = useCallback(() => {
    resetCreate();
  }, [resetCreate]);

  const createRuleTitle = draftRule?.ruleName?.trim() || "Rule name";

  const topLeftContent =
    pageMode === "create" ? (
      <CreditsTopLeftWidget
        mode="ruleTitle"
        title={createRuleTitle}
      />
    ) : selectedCredit ? (
      <CreditsTopLeftWidget mode="creditSummary" credit={selectedCredit} />
    ) : undefined;

  const topRightContent =
    pageMode === "create" ? (
      <CreditsTopRightWidget kind="reset" onReset={resetCreate} />
    ) : selectedCredit?.id ? (
      <CreditsTopRightWidget kind="payback" creditId={selectedCredit.id} />
    ) : (
      <CreditsTopRightWidget kind="createEntry" onCreate={openCreate} />
    );

  const bottomLeftContent =
    pageMode === "create" ? (
      <CreditsBottomLeftWidget
        kind="create"
        userId={userId}
        rule={draftRule}
        account={draftAccount}
        amount={amount}
        onAmountChange={setAmount}
        onCreated={onCreated}
      />
    ) : selectedCredit ? (
      <CreditsBottomLeftWidget
        kind="detail"
        credit={selectedCredit}
        linkedAccount={linkedAccount}
      />
    ) : undefined;

  const bottomRightContent =
    pageMode === "create" ? (
      <CreditsBottomRightWidget
        kind="picker"
        rules={rules}
        accounts={accounts}
        selectedRuleId={draftRuleId}
        selectedAccountId={draftAccountId}
        onSelectRule={setDraftRuleId}
        onSelectAccount={setDraftAccountId}
      />
    ) : (
      <CreditsBottomRightWidget
        kind="credits"
        credits={credits}
        selectedId={selectedCreditId}
        onToggleCredit={onToggleCredit}
      />
    );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "calc(100vh - 5rem)",
      }}
    >
      <RectSpaceLayout
        topLeftContent={topLeftContent}
        topRightContent={topRightContent}
        bottomLeftContent={bottomLeftContent}
        bottomRightContent={bottomRightContent}
      />
    </div>
  );
}

export function CreditPage() {
  return (
    <RequireSession>
      <CreditPageContent />
    </RequireSession>
  );
}

import { BgText, LinkButton, Logo, RectSpaceLayout } from "@fins/ui-kit";
import { useState } from "react";
import { CreditRuleCreateForm } from "../features/credit-rule-create";
import { CreditRulesGridPanel } from "../widgets/credit-rules-grid";

type CreditsViewMode = "list" | "create";

export function CreditsPage() {
  const [viewMode, setViewMode] = useState<CreditsViewMode>("list");
  const [formMountKey, setFormMountKey] = useState(0);

  const topLeft =
    viewMode === "list" ? (
      <div
        className="ph-mid pv-mid"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <LinkButton
          text="New Credit Rule"
          onClick={() => setViewMode("create")}
          variant="info"
          textClassName="text-title"
        />
      </div>
    ) : (
      <div
        className="ph-mid pv-mid"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <LinkButton
          text="Return"
          onClick={() => setViewMode("list")}
          variant="info"
          textClassName="text-title"
        />
      </div>
    );

  const bottomLeft =
    viewMode === "create" ? (
      <CreditRuleCreateForm
        key={formMountKey}
        onCreated={() => {
          setViewMode("list");
          setFormMountKey((k) => k + 1);
        }}
      />
    ) : undefined;

  return (
    <>
      <BgText text="LOANS" />
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
          topLeftContent={topLeft}
          bottomLeftContent={bottomLeft}
          bottomRightContent={<CreditRulesGridPanel />}
        />
      </div>
    </>
  );
}

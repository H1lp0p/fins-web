import { CreditRuleInfo } from "../entities/credit-rule";
import { DEMO_CREDIT_RULE } from "../dev/demo-credit-rule";

/**
 * Просмотр карточек без сессии и BFF (для вёрстки по Figma).
 * Откройте в dev: `/preview`
 */
export function UiPreviewPage() {
  return (
    <main className="bg-background" style={{ minHeight: "100vh" }}>
      <div className="ph-max pv-max" style={{ maxWidth: "40rem" }}>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.85rem",
            color: "var(--fins-info)",
            opacity: 0.85,
          }}
        >
          UI preview — без входа и без BFF. То же на <code>/</code> (главная).
        </p>
        <CreditRuleInfo rule={DEMO_CREDIT_RULE} />
      </div>
    </main>
  );
}

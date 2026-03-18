import { CARD_ACCOUNT_INFO_DEMOS } from "../dev/demo-card-account";
import { DEMO_CREDIT_SHORT } from "../dev/demo-credit-short";
import {
  DEMO_TRANSACTION_ENROLLMENT,
  DEMO_TRANSACTION_WITHDRAWAL,
} from "../dev/demo-transaction-history";
import { CardAccountInfo } from "../entities/card-account";
import { CreditShortInfo } from "../entities/credit";
import { TransactionHistoryItem } from "../entities/transaction";

/**
 * Просмотр карточек без сессии и BFF (для вёрстки по Figma).
 * Откройте в dev: `/preview`
 */
export function UiPreviewPage() {
  return (
    <main className="bg-background" style={{ minHeight: "100vh" }}>
      <div className="ph-max pv-max" style={{ maxWidth: "25rem" }}>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.85rem",
            color: "var(--fins-info)",
            opacity: 0.85,
          }}
        >
          UI preview — без входа и без BFF. Главная <code>/</code> — другая
          карточка.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <TransactionHistoryItem operation={DEMO_TRANSACTION_WITHDRAWAL} />
            <TransactionHistoryItem operation={DEMO_TRANSACTION_ENROLLMENT} />
          </div>
          <CreditShortInfo credit={DEMO_CREDIT_SHORT} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {CARD_ACCOUNT_INFO_DEMOS.map((demo, index) => (
              <CardAccountInfo
                key={`${demo.displayStatus ?? "default"}-${index}`}
                name={demo.name}
                account={demo.account}
                displayStatus={demo.displayStatus}
                selected={demo.selected}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

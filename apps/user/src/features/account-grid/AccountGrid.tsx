import type { CardAccountEntity } from "@fins/api";
import { CardAccountInfo } from "../../entities/card-account";
import styles from "./AccountGrid.module.css";

type AccountGridProps = {
  accounts: CardAccountEntity[];
  selectedId: string | null;
  onSelectAccount: (accountId: string | null) => void;
};

export function AccountGrid({
  accounts,
  selectedId,
  onSelectAccount,
}: AccountGridProps) {
  return (
    <div
      className={`${styles.wrap} ph-mid pv-mid`}
      style={{ height: "100%", boxSizing: "border-box", overflow: "auto" }}
    >
      <div className={styles.grid}>
        {accounts.map((acc) => {
          const id = acc.id;
          if (!id) return null;
          const deleted = acc.deleted === true;
          return (
            <button
              key={id}
              type="button"
              className={styles.cardBtn}
              disabled={deleted}
              onClick={() => {
                if (!deleted)
                  onSelectAccount(selectedId === id ? null : id);
              }}
            >
              <CardAccountInfo
                account={acc}
                selected={selectedId === id}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

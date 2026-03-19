import type { CreditEntity } from "@fins/api";
import { CreditShortInfo } from "../../entities/credit";
import styles from "./CreditsGrid.module.css";

type CreditsGridProps = {
  credits: CreditEntity[];
  selectedId: string | null;
  /** Повторный клик по выбранному id снимает выбор на стороне страницы. */
  onToggleCredit: (creditId: string) => void;
};

export function CreditsGrid({
  credits,
  selectedId,
  onToggleCredit,
}: CreditsGridProps) {
  return (
    <div
      className={`${styles.wrap} ph-mid pv-mid`}
      style={{ height: "100%", boxSizing: "border-box", overflow: "auto" }}
    >
      <div className={styles.grid}>
        {credits.map((credit) => {
          const id = credit.id;
          if (!id) return null;
          return (
            <button
              key={id}
              type="button"
              className={styles.cardBtn}
              onClick={() => onToggleCredit(id)}
            >
              <CreditShortInfo credit={credit} selected={selectedId === id} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

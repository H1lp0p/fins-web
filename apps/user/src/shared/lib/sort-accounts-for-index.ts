import type { CardAccountEntity } from "@fins/api";

/**
 * Порядок сетки Index: main → default → hidden → closed (deleted).
 */
export function sortAccountsForIndex(
  accounts: CardAccountEntity[],
): CardAccountEntity[] {
  const tier = (a: CardAccountEntity): number => {
    if (a.deleted) return 3;
    if (a.visible === false) return 2;
    if (a.main) return 0;
    return 1;
  };
  return [...accounts].sort((a, b) => {
    const d = tier(a) - tier(b);
    if (d !== 0) return d;
    return (a.id ?? "").localeCompare(b.id ?? "");
  });
}

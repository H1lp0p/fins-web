
export function parseAmountInput(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(/,/g, ".");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

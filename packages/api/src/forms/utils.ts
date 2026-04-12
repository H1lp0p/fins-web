export function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type ParsePositiveNumberResult =
  | { ok: true; value: number }
  | { ok: false; message: string };

export function parseStrictPositiveNumber(raw: unknown): ParsePositiveNumberResult {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw <= 0) {
      return { ok: false, message: "Введите число больше нуля" };
    }
    return { ok: true, value: raw };
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t.length === 0) {
      return { ok: false, message: "Обязательное поле" };
    }
    const n = Number(t);
    if (!Number.isFinite(n) || n <= 0) {
      return { ok: false, message: "Некорректное число" };
    }
    return { ok: true, value: n };
  }
  return { ok: false, message: "Некорректное значение" };
}

export function parseNonNegativeNumber(raw: unknown): ParsePositiveNumberResult {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw < 0) {
      return { ok: false, message: "Введите неотрицательное число" };
    }
    return { ok: true, value: raw };
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t.length === 0) {
      return { ok: false, message: "Обязательное поле" };
    }
    const n = Number(t);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, message: "Некорректное число" };
    }
    return { ok: true, value: n };
  }
  return { ok: false, message: "Некорректное значение" };
}

export function normalizeUserRoles(
  raw: unknown,
): ("CLIENT" | "WORKER")[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const out: ("CLIENT" | "WORKER")[] = [];
  for (const item of raw) {
    if (item === "CLIENT" || item === "WORKER") out.push(item);
  }
  return out.length > 0 ? out : undefined;
}

export function isNonEmptyId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isMeaningfullyPresent(raw: unknown): boolean {
  if (raw === undefined || raw === null) return false;
  if (typeof raw === "string") return raw.trim().length > 0;
  if (typeof raw === "number") return Number.isFinite(raw);
  return true;
}

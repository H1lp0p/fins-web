/** Id для цели «внешний вывод» / legacy `Out` в query. */
export const TRANSACTIONS_OUT_SENTINEL_ID = "out";

/** Источник: только счёт пользователя (`fromId` = id карточного счёта). */
export type TransactionsFromEnd = {
  type: "User";
  id: string;
};

export type TransactionsToEnd =
  | { type: "Account"; id: string }
  | { type: "Credit"; id: string }
  | { type: "User"; id: string }
  | { type: "Other service"; id: string };

export type ParsedTransactionsSearch = {
  from?: TransactionsFromEnd;
  to?: TransactionsToEnd;
};

const TO_TYPES = new Set<string>([
  "Account",
  "Credit",
  "User",
  "Other service",
]);

function normalizeToEnd(
  type: string,
  id: string,
): TransactionsToEnd | undefined {
  if (type === "Out") {
    return { type: "Other service", id: id || TRANSACTIONS_OUT_SENTINEL_ID };
  }
  if (!TO_TYPES.has(type)) return undefined;
  return { type: type as TransactionsToEnd["type"], id };
}

/**
 * Разбор query для страницы переводов.
 * Частичные пары (только type или только id) игнорируются.
 * Legacy: `fromType=Account` трактуется как счёт (`User` + id); `toType=Out` → `Other service`.
 */
export function parseTransactionsSearchParams(
  search: URLSearchParams,
): ParsedTransactionsSearch {
  const fromType = search.get("fromType");
  const fromId = search.get("fromId");
  const toType = search.get("toType");
  const toId = search.get("toId");

  let from: TransactionsFromEnd | undefined;
  if (fromType && fromId) {
    if (fromType === "User" || fromType === "Account") {
      from = { type: "User", id: fromId };
    }
  }

  let to: TransactionsToEnd | undefined;
  if (toType && toId) {
    to = normalizeToEnd(toType, toId);
  }

  return { from, to };
}

export function buildTransactionsSearchString(params: {
  from?: TransactionsFromEnd;
  to?: TransactionsToEnd;
}): string {
  const p = new URLSearchParams();
  if (params.from) {
    p.set("fromType", params.from.type);
    p.set("fromId", params.from.id);
  }
  if (params.to) {
    p.set("toType", params.to.type);
    p.set("toId", params.to.id);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

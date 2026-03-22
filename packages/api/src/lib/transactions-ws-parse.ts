import type { ClientSubscribePayload } from "../generated/ws/ClientSubscribePayload";
import type { ClientUnsubscribePayload } from "../generated/ws/ClientUnsubscribePayload";
import type { TransactionsStream } from "../generated/ws/TransactionsStream";

/** Исходящие сообщения клиента по контракту AsyncAPI (поле `type`: subscribe | unsubscribe). */
export type TransactionsWsClientPayload =
  | ClientSubscribePayload
  | ClientUnsubscribePayload;

export function parseTransactionsWsServerMessage(
  data: string | object,
): TransactionsStream | null {
  let raw: unknown;
  try {
    raw = typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const t = (raw as Record<string, unknown>).type;
  if (t === "snapshot" || t === "transaction" || t === "error") {
    return raw as TransactionsStream;
  }
  return null;
}

export function isTransactionsWsServerMessage(
  raw: unknown,
): raw is TransactionsStream {
  if (!raw || typeof raw !== "object") return false;
  const t = (raw as Record<string, unknown>).type;
  return t === "snapshot" || t === "transaction" || t === "error";
}

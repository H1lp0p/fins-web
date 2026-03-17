/**
 * Типы и утилиты WebSocket потока операций (AsyncAPI).
 * Импорт: `import { … } from "@fins/api/ws"`.
 */
export * from "./generated/ws";
export {
  isTransactionsWsServerMessage,
  parseTransactionsWsServerMessage,
  type TransactionsWsClientPayload,
} from "./lib/transactions-ws-parse";
export {
  useTransactionsWebSocket,
  type UseTransactionsWebSocketOptions,
} from "./hooks/useTransactionsWebSocket";

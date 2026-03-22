import { useEffect, useRef } from "react";

import type { TransactionsStream } from "../generated/ws/TransactionsStream";
import { parseTransactionsWsServerMessage } from "../lib/transactions-ws-parse";

export type UseTransactionsWebSocketOptions = {
  /** UUID счёта; пока `null` / `undefined` — сокет не открываем */
  accountId: string | null | undefined;
  /** Распарсенные сообщения сервера по контракту AsyncAPI */
  onMessage: (message: TransactionsStream) => void;
  pageIndex?: number;
  pageSize?: number;
  /** Полный `ws:` / `wss:` URL; иначе тот же host, что у страницы, путь `/api/ws/transactions` */
  url?: string;
  /** По умолчанию `true` */
  enabled?: boolean;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onConnectionError?: (event: Event) => void;
};

function defaultWsUrl(): string {
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  return `${scheme}://${window.location.host}/api/ws/transactions`;
}

/**
 * WebSocket к BFF (`/api/ws/transactions`): при открытии шлёт `subscribe` для `accountId`.
 * Колбэки не нужно мемоизировать — внутри держатся через ref.
 */
export function useTransactionsWebSocket(
  options: UseTransactionsWebSocketOptions,
): void {
  const {
    accountId,
    onMessage,
    pageIndex = 0,
    pageSize = 30,
    url,
    enabled = true,
    onOpen,
    onClose,
    onConnectionError,
  } = options;

  const callbacksRef = useRef({
    onMessage,
    onOpen,
    onClose,
    onConnectionError,
  });
  callbacksRef.current = {
    onMessage,
    onOpen,
    onClose,
    onConnectionError,
  };

  useEffect(() => {
    if (!enabled || !accountId || typeof window === "undefined") {
      return;
    }

    const wsUrl = url ?? defaultWsUrl();
    const ws = new WebSocket(wsUrl);
    const id = accountId;
    const pIdx = pageIndex;
    const pSize = pageSize;

    ws.onopen = () => {
      callbacksRef.current.onOpen?.();
      ws.send(
        JSON.stringify({
          type: "subscribe",
          accountId: id,
          pageIndex: pIdx,
          pageSize: pSize,
        }),
      );
    };

    ws.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data !== "string") {
        return;
      }
      const parsed = parseTransactionsWsServerMessage(ev.data);
      if (parsed) {
        callbacksRef.current.onMessage(parsed);
      }
    };

    ws.onerror = (ev: Event) => {
      callbacksRef.current.onConnectionError?.(ev);
    };

    ws.onclose = (ev: CloseEvent) => {
      callbacksRef.current.onClose?.(ev);
    };

    return () => {
      ws.close();
    };
  }, [enabled, accountId, pageIndex, pageSize, url]);
}

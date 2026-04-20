import { useEffect, useRef } from "react";

import type { TransactionsStream } from "../generated/ws/TransactionsStream";
import { parseTransactionsWsServerMessage } from "../lib/transactions-ws-parse";

export type UseTransactionsWebSocketOptions = {
  
  accountId: string | null | undefined;
  
  onMessage: (message: TransactionsStream) => void;
  pageIndex?: number;
  pageSize?: number;
  
  url?: string;
  
  enabled?: boolean;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onConnectionError?: (event: Event) => void;
};

function defaultWsUrl(): string {
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  return `${scheme}://${window.location.host}/api/ws/transactions`;
}

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

    let cancelled = false;
    const wsUrl = url ?? defaultWsUrl();
    const ws = new WebSocket(wsUrl);
    const id = accountId;
    const pIdx = pageIndex;
    const pSize = pageSize;

    ws.onopen = () => {
      if (cancelled) {
        ws.close();
        return;
      }
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
      cancelled = true;
      // Strict Mode: не вызывать close() на CONNECTING — иначе шум в консоли и обрыв до subscribe.
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => {
          ws.close();
        };
        return;
      }
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "unsubscribe", accountId: id }));
        } catch {
          // ignore
        }
        ws.close();
      }
    };
  }, [enabled, accountId, pageIndex, pageSize, url]);
}

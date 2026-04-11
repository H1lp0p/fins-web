import { useEffect, useRef } from "react";

import type { Notification } from "../entities/notification";
import { isNotificationPayload } from "../entities/notification";
import { defaultNotificationsBffBaseUrl } from "../lib/notification-bff-http";
import { readNotificationSseStream } from "../lib/notification-sse-parse";

export type UseNotificationsSseOptions = {
  onNotification: (notification: Notification) => void;
  baseUrl?: string;
  enabled?: boolean;
  onOpen?: () => void;
  onConnectionError?: (error: unknown) => void;
};

function joinSubscribeUrl(baseUrl: string): string {
  const b = baseUrl.replace(/\/$/, "");
  return `${b}/subscribe`;
}

/**
 * Подписка на SSE поток уведомлений через BFF (`/api/notifications/subscribe`, cookie-сессия).
 */
export function useNotificationsSse(options: UseNotificationsSseOptions): void {
  const {
    onNotification,
    baseUrl = defaultNotificationsBffBaseUrl(),
    enabled = true,
    onOpen,
    onConnectionError,
  } = options;

  const cbRef = useRef({
    onNotification,
    onOpen,
    onConnectionError,
  });
  cbRef.current = { onNotification, onOpen, onConnectionError };

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(joinSubscribeUrl(baseUrl), {
          credentials: "include",
          signal: ac.signal,
          headers: { Accept: "text/event-stream" },
        });
        if (!res.ok) {
          cbRef.current.onConnectionError?.(
            new Error(`notifications subscribe HTTP ${res.status}`),
          );
          return;
        }
        cbRef.current.onOpen?.();
        await readNotificationSseStream(res.body, (payload) => {
          if (cancelled) {
            return;
          }
          try {
            const parsed: unknown = JSON.parse(payload);
            if (isNotificationPayload(parsed)) {
              cbRef.current.onNotification(parsed);
            }
          } catch {
            /* игнорируем не-JSON чанки / комментарии */
          }
        });
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) {
          return;
        }
        cbRef.current.onConnectionError?.(e);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [enabled, baseUrl]);
}

import type { Notification } from "../entities/notification";
import {
  type BffCircuitBreaker,
  getSharedBffCircuitBreaker,
} from "./bff-circuit-breaker";

export function defaultNotificationsBffBaseUrl(): string {
  return "/api/notifications";
}

function joinUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function recordNotificationResponse(
  breaker: BffCircuitBreaker | null,
  r: Response,
): void {
  if (!breaker) {
    return;
  }
  breaker.recordFromFetchBaseResult({
    error: !r.ok && r.status >= 500 ? { status: r.status } : undefined,
    data: r.ok || r.status < 500 ? {} : undefined,
  });
}

export async function fetchUnreadNotifications(
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<Notification[]> {
  const breaker = getSharedBffCircuitBreaker();
  if (breaker?.shouldBlock()) {
    throw new Error("BFF_CIRCUIT_OPEN");
  }
  let r: Response;
  try {
    r = await fetch(joinUrl(baseUrl, "/unread"), {
      credentials: "include",
      ...init,
    });
  } catch (err) {
    breaker?.recordFromFetchBaseResult({
      error: { status: "FETCH_ERROR", error: String(err) },
    });
    throw err;
  }
  recordNotificationResponse(breaker, r);
  if (!r.ok) {
    throw new Error(`notifications unread HTTP ${r.status}`);
  }
  return (await r.json()) as Notification[];
}

export async function fetchAllNotifications(
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<Notification[]> {
  const breaker = getSharedBffCircuitBreaker();
  if (breaker?.shouldBlock()) {
    throw new Error("BFF_CIRCUIT_OPEN");
  }
  let r: Response;
  try {
    r = await fetch(joinUrl(baseUrl, "/all"), {
      credentials: "include",
      ...init,
    });
  } catch (err) {
    breaker?.recordFromFetchBaseResult({
      error: { status: "FETCH_ERROR", error: String(err) },
    });
    throw err;
  }
  recordNotificationResponse(breaker, r);
  if (!r.ok) {
    throw new Error(`notifications all HTTP ${r.status}`);
  }
  return (await r.json()) as Notification[];
}

export type FcmTokenRequest = {
  token: string;
  platform?: string;
};

export async function registerFcmToken(
  body: FcmTokenRequest,
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<void> {
  const breaker = getSharedBffCircuitBreaker();
  if (breaker?.shouldBlock()) {
    throw new Error("BFF_CIRCUIT_OPEN");
  }
  let r: Response;
  try {
    r = await fetch(joinUrl(baseUrl, "/fcm/token"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: init?.signal,
    });
  } catch (err) {
    breaker?.recordFromFetchBaseResult({
      error: { status: "FETCH_ERROR", error: String(err) },
    });
    throw err;
  }
  recordNotificationResponse(breaker, r);
  if (!r.ok) {
    throw new Error(`notifications FCM register HTTP ${r.status}`);
  }
}

export async function unregisterFcmToken(
  fcmToken: string,
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<void> {
  const breaker = getSharedBffCircuitBreaker();
  if (breaker?.shouldBlock()) {
    throw new Error("BFF_CIRCUIT_OPEN");
  }
  const q = new URLSearchParams({ arg0: fcmToken });
  let r: Response;
  try {
    r = await fetch(`${joinUrl(baseUrl, "/fcm/token")}?${q.toString()}`, {
      method: "DELETE",
      credentials: "include",
      signal: init?.signal,
    });
  } catch (err) {
    breaker?.recordFromFetchBaseResult({
      error: { status: "FETCH_ERROR", error: String(err) },
    });
    throw err;
  }
  recordNotificationResponse(breaker, r);
  if (!r.ok) {
    throw new Error(`notifications FCM unregister HTTP ${r.status}`);
  }
}

export async function markNotificationRead(
  notificationId: string,
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<void> {
  const breaker = getSharedBffCircuitBreaker();
  if (breaker?.shouldBlock()) {
    throw new Error("BFF_CIRCUIT_OPEN");
  }
  let r: Response;
  try {
    r = await fetch(joinUrl(baseUrl, `/${notificationId}/read`), {
      method: "PUT",
      credentials: "include",
      ...init,
    });
  } catch (err) {
    breaker?.recordFromFetchBaseResult({
      error: { status: "FETCH_ERROR", error: String(err) },
    });
    throw err;
  }
  recordNotificationResponse(breaker, r);
  if (!r.ok) {
    throw new Error(`notifications mark read HTTP ${r.status}`);
  }
}

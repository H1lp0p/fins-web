import type { Notification } from "../entities/notification";

export function defaultNotificationsBffBaseUrl(): string {
  return "/api/notifications";
}

function joinUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function fetchUnreadNotifications(
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<Notification[]> {
  const r = await fetch(joinUrl(baseUrl, "/unread"), {
    credentials: "include",
    ...init,
  });
  if (!r.ok) {
    throw new Error(`notifications unread HTTP ${r.status}`);
  }
  return (await r.json()) as Notification[];
}

export async function fetchAllNotifications(
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<Notification[]> {
  const r = await fetch(joinUrl(baseUrl, "/all"), {
    credentials: "include",
    ...init,
  });
  if (!r.ok) {
    throw new Error(`notifications all HTTP ${r.status}`);
  }
  return (await r.json()) as Notification[];
}

export async function markNotificationRead(
  notificationId: string,
  baseUrl: string = defaultNotificationsBffBaseUrl(),
  init?: RequestInit,
): Promise<void> {
  const r = await fetch(joinUrl(baseUrl, `/${notificationId}/read`), {
    method: "PUT",
    credentials: "include",
    ...init,
  });
  if (!r.ok) {
    throw new Error(`notifications mark read HTTP ${r.status}`);
  }
}

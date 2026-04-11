/**
 * Соответствует схеме Notification в openapi/notif_api.json (notification-service).
 */
export type Notification = {
  id: string;
  eventId?: string;
  userId?: string;
  operationId?: string;
  type?: string;
  amount?: number;
  currency?: string;
  message?: string;
  createdAt?: string;
  read?: boolean;
};

export function isNotificationPayload(value: unknown): value is Notification {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.id === "string";
}

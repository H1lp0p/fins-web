import type { Notification } from "@fins/api";
import { useNotificationsSse } from "@fins/api";
import { useMessageStack, type Message } from "@fins/ui-kit";
import type { ReactNode } from "react";

function notificationToInfoMessage(n: Notification): Message {
  const title = n.type?.trim() ? n.type : "Уведомление";
  let text = n.message?.trim();
  if (!text && n.amount != null) {
    text = n.currency ? `${n.amount} ${n.currency}` : String(n.amount);
  }
  if (!text) {
    text = n.operationId ? `Операция ${n.operationId}` : n.id;
  }
  return { type: "info", title, text };
}

export type NotificationMessagesProviderProps = {
  children: ReactNode;
  enabled?: boolean;
};

/**
 * Внутри {@link MessageStackProvider}: SSE уведомлений через BFF → info в стеке.
 */
export function NotificationMessagesProvider({
  children,
  enabled = true,
}: NotificationMessagesProviderProps) {
  const { pushMessage } = useMessageStack();

  useNotificationsSse({
    enabled,
    onNotification: (n) => {
      pushMessage(notificationToInfoMessage(n));
    },
  });

  return <>{children}</>;
}

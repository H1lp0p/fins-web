import type { FirebaseOptions } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
} from "firebase/messaging";
import { useEffect, useRef } from "react";

import {
  defaultNotificationsBffBaseUrl,
  registerFcmToken,
  unregisterFcmToken,
} from "../lib/notification-bff-http";

export type UseWebPushRegistrationOptions = {
  /** After session is established */
  enabled: boolean;
  firebaseOptions: FirebaseOptions;
  vapidKey: string;
  notificationsBaseUrl?: string;
};

function configReady(o: FirebaseOptions, vapidKey: string): boolean {
  return Boolean(
    o.apiKey &&
      o.authDomain &&
      o.projectId &&
      o.messagingSenderId &&
      o.appId &&
      vapidKey.trim(),
  );
}

/**
 * Registers FCM web token with BFF (notification-service) for native push.
 * Unregisters on unmount. No in-page messaging (background SW only).
 */
export function useWebPushRegistration(
  options: UseWebPushRegistrationOptions,
): void {
  const {
    enabled,
    firebaseOptions,
    vapidKey,
    notificationsBaseUrl = defaultNotificationsBffBaseUrl(),
  } = options;

  const optsRef = useRef(options);
  optsRef.current = options;
  const registeredTokenRef = useRef<string | null>(null);
  const baseUrlRef = useRef(notificationsBaseUrl);
  baseUrlRef.current = notificationsBaseUrl;

  useEffect(() => {
    registeredTokenRef.current = null;
    if (!enabled || typeof window === "undefined") {
      return;
    }
    const { firebaseOptions: fo, vapidKey: vk } = optsRef.current;
    if (!configReady(fo, vk)) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        if (!(await isSupported())) {
          return;
        }
      } catch {
        return;
      }
      if (cancelled) {
        return;
      }

      let app;
      try {
        app = getApps().length > 0 ? getApp() : initializeApp(fo);
      } catch {
        return;
      }

      let registration: ServiceWorkerRegistration;
      try {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        await navigator.serviceWorker.ready;
      } catch {
        return;
      }
      if (cancelled) {
        return;
      }

      const messaging = getMessaging(app);
      let token: string;
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          return;
        }
        token = await getToken(messaging, {
          vapidKey: vk,
          serviceWorkerRegistration: registration,
        });
      } catch {
        return;
      }
      if (cancelled || !token) {
        return;
      }

      registeredTokenRef.current = token;
      try {
        await registerFcmToken(
          { token, platform: "web" },
          baseUrlRef.current,
        );
      } catch {
        /* BFF / notification-service optional in dev */
      }
    })();

    return () => {
      cancelled = true;
      const t = registeredTokenRef.current;
      registeredTokenRef.current = null;
      if (!t) {
        return;
      }
      void (async () => {
        try {
          const app = getApps().length > 0 ? getApp() : null;
          if (!app) {
            return;
          }
          const messaging = getMessaging(app);
          await deleteToken(messaging);
        } catch {
          /* ignore */
        }
        try {
          await unregisterFcmToken(t, baseUrlRef.current);
        } catch {
          /* ignore */
        }
      })();
    };
  }, [enabled, notificationsBaseUrl, firebaseOptions, vapidKey]);
}

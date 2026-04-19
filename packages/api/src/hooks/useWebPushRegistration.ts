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

function isViteDev(): boolean {
  return Boolean(
    typeof import.meta !== "undefined" &&
      (import.meta as { env?: { DEV?: boolean } }).env?.DEV,
  );
}

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

function warnMissingPushConfig(o: FirebaseOptions, vapidKey: string): void {
  if (!isViteDev()) {
    return;
  }
  const missing: string[] = [];
  if (!o.apiKey) {
    missing.push("VITE_FIREBASE_API_KEY");
  }
  if (!o.authDomain) {
    missing.push("VITE_FIREBASE_AUTH_DOMAIN");
  }
  if (!o.projectId) {
    missing.push("VITE_FIREBASE_PROJECT_ID");
  }
  if (!o.messagingSenderId) {
    missing.push("VITE_FIREBASE_MESSAGING_SENDER_ID");
  }
  if (!o.appId) {
    missing.push("VITE_FIREBASE_APP_ID");
  }
  if (!vapidKey.trim()) {
    missing.push("VITE_FIREBASE_VAPID_KEY");
  }
  if (missing.length > 0) {
    console.warn(
      "[fins/push] Пропуск регистрации FCM: не заданы переменные окружения:",
      missing.join(", "),
    );
  }
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
      warnMissingPushConfig(fo, vk);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        if (!(await isSupported())) {
          if (isViteDev()) {
            console.warn(
              "[fins/push] Firebase Messaging в этом браузере не поддерживается (isSupported=false).",
            );
          }
          return;
        }
      } catch {
        if (isViteDev()) {
          console.warn("[fins/push] isSupported() завершился с ошибкой.");
        }
        return;
      }
      if (cancelled) {
        return;
      }

      let app;
      try {
        app = getApps().length > 0 ? getApp() : initializeApp(fo);
      } catch (e) {
        if (isViteDev()) {
          console.warn("[fins/push] Firebase initializeApp:", e);
        }
        return;
      }

      let registration: ServiceWorkerRegistration;
      try {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        await navigator.serviceWorker.ready;
      } catch (e) {
        if (isViteDev()) {
          console.warn(
            "[fins/push] Не удалось зарегистрировать firebase-messaging-sw.js:",
            e,
          );
        }
        return;
      }
      if (cancelled) {
        return;
      }

      const messaging = getMessaging(app);
      let token: string;
      try {
        const before = Notification.permission;
        const perm = await Notification.requestPermission();
        if (isViteDev() && before === "denied" && perm === "denied") {
          console.warn(
            "[fins/push] Уведомления для сайта уже запрещены. Включите в настройках браузера (значок замка → Уведомления) и обновите страницу.",
          );
        }
        if (perm !== "granted") {
          if (isViteDev() && perm === "default") {
            console.warn(
              "[fins/push] Разрешение не выдано (осталось «спросить»). Закройте блокировку всплывающих окон или попробуйте клик по странице и перезагрузку.",
            );
          }
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

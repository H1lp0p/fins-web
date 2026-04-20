import type { FirebaseApp, FirebaseOptions } from "firebase/app";
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

/** Отдельное имя приложения, чтобы не смешивать с другим Firebase на странице и не брать «чужой» getApp(). */
const FCM_APP_NAME = "fins-fcm-web";

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

function trimOpt(s: string | undefined): string | undefined {
  if (s === undefined) {
    return undefined;
  }
  const t = s.trim();
  return t.length > 0 ? t : undefined;
}

/** Убираем пробелы/переносы из .env — иначе Installations / getToken дают invalid-argument. */
function normalizeFirebaseOptions(o: FirebaseOptions): FirebaseOptions {
  return {
    ...o,
    apiKey: trimOpt(o.apiKey as string | undefined),
    authDomain: trimOpt(o.authDomain as string | undefined),
    projectId: trimOpt(o.projectId as string | undefined),
    storageBucket: trimOpt(o.storageBucket as string | undefined),
    messagingSenderId: trimOpt(o.messagingSenderId as string | undefined),
    appId: trimOpt(o.appId as string | undefined),
    measurementId: trimOpt(o.measurementId as string | undefined),
  } as FirebaseOptions;
}

function getOrInitFcmApp(fo: FirebaseOptions): FirebaseApp {
  const existing = getApps().find((a) => a.name === FCM_APP_NAME);
  if (existing) {
    return existing;
  }
  return initializeApp(fo, FCM_APP_NAME);
}

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

function warnMisconfiguredKeys(
  o: FirebaseOptions,
  vapidKey: string,
): void {
  if (!isViteDev()) {
    return;
  }
  const api = String(o.apiKey ?? "");
  const vapid = vapidKey.trim();
  if (api && vapid && api === vapid) {
    console.warn(
      "[fins/push] VITE_FIREBASE_API_KEY и VITE_FIREBASE_VAPID_KEY совпадают — так быть не должно. Web API Key обычно начинается с AIza…, VAPID — другой ключ (Cloud Messaging → Web Push).",
    );
  }
  if (api && !api.startsWith("AIza")) {
    console.warn(
      "[fins/push] apiKey не похож на Web API Key (ожидается префикс AIza…). Проверьте значение VITE_FIREBASE_API_KEY в консоли Firebase → Project settings → Your apps.",
    );
  }
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

function logFirebaseError(context: string, e: unknown): void {
  if (!isViteDev()) {
    return;
  }
  const err = e as { code?: string; message?: string; name?: string };
  const msg = err?.message ?? String(e);
  const code = err?.code ?? err?.name ?? "";
  console.warn(`[fins/push] ${context}${code ? ` [${code}]` : ""}:`, msg);
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
    const raw = optsRef.current.firebaseOptions;
    const fo = normalizeFirebaseOptions(raw);
    const vk = optsRef.current.vapidKey.trim();

    if (!configReady(fo, vk)) {
      warnMissingPushConfig(fo, vk);
      return;
    }
    warnMisconfiguredKeys(fo, vk);

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
      } catch (e) {
        logFirebaseError("isSupported()", e);
        return;
      }
      if (cancelled) {
        return;
      }

      let app: FirebaseApp;
      try {
        app = getOrInitFcmApp(fo);
      } catch (e) {
        logFirebaseError("initializeApp / getApp", e);
        return;
      }

      let registration: ServiceWorkerRegistration;
      try {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" },
        );
        await navigator.serviceWorker.ready;
        await registration.update();
      } catch (e) {
        logFirebaseError(
          "регистрация firebase-messaging-sw.js (проверьте, что в SW тот же firebaseConfig, что в .env)",
          e,
        );
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
      } catch (e) {
        logFirebaseError(
          "getToken (проверьте Web API Key, VAPID и совпадение firebase-messaging-sw.js с .env)",
          e,
        );
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
          let app: FirebaseApp | undefined;
          try {
            app = getApp(FCM_APP_NAME);
          } catch {
            return;
          }
          const messaging = getMessaging(app);
          await deleteToken(messaging);
        } catch (e) {
          logFirebaseError("deleteToken при размонтировании", e);
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

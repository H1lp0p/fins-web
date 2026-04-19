import { useWebPushRegistration } from "@fins/api";
import type { FirebaseOptions } from "firebase/app";
import { useMemo } from "react";

function firebaseWebOptionsFromEnv() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as
      | string
      | undefined,
    messagingSenderId: import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as
      | string
      | undefined,
  };
}

/**
 * Registers FCM after login (inside {@link RequireSession}). Native push only.
 */
export function WebPushRegistration() {
  const firebaseOptions = useMemo(
    () => firebaseWebOptionsFromEnv() as FirebaseOptions,
    [],
  );
  const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string) ?? "";

  useWebPushRegistration({
    enabled: true,
    firebaseOptions,
    vapidKey,
  });

  return null;
}

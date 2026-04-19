/* global importScripts, firebase */
/**
 * FCM background handler. Keep `firebaseConfig` identical to VITE_FIREBASE_* in `.env`.
 * Uses compat build version aligned with app dependency `firebase`.
 */
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

function parseNotificationPayload(data) {
  if (!data || typeof data !== "object") {
    return null;
  }
  const raw =
    typeof data.payload === "string"
      ? data.payload
      : typeof data.notification === "string"
        ? data.notification
        : null;
  if (!raw) {
    return null;
  }
  try {
    const o = JSON.parse(raw);
    return o && typeof o === "object" && typeof o.id === "string" ? o : null;
  } catch {
    return null;
  }
}

function titleBodyFromNotification(n) {
  const title =
    n.type && String(n.type).trim() ? String(n.type).trim() : "Уведомление";
  let text =
    n.message && String(n.message).trim() ? String(n.message).trim() : "";
  if (!text && n.amount != null) {
    text = n.currency
      ? `${n.amount} ${n.currency}`
      : String(n.amount);
  }
  if (!text) {
    text = n.operationId
      ? `Операция ${n.operationId}`
      : String(n.id ?? "");
  }
  return { title, body: text };
}

messaging.onBackgroundMessage((payload) => {
  const note = payload.notification;
  let title = note && note.title ? String(note.title) : "";
  let body = note && note.body ? String(note.body) : "";

  const parsed = parseNotificationPayload(payload.data || {});
  if (parsed) {
    const tb = titleBodyFromNotification(parsed);
    if (!title) {
      title = tb.title;
    }
    if (!body) {
      body = tb.body;
    }
  }

  if (!title) {
    title = "Уведомление";
  }

  return self.registration.showNotification(title, {
    body: body || undefined,
    data: payload.data || {},
  });
});

/**
 * Origin SSO-приложения (редирект на логин / после логаута).
 *
 * Если задан `VITE_SSO_URL` — используется он. Иначе для локальной разработки
 * берётся тот же hostname, что у текущей страницы (`localhost` и `127.0.0.1`
 * — разные origin для cookie, их нельзя смешивать).
 */
export function getSsoOrigin(): string {
  const explicit = import.meta.env.VITE_SSO_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const port = import.meta.env.VITE_SSO_DEV_PORT?.trim() || "5173";
  if (typeof window === "undefined") {
    return `http://127.0.0.1:${port}`;
  }

  const { protocol, hostname } = window.location;
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "[::1]") {
    return `${protocol}//${hostname}:${port}`;
  }

  return `http://127.0.0.1:${port}`;
}

/** URL после успешного login/register или кнопки «в приложение» (`apps/sso/.env.example`). */
export function getSsoPostLoginRedirectUrl(): string | undefined {
  const u = import.meta.env.VITE_SSO_POST_LOGIN_REDIRECT_URL?.trim();
  return u || undefined;
}

export function redirectToSsoPostLoginTarget(): void {
  const url = getSsoPostLoginRedirectUrl();
  if (url) window.location.assign(url);
}

/**
 * `returnUrl` с страницы логина (например с user-приложения: `?returnUrl=` + encodeURIComponent(href)).
 * Без `VITE_ALLOWED_RETURN_ORIGINS` разрешены только `http(s)://localhost` и `127.0.0.1` (любой порт).
 */
export function getValidatedReturnUrlFromSearch(): string | undefined {
  let raw: string;
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("returnUrl");
    if (!q) return undefined;
    raw = decodeURIComponent(q);
  } catch {
    return undefined;
  }
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return undefined;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;

  const allowed =
    import.meta.env.VITE_ALLOWED_RETURN_ORIGINS?.split(/[\s,]+/).filter(Boolean) ??
    [];
  if (allowed.length > 0) {
    if (!allowed.some((o) => u.origin === o)) return undefined;
  } else {
    const h = u.hostname.toLowerCase();
    if (h !== "localhost" && h !== "127.0.0.1" && h !== "[::1]") return undefined;
  }
  return raw;
}

/**
 * Редирект после установки сессии (login/register): сначала `returnUrl`, затем `VITE_SSO_POST_LOGIN_REDIRECT_URL`.
 * @returns true если ушли со страницы (assign)
 */
export function tryRedirectAfterSsoSuccess(): boolean {
  const fromQuery = getValidatedReturnUrlFromSearch();
  if (fromQuery) {
    window.location.assign(fromQuery);
    return true;
  }
  const fromEnv = getSsoPostLoginRedirectUrl();
  if (fromEnv) {
    window.location.assign(fromEnv);
    return true;
  }
  return false;
}

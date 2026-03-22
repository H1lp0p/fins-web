/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BFF_URL?: string;
  /** Статический редирект после входа, если нет `returnUrl` в query */
  readonly VITE_SSO_POST_LOGIN_REDIRECT_URL?: string;
  /** Список origin через запятую; если задан — `returnUrl` только с этих origin */
  readonly VITE_ALLOWED_RETURN_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

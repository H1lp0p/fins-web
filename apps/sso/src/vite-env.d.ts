/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BFF_URL?: string;
  
  readonly VITE_SSO_POST_LOGIN_REDIRECT_URL?: string;
  
  readonly VITE_ALLOWED_RETURN_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

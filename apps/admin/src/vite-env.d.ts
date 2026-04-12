/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BFF_URL?: string;
  readonly VITE_SSO_URL?: string;
  
  readonly VITE_SSO_DEV_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

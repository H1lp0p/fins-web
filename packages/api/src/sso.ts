/**
 * Entry только для приложения SSO. Не реэкспортировать из `index.ts`.
 */
export { initSsoBffApi } from "./generated/sso/emptySsoApi";
export * from "./generated/sso/generatedSsoApi";
export type { BffError } from "./entities/bff-error";
export {
  extractBffError,
  mapBffErrorFromBody,
  tryParseBffError,
} from "./entities/bff-error";

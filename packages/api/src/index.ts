/**
 * Общий entry для клиентов (user, admin): без SSO-only модулей.
 * Сюда по мере готовности — entities, forms, generated/user.
 */
export {
  createBffFetchBaseQuery,
  type BffClientOptions,
} from "./lib/bff-fetch-base-query";

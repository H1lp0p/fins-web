import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import {
  resolveSharedBffCircuitBreaker,
  type BffClientCircuitBreakerOption,
} from "./bff-circuit-breaker";

type FetchBaseQueryOptions = NonNullable<Parameters<typeof fetchBaseQuery>[0]>;

export const BFF_IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

export type BffClientOptions = {
  baseUrl: string;

  credentials?: RequestCredentials;
  prepareHeaders?: FetchBaseQueryOptions["prepareHeaders"];
  fetchFn?: FetchBaseQueryOptions["fetchFn"];
  
  circuitBreaker?: BffClientCircuitBreakerOption;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export function createBffFetchBaseQuery(
  options: BffClientOptions,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const {
    baseUrl,
    credentials = "include",
    prepareHeaders,
    fetchFn,
    circuitBreaker: circuitBreakerOpt,
  } = options;

  const mergedPrepareHeaders: FetchBaseQueryOptions["prepareHeaders"] = (
    headers,
    api,
  ) => {
    if (prepareHeaders !== undefined) {
      prepareHeaders(headers, api);
    }
    if (!headers.has(BFF_IDEMPOTENCY_KEY_HEADER)) {
      headers.set(BFF_IDEMPOTENCY_KEY_HEADER, crypto.randomUUID());
    }
    return headers;
  };

  const inner = fetchBaseQuery({
    baseUrl: normalizeBaseUrl(baseUrl),
    credentials,
    prepareHeaders: mergedPrepareHeaders,
    ...(fetchFn !== undefined ? { fetchFn } : {}),
  });

  return async (args, api, extraOptions) => {
    const breaker = resolveSharedBffCircuitBreaker(circuitBreakerOpt);
    if (breaker?.shouldBlock()) {
      return {
        error: {
          status: "CUSTOM_ERROR",
          error: "Сервис временно недоступен",
          data: {
            code: "BFF_CIRCUIT_OPEN",
            message: "Сервис временно недоступен",
          },
        },
      };
    }
    const result = await inner(args, api, extraOptions);
    breaker?.recordFromFetchBaseResult(result);
    return result;
  };
}

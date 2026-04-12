import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

type FetchBaseQueryOptions = NonNullable<Parameters<typeof fetchBaseQuery>[0]>;

export type BffClientOptions = {
  baseUrl: string;
  
  credentials?: RequestCredentials;
  prepareHeaders?: FetchBaseQueryOptions["prepareHeaders"];
  fetchFn?: FetchBaseQueryOptions["fetchFn"];
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
  } = options;

  return fetchBaseQuery({
    baseUrl: normalizeBaseUrl(baseUrl),
    credentials,
    ...(prepareHeaders !== undefined ? { prepareHeaders } : {}),
    ...(fetchFn !== undefined ? { fetchFn } : {}),
  });
}

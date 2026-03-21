import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  createBffFetchBaseQuery,
  type BffClientOptions,
} from "../../lib/bff-fetch-base-query.js";

let bffOptions: BffClientOptions = { baseUrl: "/" };

/** Вызвать в SSO-приложении до первого запроса. */
export function initSsoBffApi(options: BffClientOptions): void {
  bffOptions = options;
}

const ssoBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = (args, api, extraOptions) =>
  createBffFetchBaseQuery(bffOptions)(args, api, extraOptions);

export const api = createApi({
  reducerPath: "finsSsoApi",
  baseQuery: ssoBaseQuery,
  endpoints: () => ({}),
});

import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  createBffFetchBaseQuery,
  type BffClientOptions,
} from "../../lib/bff-fetch-base-query";

let bffOptions: BffClientOptions = { baseUrl: "/" };

/** Вызвать в приложении до первого запроса (например из main с import.meta.env). */
export function initPublicBffApi(options: BffClientOptions): void {
  bffOptions = options;
}

const publicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = (args, api, extraOptions) =>
  createBffFetchBaseQuery(bffOptions)(args, api, extraOptions);

export const emptySplitApi = createApi({
  reducerPath: "finsPublicApi",
  baseQuery: publicBaseQuery,
  endpoints: () => ({}),
});

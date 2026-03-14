import { api } from "./emptyPublicApi.js";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    echoPost: build.mutation<EchoPostApiResponse, EchoPostApiArg>({
      query: (queryArg) => ({
        url: `/echo`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as minApi };
export type EchoPostApiResponse = unknown;
export type EchoPostApiArg = {
  body: [];
};
export const { useEchoPostMutation } = injectedRtkApi;

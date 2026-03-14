import { emptySplitApi as api } from "./emptySsoApi";
export const addTagTypes = ["Auth"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      authRevoke: build.mutation<AuthRevokeApiResponse, AuthRevokeApiArg>({
        query: () => ({ url: `/user-service/auth/revoke`, method: "POST" }),
        invalidatesTags: ["Auth"],
      }),
      authRegister: build.mutation<AuthRegisterApiResponse, AuthRegisterApiArg>(
        {
          query: (queryArg) => ({
            url: `/user-service/auth/register`,
            method: "POST",
            body: queryArg.ssoRegisterBody,
          }),
          invalidatesTags: ["Auth"],
        },
      ),
      authLogin: build.mutation<AuthLoginApiResponse, AuthLoginApiArg>({
        query: (queryArg) => ({
          url: `/user-service/auth/login`,
          method: "POST",
          body: queryArg.ssoLoginBody,
        }),
        invalidatesTags: ["Auth"],
      }),
      authValidateSession: build.query<
        AuthValidateSessionApiResponse,
        AuthValidateSessionApiArg
      >({
        query: () => ({ url: `/user-service/auth/validate` }),
        providesTags: ["Auth"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedSsoApi };
export type AuthRevokeApiResponse = unknown;
export type AuthRevokeApiArg = void;
export type AuthRegisterApiResponse = unknown;
export type AuthRegisterApiArg = {
  ssoRegisterBody: SsoRegisterBody;
};
export type AuthLoginApiResponse = unknown;
export type AuthLoginApiArg = {
  ssoLoginBody: SsoLoginBody;
};
export type AuthValidateSessionApiResponse = unknown;
export type AuthValidateSessionApiArg = void;
export type BffErrorBody = {
  message?: string;
  code?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};
export type SsoRegisterBody = {
  name: string;
  email: string;
  password: string;
};
export type SsoLoginBody = {
  email: string;
  password: string;
};
export const {
  useAuthRevokeMutation,
  useAuthRegisterMutation,
  useAuthLoginMutation,
  useAuthValidateSessionQuery,
} = injectedRtkApi;

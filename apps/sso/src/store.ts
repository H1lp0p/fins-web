import { configureStore } from "@reduxjs/toolkit";
import { generatedSsoApi, initSsoBffApi } from "@fins/api/sso";

initSsoBffApi({
  
  baseUrl: import.meta.env.VITE_BFF_URL ?? "/api",
});

export const store = configureStore({
  reducer: {
    [generatedSsoApi.reducerPath]: generatedSsoApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(generatedSsoApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

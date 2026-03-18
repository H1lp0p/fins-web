import { configureStore } from "@reduxjs/toolkit";
import { generatedPublicApi, initPublicBffApi } from "@fins/api";

initPublicBffApi({
  baseUrl: import.meta.env.VITE_BFF_URL ?? "/api",
});

export const store = configureStore({
  reducer: {
    [generatedPublicApi.reducerPath]: generatedPublicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(generatedPublicApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

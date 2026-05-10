import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { resolveDevPublicOriginServer } from "../../tools/vite-dev-public-origin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const bffTarget =
    env.BFF_ORIGIN ?? process.env.BFF_ORIGIN ?? "http://127.0.0.1:8009";
  const publicServer = resolveDevPublicOriginServer(env.DEV_PUBLIC_ORIGIN);

  return {
    plugins: [react()],
    server: {
      ...(publicServer ?? {}),
      proxy: {
        "/api": {
          target: bffTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});

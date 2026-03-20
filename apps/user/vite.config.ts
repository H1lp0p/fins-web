import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Локальный BFF (`uvicorn … --port 8000`). Переопределение: `BFF_ORIGIN=http://127.0.0.1:9000 pnpm dev` */
const bffTarget = process.env.BFF_ORIGIN ?? "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: bffTarget,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

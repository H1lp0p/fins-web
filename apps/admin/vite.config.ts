import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const bffTarget = process.env.BFF_ORIGIN ?? "http://127.0.0.1:8009";

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

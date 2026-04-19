import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@reduxjs/toolkit",
  "@reduxjs/toolkit/query",
  "@reduxjs/toolkit/query/react",
  "react-redux",
  "firebase/app",
  "firebase/messaging",
];

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.json",
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(rootDir, "src/index.ts"),
        sso: resolve(rootDir, "src/sso.ts"),
        ws: resolve(rootDir, "src/ws.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external,
    },
  },
});

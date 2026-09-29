import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

// Electron is launched only on desktop platforms (local dev on Windows/macOS).
// In the Linux web preview sandbox Electron can't run, so it is skipped there.
const isDesktop = process.platform === "win32" || process.platform === "darwin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    isDesktop && electron([
      {
        entry: "electron/main.js",
      },
      {
        entry: "electron/preload.js",
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));

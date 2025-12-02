import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: "src/client",
  build: {
    outDir: path.resolve(__dirname, "dist/client"), // ← вот сюда!
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "src/client/index.html"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        // Это важно для Windows + Docker
        configure: (proxy, options) => {
          proxy.on("error", (err) => {
            console.log("Proxy error:", err);
          });
        },
      },
    },
  },
});

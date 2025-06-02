import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/categories": {
        target: "http://server:8080",
        changeOrigin: true,
      },
      "/quiz": {
        target: "http://server:8080",
        changeOrigin: true,
      },
    },
  },
});

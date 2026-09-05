import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/route": "http://localhost:3000",
    },
  },
});
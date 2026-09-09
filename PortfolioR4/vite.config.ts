import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// El proxy conserva el mismo origen para las cookies y las subidas.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    proxy: {
      "/api": "http://127.0.0.1:3001",
      "/uploads": "http://127.0.0.1:3001",
    },
  },
});

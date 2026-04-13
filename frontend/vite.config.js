import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default {
  base: "/trip-tracker/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  }
};
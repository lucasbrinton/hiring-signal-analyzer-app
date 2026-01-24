import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  // Ensure shared TypeScript files are processed
  optimizeDeps: {
    include: [],
    exclude: [],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
    },
    // Enable watching the shared folder
    watch: {
      ignored: ["!**/shared/**"],
    },
  },
  // Include shared folder in build
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
  },
});

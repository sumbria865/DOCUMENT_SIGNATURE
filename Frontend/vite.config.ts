import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: "dist",
    souremap: true,
  },

  // ✅ Helps react-pdf / pdfjs worker
  optimizeDeps: {
    include: ["pdfjs-dist"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

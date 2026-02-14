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
    sourcemap: true,
  },

  optimizeDeps: {
    include: ["pdfjs-dist"],
    exclude: ["pdfjs-dist/build/pdf.worker.min.mjs"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
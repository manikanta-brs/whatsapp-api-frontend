import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173, // Ensures dev mode runs on 5173
    strictPort: true,
    allowedHosts: ["whatsapp-api-frontend.onrender.com"],
  },
  preview: {
    port: 5173, // Ensures preview mode runs on 5173
  },
  build: {
    chunkSizeWarningLimit: 600,
  },
});

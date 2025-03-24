import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0", // Allows access from network
    port: 5173, // Default Vite port, change if needed
    strictPort: true, // Ensures it doesn't switch to a different port
  },
});

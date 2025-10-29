import path from "path";
import tailwindcss from "@tailwindcss/vite";  // Importing TailwindCSS plugin for Vite
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';  // React plugin for Vite

// Vite configuration
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Aliases `@` to the `src/` directory
    },
  },
});

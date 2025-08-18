import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This makes the environment variable from the build server (like Netlify)
    // available in the browser-side code, fixing the API_KEY access issue.
    // It now reads VITE_API_KEY, which is the standard for Vite projects.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY),
    'process.env.PEXELS_API_KEY': JSON.stringify(process.env.VITE_PEXELS_API_KEY),
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from GitHub Pages under /rosary/. When developing locally Vite uses
// this base too, so the dev URL is http://localhost:5173/rosary/.
export default defineConfig({
  base: '/rosary/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});

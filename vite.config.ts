import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served from GitHub Pages under /rosary/. When developing locally Vite uses
// this base too, so the dev URL is http://localhost:5173/rosary/.
export default defineConfig({
  base: '/rosary/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Rosary · Metanier',
        short_name: 'Rosary',
        description:
          'A virtual prayer rope — choose the beads, pick a prayer, and pray bead by bead. English & Română.',
        lang: 'en',
        theme_color: '#220810',
        background_color: '#220810',
        display: 'standalone',
        orientation: 'portrait',
        // Project-page paths: scope and entry both live under /rosary/.
        scope: '/rosary/',
        start_url: '/rosary/',
        categories: ['lifestyle', 'education'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the built shell so the app opens offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // The only network calls are Google Fonts — cache them at runtime.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});

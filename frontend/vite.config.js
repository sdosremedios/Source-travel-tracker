import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: "/travel-tracker/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The manifest needs to be inside the PWA config
      scope: '/travel-tracker/',
      includeAssets: ['favicon.png', 'pwa-16x16.png', 'pwa-32x32.png', 'pwa-192x192.png', 'pwa-256x256.png'],
      manifest: {
        name: 'Travel Tracker',
        id: '/travel-tracker/',
        short_name: 'Travel Tracker',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        // Make sure these paths are relative to your 'public' folder
        icons: [
          {
            src: '/travel-tracker/pwa-16x16.png',
            sizes: '16x16',
            type: 'image/png'
          },
          {
            src: '/travel-tracker/pwa-32x32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/travel-tracker/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/travel-tracker/pwa-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});

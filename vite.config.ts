import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Update this to match your GitHub repo name so assets resolve correctly on
// GitHub Pages, e.g. if your repo is github.com/you/flag-trainer, this stays
// '/flag-trainer/'. If you deploy to a custom domain or a <username>.github.io
// root repo instead, change this to '/'.
const BASE_PATH = '/flag-trainer/'

export default defineConfig({
  base: '/Flaggy/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Deliberately no manifest: real offline-after-first-visit via a
      // precaching service worker is a v1 requirement, but installability
      // (icons, "Add to Home Screen") is a deferred v2 feature. Setting
      // manifest to false keeps this plugin to just the service worker.
      manifest: false,
      workbox: {
        // Precache the whole app shell + the country data JSON so a repeat
        // visit works with zero network, not just a warm HTTP cache.
        globPatterns: ['**/*.{js,css,html,svg,json,woff2}'],
      },
    }),
  ],
})

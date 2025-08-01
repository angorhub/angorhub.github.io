import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vitest/config"
import { VitePWA } from 'vite-plugin-pwa'
/// <reference types="vitest" />

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'logo-name-dark.svg', 'logo-name-light.svg', 'offline.html', 'offline.js'],
      manifest: {
        name: 'Angor Hub',
        short_name: 'Angor Hub',
        description: 'Decentralized Bitcoin crowdfunding platform powered by Nostr. Fund innovative projects and support creators with complete transparency and security.',
        theme_color: '#086c81',
        background_color: '#cbdde1',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['finance', 'crowdfunding', 'bitcoin'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        skipWaiting: false,
        clientsClaim: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources'
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api/deny': {
        target: 'https://lists.blockcore.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deny/, '/deny')
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    onConsoleLog(log: string) {
      return !log.includes("React Router Future Flag Warning");
    },
  }
})
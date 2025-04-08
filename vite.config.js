import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/fiboflow/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'FiboFlow',
        short_name: 'FiboFlow',
        description: 'A Fibonacci number merging game',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/fiboflow/',
        scope: '/fiboflow/',
        orientation: 'portrait',
        categories: ['games', 'puzzle'],
        screenshots: [
          {
            src: 'screenshot1.png',
            sizes: '1280x720',
            type: 'image/png',
            platform: 'wide',
            label: 'Game Screenshot'
          }
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{js,css,html}',
          'assets/*.{ico,png,svg}',
          '*.webmanifest'
        ],
        globIgnores: [
          '**/node_modules/**/*',
          'sw.js',
          'workbox-*.js'
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/gustavokrause\.github\.io\/fiboflow\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              networkTimeoutSeconds: 10,
              matchOptions: {
                ignoreSearch: true
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Listen on all local IPs
    port: 5173, // Default Vite port
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
}) 
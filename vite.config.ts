import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(), 
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'tonjam-icon.png', 'default_tonjam_banner.jpg'],
          manifest: {
            id: '/',
            name: 'TonJam | Decentralized Music Marketplace & NFT Platform',
            short_name: 'TonJam',
            description: 'Decentralized music marketplace on the TON blockchain. Discover, buy, and sell music NFTs from top Web3 artists.',
            theme_color: '#000000',
            background_color: '#000000',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/tonjam-icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
              },
              {
                src: '/tonjam-icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              }
            ]
          },
          workbox: {
            maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
            globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,woff,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'dicebear-avatar-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7,
                  },
                },
              }
            ]
          },
          devOptions: {
            enabled: true,
            type: 'module',
          },
        })
      ],
      logLevel: 'silent',
      build: {
        target: 'esnext',
        minify: false,
        sourcemap: false,
        cssCodeSplit: true,
        rollupOptions: {
          maxParallelFileOps: 1,
          cache: false,
        }
      },
      define: {
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
          'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
          'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
        },
        dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom']
      }
    };
});

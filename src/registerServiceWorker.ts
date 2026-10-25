// TonJam PWA Service Worker Registration Utility
// Registers the service worker, defines core application shell assets for precaching, and logs detailed Cache Hit/Miss audit info in console.

export const CACHE_CONFIG = {
  strategy: 'cache-first' as const,
  priorityCacheAssets: true,
  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
} as const;

export const CORE_UI_ASSETS: readonly string[] = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-tonjam.png',
  '/tonjam-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/default_tonjam_banner.jpg',
  '/tonjam-offline-audio.mp3'
] as const;

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // Listen for detailed Cache Hit/Miss messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_STATUS_LOG') {
        const { url, status, cacheName, assetType } = event.data;
        if (status === 'hit') {
          console.log(`[TonJam PWA Cache Audit] Cache Hit - URL: ${url} | Cache Name: ${cacheName} | Type: ${assetType || 'Resource'}`);
        } else {
          console.log(`[TonJam PWA Cache Audit] Cache Miss - URL: ${url} | Cache Name: ${cacheName} | Type: ${assetType || 'Resource'}`);
        }
      }
    });

    window.addEventListener('load', () => {
      console.log(`[TonJam PWA Cache Audit] Verifying ${CORE_UI_ASSETS.length} core application shell assets for precaching:`, CORE_UI_ASSETS);
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[TonJam PWA Cache Audit] Service worker registered successfully with scope:', registration.scope);
          
          if (registration.active) {
            registration.active.postMessage({
              type: 'INIT_CACHE_STRATEGY',
              config: CACHE_CONFIG,
              assets: CORE_UI_ASSETS
            });
            console.log('[TonJam PWA Cache Audit] Core UI assets & app shell successfully submitted to cache strategy.');
          }
        })
        .catch((error) => {
          console.warn('[TonJam PWA Cache Audit] Service worker registration failed:', error);
        });
    });
  }
}

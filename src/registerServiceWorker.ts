// TonJam PWA Service Worker Registration Utility
// Consolidate service worker lifecycle management, DEV cleanup, and production caching.

export const CACHE_CONFIG = {
  strategy: 'network-first-shell' as const,
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

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Development Mode: unregister all service workers and purge caches to prevent HMR / dev module caching conflicts
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[TonJam SW Dev] Service worker unregistered for development session.');
        });
      }
    }).catch((err) => {
      console.warn('[TonJam SW Dev] Failed to query registrations:', err);
    });

    if ('caches' in window) {
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      }).catch(() => {});
    }
    return;
  }

  // Production Mode: Listen for Cache Audit messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_STATUS_LOG') {
      const { url, status, cacheName, assetType } = event.data;
      if (status === 'hit') {
        console.log(`[TonJam PWA Cache Audit] Hit: ${url} (${assetType || 'Resource'}) [${cacheName}]`);
      } else {
        console.log(`[TonJam PWA Cache Audit] Miss: ${url} (${assetType || 'Resource'}) [${cacheName}]`);
      }
    }
  });

  const performRegistration = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[TonJam PWA] Service worker registered successfully with scope:', registration.scope);

        // Notify active worker of config
        if (registration.active) {
          registration.active.postMessage({
            type: 'INIT_CACHE_STRATEGY',
            config: CACHE_CONFIG,
            assets: CORE_UI_ASSETS
          });
        }

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[TonJam PWA] New version installed and ready for activation.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[TonJam PWA] Service worker registration failed:', error);
      });
  };

  if (document.readyState === 'complete') {
    performRegistration();
  } else {
    window.addEventListener('load', performRegistration);
  }
}


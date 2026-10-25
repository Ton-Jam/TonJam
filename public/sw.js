// TonJam Service Worker - Offline Asset Precaching & Cache Management
// Precaches key UI assets, logo, nav icons, CSS/JS shell for robust offline capability on TON mobile network.

const CACHE_NAME = 'tonjam-cache-v4';
const ASSETS_TO_PRECACHE = [
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
];

function getAssetType(urlStr) {
  const lower = urlStr.toLowerCase();
  if (lower.endsWith('.css')) return 'CSS Stylesheet';
  if (lower.endsWith('.js')) return 'JavaScript Module';
  if (lower.includes('icon') || lower.includes('logo') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'Logo / Icon Asset';
  if (lower.endsWith('.mp3') || lower.endsWith('.wav')) return 'Audio Asset';
  if (lower.endsWith('/') || lower.endsWith('.html')) return 'Application Shell (HTML)';
  return 'Static Resource';
}

function notifyClients(payload) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage(payload));
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[TonJam SW] Precaching core application shell & UI assets into ${CACHE_NAME}:`, ASSETS_TO_PRECACHE);
        return cache.addAll(ASSETS_TO_PRECACHE.map(url => new Request(url, { cache: 'reload' })))
          .then(() => {
            console.log(`[TonJam SW] Core application shell precached successfully into ${CACHE_NAME}.`);
          })
          .catch((err) => {
            console.warn('[TonJam SW] Some assets failed to precache:', err);
          });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.includes('tonjam')) {
            console.log('[TonJam SW] Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'INIT_CACHE_STRATEGY' && Array.isArray(event.data.assets)) {
      console.log(`[TonJam SW] Initializing cache strategy with assets into ${CACHE_NAME}:`, event.data.assets);
      caches.open(CACHE_NAME).then((cache) => {
        cache.addAll(event.data.assets.map(url => new Request(url, { cache: 'reload' }))).then(() => {
          console.log(`[TonJam SW] Dynamic assets successfully cached via INIT_CACHE_STRATEGY into ${CACHE_NAME}.`);
        }).catch(() => {});
      });
    } else if (event.data.type === 'SET_PRECACHE_ASSETS' && Array.isArray(event.data.assets)) {
      caches.open(CACHE_NAME).then((cache) => {
        cache.addAll(event.data.assets.map(url => new Request(url, { cache: 'reload' }))).catch(() => {});
      });
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests, Firebase API calls, TonConnect RPC, or WebSocket traffic
  if (url.origin !== location.origin || url.pathname.includes('/api/') || url.pathname.includes('firestore') || url.pathname.includes('firebase')) {
    return;
  }

  // Cache-first strategy for static assets and UI shell, network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const assetType = getAssetType(event.request.url);
      if (cachedResponse) {
        console.log(`[TonJam SW] Cache Hit - URL: ${event.request.url} | Cache Name: ${CACHE_NAME} | Type: ${assetType}`);
        notifyClients({ type: 'CACHE_STATUS_LOG', url: event.request.url, status: 'hit', cacheName: CACHE_NAME, assetType });

        // Return cached asset and update in background if online
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      console.log(`[TonJam SW] Cache Miss - URL: ${event.request.url} | Cache Name: ${CACHE_NAME} | Type: ${assetType}`);
      notifyClients({ type: 'CACHE_STATUS_LOG', url: event.request.url, status: 'miss', cacheName: CACHE_NAME, assetType });

      return fetch(event.request).then((networkResponse) => {
        // Cache newly fetched successful GET responses for static files
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests when offline
        if (event.request.mode === 'navigate') {
          console.warn('[TonJam SW] Navigation request failed offline, falling back to /index.html');
          return caches.match('/index.html');
        }
        return new Response('Offline content unavailable', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

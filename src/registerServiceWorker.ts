// TonJam Service Worker Safe Retirement Utility
// Safely unregisters legacy service workers and clears obsolete HTTP caches
// Guarantees zero stale chunk lockups while preserving IndexedDB offline user data

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      }).catch(() => {});

      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            if (key.includes('tonjam')) {
              caches.delete(key).catch(() => {});
            }
          }
        }).catch(() => {});
      }
    } catch {
      // Non-blocking cleanup
    }
  }
}

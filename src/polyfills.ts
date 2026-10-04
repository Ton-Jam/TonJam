import { Buffer } from 'buffer';
import { memoryLocalStorage, memorySessionStorage } from './lib/safeStorage';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  
  if (typeof window.global === 'undefined') {
    (window as any).global = window;
  }
  
  if (typeof window.process === 'undefined') {
    (window as any).process = {
      env: { NODE_DEBUG: undefined },
      browser: true,
      version: '',
      nextTick: (cb: any) => setTimeout(cb, 0),
    };
  }

  // Safe fallback for localStorage/sessionStorage in cross-origin sandboxed iframes
  try {
    const testKey = '__tonjam_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
  } catch {
    try {
      Object.defineProperty(window, 'localStorage', {
        get: () => memoryLocalStorage,
        configurable: true,
        enumerable: true,
      });
    } catch {
      try {
        (window as any).localStorage = memoryLocalStorage;
      } catch {}
    }
  }

  try {
    const testKey = '__tonjam_session_test__';
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
  } catch {
    try {
      Object.defineProperty(window, 'sessionStorage', {
        get: () => memorySessionStorage,
        configurable: true,
        enumerable: true,
      });
    } catch {
      try {
        (window as any).sessionStorage = memorySessionStorage;
      } catch {}
    }
  }
}

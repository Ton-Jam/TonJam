import { Buffer } from 'buffer';

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
  const createMemoryStorage = () => {
    const data: Record<string, string> = {};
    return {
      getItem: (k: string) => (k in data ? data[k] : null),
      setItem: (k: string, v: string) => { data[k] = String(v); },
      removeItem: (k: string) => { delete data[k]; },
      clear: () => { Object.keys(data).forEach(k => delete data[k]); },
      key: (i: number) => Object.keys(data)[i] ?? null,
      get length() { return Object.keys(data).length; }
    };
  };

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
  } catch {
    try {
      Object.defineProperty(window, 'localStorage', {
        value: createMemoryStorage(),
        configurable: true,
        writable: true,
      });
    } catch {
      // Safe fallback
    }
  }

  try {
    const testKey = '__session_test__';
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
  } catch {
    try {
      Object.defineProperty(window, 'sessionStorage', {
        value: createMemoryStorage(),
        configurable: true,
        writable: true,
      });
    } catch {
      // Safe fallback
    }
  }
}

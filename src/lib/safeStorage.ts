/**
 * Safe in-memory storage fallback for restricted / sandboxed iframe environments (e.g. AI Studio)
 */
class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

export const memoryLocalStorage = new MemoryStorage();
export const memorySessionStorage = new MemoryStorage();

export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const storage = window[type];
    if (!storage) return false;
    const testKey = `__tonjam_test_${type}__`;
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const getSafeLocalStorage = (): Storage => {
  if (typeof window !== 'undefined' && isStorageAvailable('localStorage')) {
    try {
      return window.localStorage;
    } catch {
      return memoryLocalStorage;
    }
  }
  return memoryLocalStorage;
};

export const getSafeSessionStorage = (): Storage => {
  if (typeof window !== 'undefined' && isStorageAvailable('sessionStorage')) {
    try {
      return window.sessionStorage;
    } catch {
      return memorySessionStorage;
    }
  }
  return memorySessionStorage;
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return getSafeLocalStorage().getItem(key);
    } catch {
      return memoryLocalStorage.getItem(key);
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      getSafeLocalStorage().setItem(key, value);
    } catch {
      memoryLocalStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    try {
      getSafeLocalStorage().removeItem(key);
    } catch {
      memoryLocalStorage.removeItem(key);
    }
  },
  clear: (): void => {
    try {
      getSafeLocalStorage().clear();
    } catch {
      memoryLocalStorage.clear();
    }
  },
  key: (index: number): string | null => {
    try {
      return getSafeLocalStorage().key(index);
    } catch {
      return memoryLocalStorage.key(index);
    }
  },
  get length(): number {
    try {
      return getSafeLocalStorage().length;
    } catch {
      return memoryLocalStorage.length;
    }
  }
};

export default safeLocalStorage;

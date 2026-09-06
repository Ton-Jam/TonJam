/**
 * Centralized Logger & Console Noise Filter Utility
 * 
 * Filters out known, non-critical noisy console warnings and errors
 * (such as disabled HMR websocket attempts, offline firestore notifications,
 * TonConnect analytics heartbeat drops, and benign rate-limit notices)
 * while preserving critical application errors and developer logs.
 */

export interface LogFilterOptions {
  enableDebugLogs?: boolean;
  ignoredPatterns?: (string | RegExp)[];
}

// Known noisy patterns that do not represent actionable application failures
const DEFAULT_NOISE_PATTERNS: (string | RegExp)[] = [
  // Vite HMR disabled in environment
  /\[vite\] failed to connect to websocket/i,
  /\[vite\] connecting\.\.\./i,
  
  // TonConnect SDK tracking & polling heartbeat failures
  /TON_CONNECT_SDK/i,
  /tonconnect/i,
  /bridge\.tonapi\.io/i,
  /tonconnect-bridge/i,

  // Firebase / Firestore transient offline operation notices
  /Could not reach Cloud Firestore backend/i,
  /The client will operate in offline mode/i,
  /auth\/network-request-failed/i,
  /Firestore \(\d+\.\d+\.\d+\):/i,

  // AI & Rate limit circuit breakers / graceful fallbacks
  /RESOURCE_EXHAUSTED/i,
  /Circuit breaker/i,
  /Gemini 429/i,
  /quota exceeded/i,

  // Harmless browser audio context autoplay policy notices
  /The AudioContext was not allowed to start/i,

  // Benign browser extension & observer messages
  /ResizeObserver loop completed with undelivered notifications/i,
  /Download the React DevTools/i,
  /chrome-extension:\/\//i,
  /moz-extension:\/\//i,
];

let isFilterInstalled = false;
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

/**
 * Checks if the passed arguments contain text matching any known noise pattern.
 */
export function isNoisyLog(...args: unknown[]): boolean {
  if (typeof window !== 'undefined' && (window as unknown as { __DEBUG_LOGS__?: boolean }).__DEBUG_LOGS__) {
    return false;
  }

  const collectedText = args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return `${arg.name} ${arg.message} ${arg.stack || ''}`;
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');

  return DEFAULT_NOISE_PATTERNS.some((pattern) => {
    if (typeof pattern === 'string') {
      return collectedText.includes(pattern);
    }
    return pattern.test(collectedText);
  });
}

/**
 * Installs global console filters for console.log, console.info, console.warn, and console.error.
 */
export function installGlobalLoggerFilter(): void {
  if (isFilterInstalled || typeof window === 'undefined') {
    return;
  }

  isFilterInstalled = true;

  // Intercept window unhandled promise rejections for noisy SDK failures
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (isNoisyLog(reason)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  console.log = (...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.log.apply(console, args);
    }
  };

  console.info = (...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.info.apply(console, args);
    }
  };

  console.warn = (...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.warn.apply(console, args);
    }
  };

  console.error = (...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.error.apply(console, args);
    }
  };

  console.debug = (...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.debug.apply(console, args);
    }
  };
}

/**
 * Restores original unpatched console methods.
 */
export function restoreConsole(): void {
  if (!isFilterInstalled) return;
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
  isFilterInstalled = false;
}

/**
 * Scoped application logger
 */
export const logger = {
  raw: originalConsole,
  isNoisy: isNoisyLog,
  install: installGlobalLoggerFilter,
  restore: restoreConsole,

  debug: (scope: string, ...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.debug(`%c[${scope}]`, 'color: #94a3b8; font-weight: bold;', ...args);
    }
  },

  info: (scope: string, ...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.info(`%c[${scope}]`, 'color: #38bdf8; font-weight: bold;', ...args);
    }
  },

  warn: (scope: string, ...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.warn(`%c[${scope}]`, 'color: #facc15; font-weight: bold;', ...args);
    }
  },

  error: (scope: string, ...args: unknown[]) => {
    if (!isNoisyLog(...args)) {
      originalConsole.error(`%c[${scope}]`, 'color: #f87171; font-weight: bold;', ...args);
    }
  },
};

// Automatically install filters when loaded in browser environments
if (typeof window !== 'undefined') {
  installGlobalLoggerFilter();
}

export default logger;

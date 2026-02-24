import './src/polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

/**
 * TON Connect SDK Analytics Error Suppression
 * The SDK attempts to send analytics to its backend, which often fails in
 * restricted environments (previews, sandboxes, or ad-blockers).
 * These "Failed to fetch" errors are non-critical.
 */
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const isSDKError = reason && (
    (typeof reason === 'string' && (reason.includes('TON_CONNECT_SDK') || reason.includes('tonconnect'))) ||
    (reason.message && (reason.message.includes('TON_CONNECT_SDK') || reason.message.includes('tonconnect') || reason.message.includes('Failed to fetch'))) ||
    (reason.stack && reason.stack.includes('tonconnect'))
  );

  if (isSDKError) {
    // Prevent the error from appearing in the console
    event.preventDefault();
    event.stopPropagation();
  }
});

// Also intercept console.error for these specific SDK messages
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('TON_CONNECT_SDK') || message.includes('tonconnect')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * TON Connect 2.0 Manifest Resolution
 * Requested Canonical URL: https://ton-jam.vercel.app
 */
const getManifestUrl = () => {
  try {
    const manifest = {
      url: "https://ton-jam.vercel.app",
      name: "TonJam",
      iconUrl: "https://i.postimg.cc/63GsZHzq/TonJam-icon.png",
      description: "Web3 Music & NFT Marketplace on TON"
    };

    const jsonString = JSON.stringify(manifest);
    // Robust Base64 encoding for Data URI
    const base64Manifest = btoa(unescape(encodeURIComponent(jsonString)));

    return `data:application/json;base64,${base64Manifest}`;
  } catch (e) {
    // Fallback to static file if dynamic generation fails
    return "/tonconnect-manifest.json";
  }
};

const manifestUrl = getManifestUrl();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      enableAnalytics={false}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/tonjam_bot'
      }}
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);
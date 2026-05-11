import './polyfills';
import './index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

/**
 * TON Connect SDK Analytics Error Suppression
 */
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const isSDKError = reason && (
    (typeof reason === 'string' && (reason.includes('TON_CONNECT_SDK') || reason.includes('tonconnect'))) ||
    (reason.message && (reason.message.includes('TON_CONNECT_SDK') || reason.message.includes('tonconnect') || reason.message.includes('Failed to fetch'))) ||
    (reason.stack && reason.stack.includes('tonconnect'))
  );

  if (isSDKError) {
    event.preventDefault();
    event.stopPropagation();
  }
});

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('Could not reach Cloud Firestore backend') ||
    message.includes('auth/network-request-failed') ||
    message.includes('The client will operate in offline mode')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('TON_CONNECT_SDK') || 
    message.includes('tonconnect') ||
    message.includes('Could not reach Cloud Firestore backend') ||
    message.includes('auth/network-request-failed')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

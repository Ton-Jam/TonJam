import './polyfills';
import './lib/logger';
import './index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { runFirebaseDiagnostics } from './lib/firebase-debug';

// Run non-blocking Firebase startup diagnostics
runFirebaseDiagnostics().catch(() => {});

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

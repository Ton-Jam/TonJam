import './polyfills';
import './lib/logger';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { runFirebaseDiagnostics } from './lib/firebase-debug';

// Run non-blocking Firebase startup diagnostics
runFirebaseDiagnostics().catch(() => {});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (mountErr: any) {
  console.error('[TonJam Boot] Critical mount failure:', mountErr);
  rootElement.innerHTML = `
    <div style="min-height:100vh;background:#07111F;color:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;text-align:center;">
      <div style="max-width:500px;background:rgba(10,22,40,0.85);border:1px solid rgba(255,255,255,0.12);padding:32px;border-radius:12px;">
        <div style="font-size:36px;margin-bottom:12px;">⚠️</div>
        <h2 style="font-size:18px;font-weight:800;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">TonJam Runtime Mount Error</h2>
        <p style="font-size:13px;color:#94a3b8;margin-bottom:24px;line-height:1.5;">${mountErr?.message || 'Failed to mount React application root.'}</p>
        <button onclick="localStorage.clear();sessionStorage.clear();window.location.reload();" style="padding:12px 24px;background:#0088CC;color:white;border:none;border-radius:6px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;">Clear Storage & Reload</button>
      </div>
    </div>
  `;
}

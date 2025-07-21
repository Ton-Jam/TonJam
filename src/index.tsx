import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { FollowProvider } from './context/FollowContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FollowProvider>
        <AudioPlayerProvider>
          <App />
        </AudioPlayerProvider>
      </FollowProvider>
    </AuthProvider>
  </React.StrictMode>
);

import React, { Component, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import { AuthProvider } from './context/AuthContext';
import { FollowProvider } from './context/FollowContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import './App.css';
import { supabase } from './utils/supabaseClient';

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh. Check console for details.</h1>;
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  console.log('App component rendering...');
  return (
    <AuthProvider supabase={supabase}>
      <FollowProvider>
        <AudioPlayerProvider>
          <Router>
            <div className="app-container">
              <main className="main-content">
                <ErrorBoundary fallback={<h1>Something went wrong. Please refresh. Check console for details.</h1>}>
                  <Routes>
                    <Route path="/home" element={<HomeScreen />} />
                  </Routes>
                </ErrorBoundary>
              </main>
            </div>
          </Router>
        </AudioPlayerProvider>
      </FollowProvider>
    </AuthProvider>
  );
};

export default App;

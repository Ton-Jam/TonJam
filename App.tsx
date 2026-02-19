import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import JamSpace from './pages/JamSpace';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import ArtistProfile from './pages/ArtistProfile';
import Library from './pages/Library';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import NFTDetail from './pages/NFTDetail';
import ExploreList from './pages/ExploreList';
import Notifications from './pages/Notifications';
import ProtocolForge from './pages/ProtocolForge';
import LoadingScreen from './components/LoadingScreen';
import { AudioProvider } from './context/AudioContext';

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('tonjam_theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // Simulate initial asset loading
    const timer = setTimeout(() => setIsAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading) return <LoadingScreen />;

  return (
    <AudioProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/jamspace" element={<JamSpace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/nft/:id" element={<NFTDetail />} />
            <Route path="/explore/:type" element={<ExploreList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/forge" element={<ProtocolForge />} />
          </Routes>
        </Layout>
      </Router>
    </AudioProvider>
  );
};

export default App;
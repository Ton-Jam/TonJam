import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import JamSpace from '@/pages/JamSpace';
import Marketplace from '@/pages/Marketplace';
import Profile from '@/pages/Profile';
import UserProfile from '@/pages/UserProfile';
import ArtistProfile from '@/pages/ArtistProfile';
import ArtistDashboard from '@/pages/ArtistDashboard';
import Library from '@/pages/Library';
import Settings from '@/pages/Settings';
import Tasks from '@/pages/Tasks';
import NFTDetail from '@/pages/NFTDetail';
import ExploreList from '@/pages/ExploreList';
import Notifications from '@/pages/Notifications';
import ProtocolForge from '@/pages/ProtocolForge';
import LoadingScreen from '@/components/LoadingScreen';
import PlaylistDetail from '@/pages/PlaylistDetail';
import PostDetail from '@/pages/PostDetail';
import TrackDetail from '@/pages/TrackDetail';
import AdminDashboard from '@/pages/AdminDashboard';
import Wallet from '@/pages/Wallet';
import Staking from '@/pages/Staking';
import { AudioProvider } from '@/context/AudioContext';
import { AuthProvider } from '@/context/AuthContext';
import ArtistOnboarding from '@/pages/ArtistOnboarding';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial asset loading
    const timer = setTimeout(() => setIsAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading) return <LoadingScreen />;

  return (
    <TonConnectUIProvider manifestUrl="https://ton-jam.vercel.app/tonconnect-manifest.json">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <AudioProvider>
            <Toaster theme="dark" position="top-right" />
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
                  <Route path="/user/:id" element={<UserProfile />} />
                  <Route path="/artist/:id" element={<ArtistProfile />} />
                  <Route path="/artist-dashboard" element={<ArtistDashboard />} />
                  <Route path="/artist-onboarding" element={<ArtistOnboarding />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/staking" element={<Staking />} />
                  <Route path="/playlist/:id" element={<PlaylistDetail />} />
                  <Route path="/track/:id" element={<TrackDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/forge" element={<ProtocolForge />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </Layout>
            </Router>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </TonConnectUIProvider>
  );
};

export default App;
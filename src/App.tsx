import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import JamSpace from '@/pages/JamSpace';
import Marketplace from '@/pages/Marketplace';
import Profile from '@/pages/Profile';
import UserProfile from '@/pages/UserProfile';
import ArtistProfile from '@/pages/ArtistProfile';
import ArtistDashboard from '@/pages/ArtistDashboard';
import ProfileSettings from '@/pages/ProfileSettings';
import Library from '@/pages/Library';
import Settings from '@/pages/Settings';
import Tasks from '@/pages/Tasks';
import NFTDetail from '@/pages/NFTDetail';
import ExploreList from '@/pages/ExploreList';
import Notifications from '@/pages/Notifications';
import UploadTrack from '@/pages/UploadTrack';
import MintNFT from '@/pages/MintNFT';
import LoadingScreen from '@/components/LoadingScreen';
import PlaylistDetail from '@/pages/PlaylistDetail';
import PostDetail from '@/pages/PostDetail';
import SocialFeedPage from '@/pages/SocialFeedPage';
import TrackDetail from '@/pages/TrackDetail';
import TrackPlayerScreen from '@/pages/TrackPlayerScreen';
import AdminDashboard from '@/pages/AdminDashboard';
import Wallet from '@/pages/Wallet';
import Staking from '@/pages/Staking';
import About from '@/pages/About';
import { AudioProvider } from '@/context/AudioContext';
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ArtistOnboarding from '@/pages/ArtistOnboarding';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

const AppContent: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSupabaseReachable, setIsSupabaseReachable] = useState(true);

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('tracks').select('id').limit(1);
        if (error) throw error;
        setIsSupabaseReachable(true);
      } catch (error) {
        console.error("Please check your Supabase configuration. The Supabase backend is currently unreachable.", error);
        setIsSupabaseReachable(false);
      }
    };
    testConnection();
    setIsAppLoading(false);
  }, []);

  if (!isSupabaseReachable) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p>The Supabase backend is currently unreachable. Please check your configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isAppLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
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
              <Route path="/upload" element={<UploadTrack />} />
              <Route path="/mint" element={<MintNFT />} />
              <Route path="/library" element={<Library />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/track/:id" element={<TrackDetail />} />
              <Route path="/player" element={<TrackPlayerScreen />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/social" element={<SocialFeedPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Layout>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <AudioProvider>
            <Toaster theme="light" position="top-right" />
            <Router>
              <ScrollToTop />
              <AppContent />
            </Router>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

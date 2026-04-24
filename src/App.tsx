import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import ArtistMinting from '@/pages/ArtistMinting';
import TrendingNFTs from '@/pages/TrendingNFTs';
import LoadingScreen from '@/components/LoadingScreen';
import PlaylistDetail from '@/pages/PlaylistDetail';
import PostDetail from '@/pages/PostDetail';
import SocialFeedPage from '@/pages/SocialFeedPage';
import TrackDetail from '@/pages/TrackDetail';
import TrackPlayerScreen from '@/pages/TrackPlayerScreen';
import AdminDashboard from '@/pages/AdminDashboard';
import Wallet from '@/pages/Wallet';
import ProtectedRoute from '@/components/ProtectedRoute';
import Staking from '@/pages/Staking';
import About from '@/pages/About';
import AlbumDetails from '@/pages/AlbumDetails';
import { AudioProvider } from '@/context/AudioContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ArtistOnboarding from '@/pages/ArtistOnboarding';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { seedDatabase } from '@/services/seedService';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ 
      type: "spring",
      stiffness: 300,
      damping: 30,
      opacity: { duration: 0.2 }
    }}
    className="w-full h-full overflow-x-hidden"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const location = useLocation();

  const { user, userProfile } = useAuth();

  useEffect(() => {
    // Test Firebase connection
    const initBackend = async (retries = 3) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Simple connection test - just read from the users collection
        const q = query(collection(db, 'users'), limit(1));
        await getDocs(q);
        setIsBackendReachable(true);
      } catch (error: any) {
        const isPermissionError = error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions'));
        
        if (!isPermissionError) {
          console.error(`Backend connection attempt failed (${4 - retries}/3):`, error);
        }
        
        // If it's a permission error, it might still be reachable but rules are blocking
        if (isPermissionError) {
          setIsBackendReachable(true);
          return;
        }

        if (retries > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return initBackend(retries - 1);
        }
        
        setIsBackendReachable(false);
      } finally {
        if (retries === 1 || isBackendReachable) {
          setIsAppLoading(false);
        }
      }
    };
    initBackend();
  }, []);

  useEffect(() => {
    // Seed database if empty and user is admin
    const checkAndSeed = async () => {
      if (user && (user.email === 'krusherkrupy@gmail.com' || userProfile?.role === 'admin')) {
        try {
          await seedDatabase();
        } catch (error) {
          console.warn("Seeding failed, likely due to permissions or existing data:", error);
        }
      }
    };
    checkAndSeed();
  }, [user, userProfile]);

  if (!isBackendReachable) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p>The backend is currently unreachable. Please check your configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isAppLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <Layout key="app">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/discover" element={<PageWrapper><Discover /></PageWrapper>} />
              <Route path="/jamspace" element={<PageWrapper><JamSpace /></PageWrapper>} />
              <Route path="/marketplace" element={<PageWrapper><Marketplace /></PageWrapper>} />
              <Route path="/trending-nfts" element={<PageWrapper><TrendingNFTs /></PageWrapper>} />
              <Route path="/nft/:id" element={<PageWrapper><NFTDetail /></PageWrapper>} />
              <Route path="/explore/:type" element={<PageWrapper><ExploreList /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
              <Route path="/user/:id" element={<PageWrapper><UserProfile /></PageWrapper>} />
              <Route path="/artist/:id" element={<PageWrapper><ArtistProfile /></PageWrapper>} />
              <Route path="/artist-dashboard" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistDashboard /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-onboarding" element={<PageWrapper><ProtectedRoute><ArtistOnboarding /></ProtectedRoute></PageWrapper>} />
              <Route path="/upload" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><UploadTrack /></ProtectedRoute></PageWrapper>} />
              <Route path="/mint" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><MintNFT /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-minting" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistMinting /></ProtectedRoute></PageWrapper>} />
              <Route path="/library" element={<PageWrapper><Library /></PageWrapper>} />
              <Route path="/wallet" element={<PageWrapper><ProtectedRoute><Wallet /></ProtectedRoute></PageWrapper>} />
              <Route path="/staking" element={<PageWrapper><ProtectedRoute><Staking /></ProtectedRoute></PageWrapper>} />
              <Route path="/playlist/:id" element={<PageWrapper><PlaylistDetail /></PageWrapper>} />
              <Route path="/album/:id" element={<PageWrapper><AlbumDetails /></PageWrapper>} />
              <Route path="/track/:id" element={<PageWrapper><TrackDetail /></PageWrapper>} />
              <Route path="/player/:id" element={<PageWrapper><TrackPlayerScreen /></PageWrapper>} />
              <Route path="/player" element={<PageWrapper><TrackPlayerScreen /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><ProtectedRoute><Settings /></ProtectedRoute></PageWrapper>} />
              <Route path="/profile-settings" element={<PageWrapper><ProtectedRoute><ProfileSettings /></ProtectedRoute></PageWrapper>} />
              <Route path="/tasks" element={<PageWrapper><Tasks /></PageWrapper>} />
              <Route path="/notifications" element={<PageWrapper><ProtectedRoute><Notifications /></ProtectedRoute></PageWrapper>} />
              <Route path="/post/:id" element={<PageWrapper><PostDetail /></PageWrapper>} />
              <Route path="/social" element={<PageWrapper><SocialFeedPage /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Layout>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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

import * as React from 'react';
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import MyNFTs from '@/pages/MyNFTs';
import ArtistMinting from '@/pages/ArtistMinting';
import TrendingNFTs from '@/pages/TrendingNFTs';
import AuctionScreen from '@/pages/AuctionScreen';
import GenesisScreen from '@/pages/GenesisScreen';
import LimitedNFTs from '@/pages/LimitedNFTs';
import LoadingScreen from '@/components/LoadingScreen';
import PlaylistDetail from '@/pages/PlaylistDetail';
import PostDetail from '@/pages/PostDetail';
import SocialFeedPage from '@/pages/SocialFeedPage';
import TrackDetail from '@/pages/TrackDetail';
import AdminDashboard from '@/pages/AdminDashboard';
import Wallet from '@/pages/Wallet';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import Staking from '@/pages/Staking';
import About from '@/pages/About';
import AlbumDetails from '@/pages/AlbumDetails';
import Governance from '@/pages/Governance';
import { AudioProvider } from '@/context/AudioContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ArtistOnboarding from '@/pages/ArtistOnboarding';
import ArtistAnalytics from '@/pages/ArtistAnalytics';
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
        // Initial grace period for Firebase to settle
        if (retries === 3) await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple connection test - just read from the users collection
        // We use getDocsFromCache first if possible, or just a very fast query
        const q = query(collection(db, 'users'), limit(1));
        await getDocs(q);
        console.log("Backend check successful");
        setIsBackendReachable(true);
        setIsAppLoading(false);
      } catch (error: any) {
        const isPermissionError = error instanceof Error && (
          error.message.includes('permission-denied') || 
          error.message.includes('Missing or insufficient permissions')
        );
        
        // If it's a permission error, it's reachable
        if (isPermissionError) {
          console.log("Backend reached, but permissions limited (expected if not logged in)");
          setIsBackendReachable(true);
          setIsAppLoading(false);
          return;
        }

        console.warn(`Backend connection attempt failed (${4 - retries}/3):`, error.message);
        
        if (retries > 1) {
          // exponentialish backoff
          await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries)));
          return initBackend(retries - 1);
        }
        
        // Even if unreachable, we might want to let the app load in "offline" mode
        // but for this specific UX we show an error.
        setIsBackendReachable(false);
        setIsAppLoading(false);
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
        <div className="text-center p-6 max-w-md border border-border rounded-xl bg-card shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Connection Issue</h1>
          <p className="text-muted-foreground mb-6">
            The platform is having trouble reaching the database. This might be a temporary network issue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
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
              <Route path="/auctions" element={<PageWrapper><AuctionScreen /></PageWrapper>} />
              <Route path="/genesis-forge" element={<PageWrapper><GenesisScreen /></PageWrapper>} />
              <Route path="/limited-editions" element={<PageWrapper><LimitedNFTs /></PageWrapper>} />
              <Route path="/trending-nfts" element={<PageWrapper><TrendingNFTs /></PageWrapper>} />
              <Route path="/nft/:id" element={<PageWrapper><NFTDetail /></PageWrapper>} />
              <Route path="/explore/:type" element={<PageWrapper><ExploreList /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><ProtectedRoute><Profile /></ProtectedRoute></PageWrapper>} />
              <Route path="/user/:id" element={<PageWrapper><UserProfile /></PageWrapper>} />
              <Route path="/artist/:id" element={<PageWrapper><ArtistProfile /></PageWrapper>} />
              <Route path="/artist-dashboard" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistDashboard /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-analytics" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistAnalytics /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-onboarding" element={<PageWrapper><ProtectedRoute><ArtistOnboarding /></ProtectedRoute></PageWrapper>} />
              <Route path="/upload" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><UploadTrack /></ProtectedRoute></PageWrapper>} />
              <Route path="/mint" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><MintNFT /></ProtectedRoute></PageWrapper>} />
              <Route path="/my-nfts" element={<PageWrapper><ProtectedRoute><MyNFTs /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-minting" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistMinting /></ProtectedRoute></PageWrapper>} />
              <Route path="/library" element={<PageWrapper><ProtectedRoute><Library /></ProtectedRoute></PageWrapper>} />
              <Route path="/wallet" element={<PageWrapper><ProtectedRoute><Wallet /></ProtectedRoute></PageWrapper>} />
              <Route path="/staking" element={<PageWrapper><ProtectedRoute><Staking /></ProtectedRoute></PageWrapper>} />
              <Route path="/playlist/:id" element={<PageWrapper><PlaylistDetail /></PageWrapper>} />
              <Route path="/album/:id" element={<PageWrapper><AlbumDetails /></PageWrapper>} />
              <Route path="/track/:id" element={<PageWrapper><TrackDetail /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><ProtectedRoute><Settings /></ProtectedRoute></PageWrapper>} />
              <Route path="/profile-settings" element={<PageWrapper><ProtectedRoute><ProfileSettings /></ProtectedRoute></PageWrapper>} />
              <Route path="/tasks" element={<PageWrapper><ProtectedRoute><Tasks /></ProtectedRoute></PageWrapper>} />
              <Route path="/governance" element={<PageWrapper><Governance /></PageWrapper>} />
              <Route path="/notifications" element={<PageWrapper><ProtectedRoute><Notifications /></ProtectedRoute></PageWrapper>} />
              <Route path="/post/:id" element={<PageWrapper><PostDetail /></PageWrapper>} />
              <Route path="/social" element={<PageWrapper><SocialFeedPage /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute></PageWrapper>} />
              <Route path="/login" element={<Login />} />
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
            <NotificationProvider>
              <Toaster theme="light" position="top-right" />
              <Router>
                <ScrollToTop />
                <AppContent />
              </Router>
            </NotificationProvider>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

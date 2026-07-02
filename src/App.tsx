import * as React from 'react';
import { useState, useEffect, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';

const Home = lazy(() => import('@/pages/JamUp'));
const Discover = lazy(() => import('@/pages/Discover'));
const JamSpace = lazy(() => import('@/pages/JamSpace'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const Profile = lazy(() => import('@/pages/Profile'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const UserProfile = lazy(() => import('@/pages/UserProfile'));
const ArtistProfile = lazy(() => import('@/pages/ArtistProfile'));
const ArtistDashboard = lazy(() => import('@/pages/ArtistDashboard'));
const ProfileSettings = lazy(() => import('@/pages/ProfileSettings'));
const Library = lazy(() => import('@/pages/Library'));
const Settings = lazy(() => import('@/pages/Settings'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const NFTDetail = lazy(() => import('@/pages/NFTDetail'));
const ExploreList = lazy(() => import('@/pages/ExploreList'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const UploadTrack = lazy(() => import('@/pages/UploadTrack'));
const MintNFT = lazy(() => import('@/pages/MintNFT'));
const MyNFTs = lazy(() => import('@/pages/MyNFTs'));
const FavoriteTracks = lazy(() => import('@/pages/FavoriteTracks'));
const FavoriteArtists = lazy(() => import('@/pages/FavoriteArtists'));
const ArtistMinting = lazy(() => import('@/pages/ArtistMinting'));
const TrendingNFTs = lazy(() => import('@/pages/TrendingNFTs'));
const AuctionScreen = lazy(() => import('@/pages/AuctionScreen'));
const GenesisScreen = lazy(() => import('@/pages/GenesisScreen'));
const LimitedNFTs = lazy(() => import('@/pages/LimitedNFTs'));
const HorizontalCanvas = lazy(() => import('@/pages/HorizontalCanvas'));
const StatsPreview = lazy(() => import('@/pages/StatsPreview'));
import LoadingScreen from '@/components/LoadingScreen';
const PlaylistDetail = lazy(() => import('@/pages/PlaylistDetail'));
const PostDetail = lazy(() => import('@/pages/PostDetail'));
const SocialFeedPage = lazy(() => import('@/pages/SocialFeedPage'));
const TrackDetail = lazy(() => import('@/pages/TrackDetail'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const About = lazy(() => import('@/pages/About'));
const Wallet = lazy(() => import('@/pages/Wallet'));
const Login = lazy(() => import('@/pages/Login'));
import ProtectedRoute from '@/components/ProtectedRoute';
const Staking = lazy(() => import('@/pages/Staking'));
const DJKrupy = lazy(() => import('@/pages/DJKrupy'));
const FollowersFollowing = lazy(() => import('@/pages/FollowersFollowing'));
const AlbumDetails = lazy(() => import('@/pages/AlbumDetails'));
const Governance = lazy(() => import('@/pages/Governance'));
const HomeFeed = lazy(() => import('@/pages/Home'));
const UIKitShowcase = lazy(() => import('@/pages/UIKitShowcase'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const UserAccount = lazy(() => import('@/pages/UserAccount'));
const ArtistAccount = lazy(() => import('@/pages/ArtistAccount'));
import { AudioProvider } from '@/context/AudioContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ErrorBoundary from '@/components/ErrorBoundary';
const ArtistOnboarding = lazy(() => import('@/pages/ArtistOnboarding'));
const ArtistAnalytics = lazy(() => import('@/pages/ArtistAnalytics'));
import { useProactivePreloader } from '@/hooks/useProactivePreloader';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { seedDatabase } from '@/services/seedService';
import { resolveEndedAuctions } from '@/services/auctionService';

import { WalletProvider } from '@/context/WalletContext';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Using a publicly accessible manifest URL hosted on GitHub pages to bypass the AI Studio authentication proxy.
// Wallet apps and TonConnect UI cannot parse the localhost GUI HTML intercept return.
// When deploying to production on a public URL, point this back to window.location.origin + '/tonconnect-manifest.json'.
const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20, scale: 0.98 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: -20, scale: 0.98 }}
    transition={{ 
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      opacity: { duration: 0.3 }
    }}
    className="w-full h-full overflow-x-clip"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const location = useLocation();

  const { user, userProfile } = useAuth();
  
  // Initialize proactive data pre-fetching
  useProactivePreloader();

  useEffect(() => {
    // Test Firebase connection
    const initBackend = async (retries = 4) => {
      try {
        // Initial grace period for Firebase to settle
        if (retries === 4) await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple connection test - just read from the test collection which we explicitly allowed
        const q = query(collection(db, 'test'), limit(1));
        await getDocs(q);
        console.log("[App] Backend reached successfully");
        setIsBackendReachable(true);
        setIsAppLoading(false);
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = error?.code;

        const isPermissionError = errorCode === 'permission-denied' || 
                                 errorMessage.includes('permission-denied') || 
                                 errorMessage.includes('Missing or insufficient permissions');
        
        // If it's a permission error, it's reachable
        if (isPermissionError) {
          console.log("[App] Backend reached, permissions handled");
          setIsBackendReachable(true);
          setIsAppLoading(false);
          return;
        }

        console.warn(`[App] Backend check failed (${5 - retries}/4): ${errorCode} - ${errorMessage}`);
        
        if (retries > 1) {
          // exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1500 * (5 - retries)));
          return initBackend(retries - 1);
        }
        
        // Even if unreachable, we'll try to proceed as Firestore handles offline mode
        // Only hard-block if it looks like a fatal configuration error
        setIsBackendReachable(true); 
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

  useEffect(() => {
    if (!isBackendReachable) return;
    
    // Initial check for expired auctions
    resolveEndedAuctions();

    // Check periodically (every 1 minute)
    const interval = setInterval(() => {
      resolveEndedAuctions();
    }, 60000);

    return () => clearInterval(interval);
  }, [isBackendReachable]);

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
            <React.Suspense fallback={null}>
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
              <Route path="/edit-profile" element={<PageWrapper><ProtectedRoute><EditProfile /></ProtectedRoute></PageWrapper>} />
              <Route path="/user/:id" element={<PageWrapper><UserProfile /></PageWrapper>} />
              <Route path="/artist/:id" element={<PageWrapper><ArtistProfile /></PageWrapper>} />
              <Route path="/artist-dashboard" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistDashboard /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-analytics" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistAnalytics /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-onboarding" element={<PageWrapper><ProtectedRoute><ArtistOnboarding /></ProtectedRoute></PageWrapper>} />
              <Route path="/upload" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><UploadTrack /></ProtectedRoute></PageWrapper>} />
              <Route path="/mint" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><MintNFT /></ProtectedRoute></PageWrapper>} />
              <Route path="/my-nfts" element={<PageWrapper><ProtectedRoute><MyNFTs /></ProtectedRoute></PageWrapper>} />
              <Route path="/favorite-tracks" element={<PageWrapper><ProtectedRoute><FavoriteTracks /></ProtectedRoute></PageWrapper>} />
              <Route path="/favorite-artists" element={<PageWrapper><ProtectedRoute><FavoriteArtists /></ProtectedRoute></PageWrapper>} />
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
              <Route path="/dj-krupy" element={<PageWrapper><DJKrupy /></PageWrapper>} />
              <Route path="/notifications" element={<PageWrapper><ProtectedRoute><Notifications /></ProtectedRoute></PageWrapper>} />
              <Route path="/post/:id" element={<PageWrapper><PostDetail /></PageWrapper>} />
              <Route path="/social" element={<PageWrapper><SocialFeedPage /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/canvas" element={<PageWrapper><HorizontalCanvas /></PageWrapper>} />
              <Route path="/stats" element={<PageWrapper><StatsPreview /></PageWrapper>} />
              <Route path="/login" element={<Login />} />
              <Route path="/user/:id/follows/:type" element={<PageWrapper><FollowersFollowing /></PageWrapper>} />
              <Route path="/home" element={<PageWrapper><HomeFeed /></PageWrapper>} />
              <Route path="/uikit" element={<PageWrapper><UIKitShowcase /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/user-account" element={<PageWrapper><ProtectedRoute><UserAccount /></ProtectedRoute></PageWrapper>} />
              <Route path="/artist-account" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistAccount /></ProtectedRoute></PageWrapper>} />
            </Routes>
            </React.Suspense>
          </AnimatePresence>
        </Layout>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <TonConnectUIProvider 
        manifestUrl={manifestUrl}
        actionsConfiguration={{
          twaReturnUrl: 'https://ais-dev-mfbg5o2augtyymzecgehh7-9697536059.europe-west2.run.app'
        }}
      >
        <ErrorBoundary>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>
              <AudioProvider>
                <TooltipProvider>
                  <NotificationProvider>
                    <Toaster theme="light" position="top-right" />
                    <Router>
                      <ScrollToTop />
                      <AppContent />
                    </Router>
                  </NotificationProvider>
                </TooltipProvider>
              </AudioProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </TonConnectUIProvider>
    </WalletProvider>
  );
};

export default App;

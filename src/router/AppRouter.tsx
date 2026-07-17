import * as React from 'react';
import { useState, useEffect, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import LoadingScreen from '@/components/LoadingScreen';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useProactivePreloader } from '@/hooks/useProactivePreloader';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { seedDatabase } from '@/services/seedService';
import { resolveEndedAuctions } from '@/services/auctionService';

// Lazy imports
const Home = lazy(() => import('@/pages/JamUp'));
const Discover = lazy(() => import('@/pages/Discover'));
const JamSpace = lazy(() => import('@/pages/JamSpace'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const Profile = lazy(() => import('@/pages/Profile'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const UserProfile = lazy(() => import('@/pages/UserProfile'));
const ArtistProfile = lazy(() => import('@/pages/ArtistProfile'));
const ArtistDashboard = lazy(() => import('@/pages/ArtistDashboard'));
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
const PlaylistDetail = lazy(() => import('@/pages/PlaylistDetail'));
const PostDetail = lazy(() => import('@/pages/PostDetail'));
const SocialFeedPage = lazy(() => import('@/pages/SocialFeedPage'));
const TrackDetail = lazy(() => import('@/pages/TrackDetail'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const About = lazy(() => import('@/pages/About'));
const Wallet = lazy(() => import('@/pages/Wallet'));
const Login = lazy(() => import('@/pages/Login'));
const Staking = lazy(() => import('@/pages/Staking'));
const DJKrupy = lazy(() => import('@/pages/DJKrupy'));
const FollowersFollowing = lazy(() => import('@/pages/FollowersFollowing'));
const AlbumDetails = lazy(() => import('@/pages/AlbumDetails'));
const Governance = lazy(() => import('@/pages/Governance'));
const HomeFeed = lazy(() => import('@/pages/Home'));
const UIKitShowcase = lazy(() => import('@/pages/UIKitShowcase'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ArtistOnboarding = lazy(() => import('@/pages/ArtistOnboarding'));
const ArtistAnalytics = lazy(() => import('@/pages/ArtistAnalytics'));
const ArtistPortfolio = lazy(() => import('@/pages/ArtistPortfolio'));

const Referrals = lazy(() => import('@/pages/Referrals'));

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

const AppRouter: React.FC = () => {
  return (
    <Router>
      <AppRouterContent />
    </Router>
  );
};

const AppRouterContent: React.FC = () => {
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
        if (retries === 4) await new Promise(resolve => setTimeout(resolve, 1500));
        const q = query(collection(db, 'test'), limit(1));
        await getDocs(q);
        setIsBackendReachable(true);
        setIsAppLoading(false);
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = error?.code;
        const isPermissionError = errorCode === 'permission-denied' || 
                                 errorMessage.includes('permission-denied') || 
                                 errorMessage.includes('Missing or insufficient permissions');
        
        if (isPermissionError) {
          setIsBackendReachable(true);
          setIsAppLoading(false);
          return;
        }

        if (retries > 1) {
          await new Promise(resolve => setTimeout(resolve, 1500 * (5 - retries)));
          return initBackend(retries - 1);
        }
        
        setIsBackendReachable(true); 
        setIsAppLoading(false);
      }
    };
    initBackend();
  }, []);

  useEffect(() => {
    const checkAndSeed = async () => {
      if (user && (user.email === 'krusherkrupy@gmail.com' || userProfile?.role === 'admin')) {
        try {
          await seedDatabase();
        } catch (error) {
          console.warn("Seeding failed:", error);
        }
      }
    };
    checkAndSeed();
  }, [user, userProfile]);

  useEffect(() => {
    if (!isBackendReachable) return;
    resolveEndedAuctions();
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
            The platform is having trouble reaching the database.
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
    <>
      <ScrollToTop />
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
                  <Route path="/artist-portfolio" element={<PageWrapper><ProtectedRoute allowedRoles={['artist', 'admin']}><ArtistPortfolio /></ProtectedRoute></PageWrapper>} />
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
                  <Route path="/referrals" element={<PageWrapper><ProtectedRoute><Referrals /></ProtectedRoute></PageWrapper>} />
                </Routes>
              </React.Suspense>
            </AnimatePresence>
          </Layout>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppRouter;

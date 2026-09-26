import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getTonBalance } from '@/services/tonService';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  BellIcon,
  WalletIcon,
  UserIcon,
  FunnelIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  PaperAirplaneIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  PlusIcon,
  StarIcon,
  TicketIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Sparkles as SparklesLucide, History, X, Rocket, Heart } from 'lucide-react';
import { APP_LOGO, MOCK_USER, TJ_COIN_ICON, TON_LOGO, JAM_PRICE_USD, MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { useAudio, useUserRole } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useWallet } from '@/contexts/WalletContext';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import MiniPlayer from './player/MiniPlayer';
import PlayerScreen from './player/PlayerScreen';
import AddToPlaylistModal from './AddToPlaylistModal';
import TrackOptionsModal from './TrackOptionsModal';
import NFTOptionsModal from './NFTOptionsModal';
import PostModal from './PostModal';
import { SearchBar } from './SearchBar';
import { ModeToggle } from './ModeToggle';
import { NotificationBell } from './NotificationBell';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CreatePlaylistModal from './CreatePlaylistModal';
import { FilterSection } from './FilterSection';
import AuthModal from './AuthModal';
import { Button } from "@/components/ui/button"
import { ButtonGroupInput } from './ButtonGroupInput';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const isTasks = location.pathname === '/tasks';
  const isMarketplace = location.pathname.startsWith('/marketplace');
  const isJamspace = location.pathname.startsWith('/jamspace');
  const isLibrary = location.pathname.startsWith('/library');
  const isExplore = location.pathname.startsWith('/explore');
  const isDiscover = location.pathname === '/discover';
  const isSearch = location.pathname === '/search';
  const isArtistProfile = location.pathname.startsWith('/artist/') || location.pathname === '/artist';
  const isUserProfile = location.pathname.startsWith('/user/') || location.pathname === '/profile';
  const isPostDetail = location.pathname.startsWith('/post/');
  const isTrendingNFTs = location.pathname === '/trending-nfts';

  const isNotifications = location.pathname === '/notifications';
  const isWallet = location.pathname === '/wallet';
  const isProfile = location.pathname === '/profile' || location.pathname.startsWith('/profile/');
  const isSettings = location.pathname === '/settings';
  const isGovernance = location.pathname.startsWith('/governance');
  const isAdmin = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const isDJKrupy = location.pathname === '/dj-krupy';

    const { 
    currentTrack, 
    isFullPlayerOpen, 
    userProfile, 
    searchQuery, 
    setSearchQuery, 
    allTracks, 
    allNFTs, 
    artists, 
    firestoreUsers,
    playTrack,
    isCreatePlaylistModalOpen, 
    setIsCreatePlaylistModalOpen, 
    isDiscoverFiltersOpen, 
    setIsDiscoverFiltersOpen,
    isHeaderSearchOpen,
    setIsHeaderSearchOpen,
    playlists,
    marketplaceFilters,
    setMarketplaceFilters,
    jamspaceFilters,
    setJamspaceFilters,
    discoverFilters,
    setDiscoverFilters,
    trackToAddToPlaylist,
    setTrackToAddToPlaylist,
    optionsTrack,
    optionsCallbacks,
    setOptionsTrack,
    createPost,
    headerTitle,
    setFullPlayerOpen
  } = useAudio();

  const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';

  const { user, signInWithGoogle, signOut } = useAuth();
  const { price: tonPriceData, loading: tonPriceLoading } = useTonPrice();
  const { evmAddress, isEvmConnected, disconnectWallet: disconnectWalletContext } = useWallet();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isTippingModalOpen, setIsTippingModalOpen] = useState(false);
  const [tonBalance, setTonBalance] = useState<number | null>(null);

  useEffect(() => {
    if (userAddress) {
      getTonBalance(userAddress).then(setTonBalance);
    }
  }, [userAddress]);

  useEffect(() => {
    const handleTippingState = (e: any) => {
      setIsTippingModalOpen(e.detail.open);
    };
    window.addEventListener('tippingModalState', handleTippingState as EventListener);
    return () => window.removeEventListener('tippingModalState', handleTippingState as EventListener);
  }, []);


  const filteredResults = useMemo(() => {
    if (!safeSearchQuery.trim()) return null;

    const query = safeSearchQuery.toLowerCase().trim();
    
    const sortFn = (a: string, b: string) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower.startsWith(query) && !bLower.startsWith(query)) return -1;
      if (!aLower.startsWith(query) && bLower.startsWith(query)) return 1;
      return aLower.localeCompare(bLower);
    };

    const tracks = allTracks.filter(t => 
      (t.title || '').toLowerCase().includes(query) || 
      (t.artist || '').toLowerCase().includes(query)
    ).sort((a, b) => sortFn(a.title, b.title)).slice(0, 5);

    const nfts = allNFTs.filter(n => 
      (n.title || '').toLowerCase().includes(query) || 
      n.artist?.toLowerCase().includes(query)
    ).sort((a, b) => sortFn(a.title, b.title)).slice(0, 5);

    const filteredArtists = artists.filter(a => 
      (a.name || '').toLowerCase().includes(query)
    ).sort((a, b) => sortFn(a.name, b.name)).slice(0, 5);

    const users = firestoreUsers.filter(u => 
      (u.name || '').toLowerCase().includes(query) ||
      (u.username || '').toLowerCase().includes(query)
    ).sort((a, b) => sortFn(a.name || a.username || '', b.name || b.username || '')).slice(0, 5);

    const filteredPlaylists = playlists.filter(p => 
      (p.title || '').toLowerCase().includes(query)
    ).sort((a, b) => sortFn(a.title, b.title)).slice(0, 5);

    return { tracks, nfts, artists: filteredArtists, users, playlists: filteredPlaylists };
  }, [searchQuery, allTracks, allNFTs, artists, firestoreUsers, playlists]);
  const artistId = location.pathname.split('/')[2];
  const activeArtist = useMemo(() => artists.find(a => a.uid === artistId), [artists, artistId]);
  
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  
  useEffect(() => {
    setIsHeaderHidden(false);
    setIsMobileNavHidden(false);
    setIsScrolled(typeof window !== 'undefined' ? window.scrollY > 15 : false);
  }, [location.pathname]);
  const [isMobileNavHidden, setIsMobileNavHidden] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const [isFabActive, setIsFabActive] = useState(true);
  const isFabActiveRef = useRef(true);
  const [activeFilterSubMenu, setActiveFilterSubMenu] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('tonjam_search_history') || localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : ['Lo-fi hip hop', 'Cyberpunk Beats', 'Phonk Vibes', 'Genesis NFT'];
  });
  const trendingTopics = useMemo(() => {
    const topTracks = allTracks.sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 3).map(t => t.title);
    const topArtists = artists.sort((a, b) => b.followers - a.followers).slice(0, 2).map(a => a.name);
    return [...topTracks, ...topArtists];
  }, [allTracks, artists]);

  const saveRecentSearch = (query: string) => {
    if (!query || !query.trim()) return;
    const q = query.trim();
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
  };
  
  
  const getSearchPlaceholder = () => {
    const path = location.pathname;
    if (path.startsWith('/marketplace')) return 'Scan Network Protocols (NFTs)...';
    if (path.startsWith('/jamspace')) return 'Search Live Nodes & Sessions...';
    if (path.startsWith('/library')) return 'Search Your Frequencies...';
    if (path.startsWith('/profile')) return 'Search Releases & Activity...';
    if (path.startsWith('/artist-dashboard')) return 'Search Your Catalog & Stats...';
    if (path.startsWith('/discover')) return 'Search Artists, Users, Playlists, Vibes...';
    if (path.startsWith('/wallet')) return 'Search Transactions...';
    return 'Search tracks, artists, users, NFTs...';
  };

  const handleSearch = (e: any) => {
    e?.preventDefault?.();
    if (safeSearchQuery.trim()) {
      saveRecentSearch(safeSearchQuery.trim());
      navigate(`/discover?search=${encodeURIComponent(safeSearchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    saveRecentSearch(query);
    navigate(`/discover?search=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  };

  useEffect(() => {
    if (isFullPlayerOpen) {
      setIsHeaderHidden(false);
      setIsMobileNavHidden(false);
      document.documentElement.style.setProperty('--header-height', '64px');
    }
  }, [isFullPlayerOpen]);

  useEffect(() => {
    let fabTimeout: NodeJS.Timeout;
    
    // Scroll handling to roll up header and hide bottom navigation on scroll down
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollYRef.current;
      
      setIsScrolled(currentScrollY > 15);

      if (currentScrollY > prevScrollY && currentScrollY > 40) {
        setIsHeaderHidden(true); // Roll up header on scroll down
        setIsMobileNavHidden(true); // Hide bottom nav on scroll down
      } else if (currentScrollY < prevScrollY || currentScrollY <= 20) {
        setIsHeaderHidden(false); // Roll down header on scroll up or top
        setIsMobileNavHidden(false); // Reveal bottom nav on scroll up or top
      }
      
      if (isArtistProfile) {
        setIsCompact(currentScrollY > 200);
      } else {
        setIsCompact(false);
      }
      
      lastScrollYRef.current = currentScrollY;
      
      if (!isFabActiveRef.current) {
        isFabActiveRef.current = true;
        setIsFabActive(true);
      }
      
      clearTimeout(fabTimeout);
      fabTimeout = setTimeout(() => {
        isFabActiveRef.current = false;
        setIsFabActive(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial timeout
    fabTimeout = setTimeout(() => {
      isFabActiveRef.current = false;
      setIsFabActive(false);
    }, 3000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(fabTimeout);
    };
  }, [isArtistProfile]);

  const optionsNFT = useMemo(() => {
    if (!optionsTrack || !optionsTrack.isNFT) return null;
    return allNFTs.find(n => n.id === optionsTrack.id || n.trackId === optionsTrack.id) || {
      id: optionsTrack.id,
      trackId: optionsTrack.id,
      title: optionsTrack.title,
      owner: 'Unknown',
      creator: optionsTrack.artist,
      artist: optionsTrack.artist,
      artistId: optionsTrack.artistId,
      price: optionsTrack.price || '0',
      imageUrl: optionsTrack.coverUrl,
      edition: optionsTrack.rarity || 'Common',
    } as any;
  }, [optionsTrack, allNFTs]);

  return (
    <TooltipProvider>
      {isLoginPage ? (
        <main className="min-h-screen w-full bg-background relative overflow-hidden">
          {children}
        </main>
      ) : (
        <div className="flex min-h-screen bg-black text-foreground transition-colors duration-300 relative">
          {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black" />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-2 focus:py-2 focus:rounded-md focus:font-bold">
        Skip to content
      </a>

      {/* Header - Only for Home Screen */}
      {isHome && !isAuthModalOpen && !isTippingModalOpen && !isDJKrupy && !isLoginPage && (
        <motion.header 
          className={cn(
            "fixed top-0 left-0 right-0 z-40 h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ease-out border-none",
            "lg:left-64",
            isHeaderHidden ? "-translate-y-full" : "translate-y-0",
            isScrolled
              ? "bg-[#060B18]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
              : "bg-[#060B18]/30 backdrop-blur-md"
          )}
        >
          {/* LEFT: TonJam Logo & Brand */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsMobileSidebarOpen(true);
                    } else {
                      navigate('/');
                    }
                  }}
                  className="flex items-center gap-2 p-1 -ml-1 rounded-full hover:bg-white/5 active:scale-95 transition-all flex-shrink-0 cursor-pointer border-none outline-none group"
                  aria-label="TonJam Home"
                >
                  <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[#0088CC]/10 group-hover:bg-[#0088CC]/20 transition-colors">
                    <motion.img 
                      layoutId="app-logo"
                      src={APP_LOGO} 
                      alt="TonJam Logo" 
                      className="w-7 h-7 object-contain drop-shadow-[0_2px_8px_rgba(0,180,216,0.35)]" 
                    />
                  </div>
                  <span className="font-black text-sm tracking-tight text-white select-none">
                    TonJam
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Open Navigation</TooltipContent>
            </Tooltip>
          </div>

          {/* RIGHT: Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NotificationBell />

            {user ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 p-0.5 rounded-full transition-all hover:scale-105 active:scale-95 outline-none border-none"
                    aria-label="Your Profile"
                  >
                    <Avatar className="w-8 h-8 rounded-full flex-shrink-0 bg-neutral-900 ring-1 ring-white/10">
                      <AvatarImage 
                        src={userProfile?.avatar || user.photoURL || ''} 
                        alt={user.displayName || 'Profile'} 
                        className="object-cover rounded-full" 
                      />
                      <AvatarFallback className="bg-[#0088CC]/20 text-[#00B4D8] rounded-full text-[10px] font-black">
                        {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : (userProfile?.username ? userProfile.username.slice(0, 2).toUpperCase() : 'TJ')}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">Your Profile</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 hover:text-white transition-all border-none outline-none cursor-pointer"
                    aria-label="Sign In"
                  >
                    <UserIcon className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Sign In</TooltipContent>
              </Tooltip>
            )}
          </div>
        </motion.header>
      )}

      {/* Sidebar - Desktop */}
      {!isPostDetail && (
        <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-background border-none flex-col p-4 z-50 overflow-y-auto transition-colors duration-300" aria-label="Main Sidebar">
          <SidebarContent user={user} userProfile={userProfile} signOut={signOut} />
        </aside>
      )}

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-background z-[70] lg:hidden flex flex-col p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-2">
                <Link to="/" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-2">
                  <img src={APP_LOGO} alt="" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-lg tracking-tight text-foreground uppercase">TonJam</span>
                </Link>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-foreground active:scale-95">
                  <ArrowLeftIcon className="h-6 w-6 text-foreground" strokeWidth={3.5} />
                </button>
              </div>
              <SidebarContent user={user} userProfile={userProfile} signOut={signOut} onNavigate={() => setIsMobileSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main id="main-content" className={`transition-all w-full flex-1 ${isHome ? 'pt-14 sm:pt-16' : 'pt-0'} ${isPostDetail ? '' : 'lg:w-[calc(100%-16rem)] lg:ml-64'} relative z-10 ${isSearch ? 'overflow-visible' : 'overflow-x-clip'} ${isDJKrupy ? '' : 'pb-40'} min-h-screen`}>
        <div className={`w-full max-w-full ${isSearch ? 'overflow-visible' : 'overflow-x-clip'}`}>
          {children}
        </div>
      </main>

      {/* Audio Player Container */}
      <div className="relative">
        {currentTrack && !isDJKrupy && !isPostDetail && (
          <MiniPlayer isMobileNavHidden={isMobileNavHidden || isFullPlayerOpen || Boolean(optionsTrack) || Boolean(trackToAddToPlaylist) || location.pathname.startsWith('/track/') || location.pathname.startsWith('/nft/') || location.pathname.startsWith('/mint') || isSettings || isAdmin} />
        )}
        
        <AnimatePresence>
          {isFullPlayerOpen && <PlayerScreen />}
        </AnimatePresence>
      </div>

      {trackToAddToPlaylist && (
        <AddToPlaylistModal 
          track={trackToAddToPlaylist} 
          onClose={() => setTrackToAddToPlaylist(null)} 
        />
      )}

      {optionsTrack && !optionsNFT && (
        <TrackOptionsModal 
          track={optionsTrack} 
          onClose={() => setOptionsTrack(null)} 
          onRemove={optionsCallbacks?.onRemove}
        />
      )}

      {optionsTrack && optionsNFT && (
        <NFTOptionsModal
          nft={optionsNFT}
          onClose={() => setOptionsTrack(null)}
        />
      )}

      <CreatePlaylistModal isOpen={isCreatePlaylistModalOpen} onClose={() => setIsCreatePlaylistModalOpen(false)} />
      
      <FilterSection 
        isOpen={isDiscoverFiltersOpen}
        onOpenChange={setIsDiscoverFiltersOpen}
        activeFilter={isMarketplace ? 'nfts' : isDiscover ? 'tracks' : 'all'}
        setActiveFilter={() => {}} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={isMarketplace ? marketplaceFilters.sortBy : isDiscover ? discoverFilters.sortBy : 'newest'}
        setSortOption={(opt) => {
          if (isMarketplace) setMarketplaceFilters(prev => ({ ...prev, sortBy: opt }));
          if (isDiscover) setDiscoverFilters(prev => ({ ...prev, sortBy: opt }));
        }}
        filters={{
          priceRange: isMarketplace ? marketplaceFilters.priceRange : undefined,
          setPriceRange: isMarketplace ? ((range) => setMarketplaceFilters(prev => ({ ...prev, priceRange: range }))) : undefined,
          rarity: isMarketplace ? marketplaceFilters.rarity : undefined,
          setRarity: isMarketplace ? ((rarity) => setMarketplaceFilters(prev => ({ ...prev, rarity }))) : undefined,
          status: isMarketplace ? marketplaceFilters.status : undefined,
          setStatus: isMarketplace ? ((status) => setMarketplaceFilters(prev => ({ ...prev, status }))) : undefined,
          selectedGenres: isMarketplace ? [marketplaceFilters.genre] : isDiscover ? [discoverFilters.genre] : undefined,
          setSelectedGenres: isMarketplace 
            ? ((genres) => setMarketplaceFilters(prev => ({ ...prev, genre: genres[0] || 'All' }))) 
            : isDiscover 
              ? ((genres) => setDiscoverFilters(prev => ({ ...prev, genre: genres[0] || 'All' }))) 
              : undefined,
          bpmRange: isDiscover ? discoverFilters.bpmRange : undefined,
          setBpmRange: isDiscover ? ((range) => setDiscoverFilters(prev => ({ ...prev, bpmRange: range }))) : undefined,
          selectedMoods: isDiscover ? discoverFilters.selectedMoods : undefined,
          setSelectedMoods: isDiscover ? ((moods) => setDiscoverFilters(prev => ({ ...prev, selectedMoods: moods }))) : undefined,
          onlyVerified: isDiscover ? discoverFilters.onlyVerified : undefined,
          setOnlyVerified: isDiscover ? ((v) => setDiscoverFilters(prev => ({ ...prev, onlyVerified: v }))) : undefined,
        }}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AnimatePresence>
        {isPostModalOpen && (
          <PostModal 
            onClose={() => setIsPostModalOpen(false)} 
            onSubmit={(content, mediaUrl, trackId) => {
              createPost({ content, imageUrl: mediaUrl, trackId });
              setIsPostModalOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
      <div className="lg:hidden">
        {/* Mobile Navigation */}
      {!isPostDetail && !isAuthModalOpen && !isTippingModalOpen && !isDJKrupy && (
        <div 
          id="tonjam-mobile-nav"
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-[70] h-16 transition-all duration-300 ease-in-out ${isMobileNavHidden || isFullPlayerOpen || Boolean(optionsTrack) || Boolean(trackToAddToPlaylist) || location.pathname.startsWith('/track/') || location.pathname.startsWith('/nft/') || location.pathname.startsWith('/mint') || isSettings || isAdmin ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        >
          <nav 
            id="tonjam-mobile-nav-bar"
            className="h-full w-full bg-black/95 backdrop-blur-xl border-t border-[#c0c0c0]/30 px-2 flex justify-around items-center" 
            aria-label="Mobile Navigation"
          >
            <MobileNavItem to="/" icon={HomeIcon} label="Home" onClick={() => isFullPlayerOpen && setFullPlayerOpen(false)} />
            <MobileNavItem to="/discover" icon={MagnifyingGlassIcon} label="Search" onClick={() => isFullPlayerOpen && setFullPlayerOpen(false)} />
            <MobileNavItem to="/jamspace" icon={PaperAirplaneIcon} label="Jamspace" onClick={() => isFullPlayerOpen && setFullPlayerOpen(false)} />
            <MobileNavItem to="/library" icon={RectangleStackIcon} label="Library" onClick={() => isFullPlayerOpen && setFullPlayerOpen(false)} />
            <MobileNavItem to="/marketplace" icon={ShoppingBagIcon} label="Market" onClick={() => isFullPlayerOpen && setFullPlayerOpen(false)} />
          </nav>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {isJamspace && (
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className={`lg:hidden fixed right-6 z-[100] w-14 h-14 rounded-full bg-primary shadow-2xl flex items-center justify-center transition-all duration-300 ${isFabActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'} hover:opacity-100 hover:scale-110 active:scale-95 ${
            currentTrack && !isFullPlayerOpen ? 'bottom-40' : 'bottom-24'
          }`}
          aria-label="Create Post"
        >
          <PlusIcon className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
        </button>
      )}
    </div>
    </div>
    )}
    </TooltipProvider>
  );
};

import { useI18n } from '@/contexts/I18nContext';

const SidebarContent = ({ user, userProfile, signOut, onNavigate }: { user: any; userProfile: any; signOut: () => void; onNavigate?: () => void }) => {
  const { isArtist, isAdmin } = useUserRole();
  const { t } = useI18n();

  return (
  <>
    <div className="flex items-center justify-between mb-6 px-2">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm" aria-label="TonJam Home">
        <motion.img 
          layoutId="app-logo"
          src={APP_LOGO} 
          alt="" 
          className="w-[40px] h-[40px] object-contain" 
          aria-hidden="true" 
        />
        <span className="font-bold text-lg tracking-tight text-foreground uppercase">TonJam</span>
      </Link>
      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </div>

    {user && (
      <Link 
        to="/profile" 
        onClick={onNavigate}
        className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all group"
      >
        <Avatar className="w-10 h-10 rounded-full">
          <AvatarImage src={userProfile?.avatar || user.photoURL || ''} alt="" className="object-cover rounded-full" />
          <AvatarFallback className="bg-blue-600/10 text-blue-500 rounded-full text-xs font-bold">
            {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : '??'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Session Active</span>
          <span className="text-xs font-black tracking-tighter truncate text-foreground group-hover:text-blue-500 transition-colors">{user.displayName}</span>
        </div>
        <ChevronRightIcon className="w-4 h-4 ml-auto text-muted-foreground/30 group-hover:text-blue-500 transition-colors" />
      </Link>
    )}

    <nav className="flex-1 space-y-3" aria-label="Main Navigation">
      <NavItem to="/" icon={HomeIcon} label={t('nav.home')} onClick={onNavigate} />
      <NavItem to="/discover" icon={MagnifyingGlassIcon} label={t('nav.discover')} onClick={onNavigate} />
      <NavItem to="/dj-krupy" icon={SparklesLucide} label="DJ Krupy AI" onClick={onNavigate} className="text-blue-500 bg-blue-500/5 border border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]" />
      <NavItem to="/jamspace" icon={PaperAirplaneIcon} label={t('nav.jamspace')} onClick={onNavigate} />
      <NavItem to="/auctions" icon={StarIcon} label={t('nav.auctions')} onClick={onNavigate} />
      <NavItem to="/genesis-forge" icon={TicketIcon} label={t('nav.genesis')} onClick={onNavigate} />
      <NavItem to="/library" icon={RectangleStackIcon} label={t('nav.library')} onClick={onNavigate} />
      <NavItem to="/marketplace" icon={ShoppingBagIcon} label={t('nav.marketplace')} onClick={onNavigate} />
      <NavItem to="/fan-engagement" icon={Heart} label="Fan Engagement" onClick={onNavigate} />
      <NavItem to="/launchpad" icon={Rocket} label={t('nav.launchpad')} onClick={onNavigate} />
      <NavItem to="/referrals" icon={UserGroupIcon} label={t('nav.referrals')} onClick={onNavigate} />
      
      <div className="pt-4 pb-4">
        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">{t('nav.account')}</p>
        {(isArtist || isAdmin || userProfile?.isVerifiedArtist) && (
          <NavItem to={`/artist/${userProfile?.uid}`} icon={UserIcon} label={t('nav.artist_profile')} onClick={onNavigate} />
        )}
        {(isArtist || isAdmin || userProfile?.isVerifiedArtist) && (
          <NavItem to="/artist-dashboard" icon={Squares2X2Icon} label={t('nav.artist_dashboard')} onClick={onNavigate} />
        )}
        {(isArtist || isAdmin || userProfile?.isVerifiedArtist) && (
          <NavItem to="/artist-portfolio" icon={SparklesIcon} label={t('nav.portfolio')} onClick={onNavigate} />
        )}
        {isAdmin && (
          <NavItem to="/admin" icon={ShieldCheckIcon} label={t('nav.admin_console')} onClick={onNavigate} />
        )}
        <NavItem to="/profile" icon={UserIcon} label={t('nav.user_profile')} onClick={onNavigate} />
        <NavItem to="/my-nfts" icon={TicketIcon} label={t('nav.my_nfts')} onClick={onNavigate} />
        <NavItem to="/wallet" icon={WalletIcon} label={t('nav.wallet')} onClick={onNavigate} />
        <NavItem to="/governance" icon={ShieldCheckIcon} label={t('nav.governance')} onClick={onNavigate} />
        <NavItem to="/staking" icon={ArrowTrendingUpIcon} label={t('nav.staking')} onClick={onNavigate} />
        <NavItem to="/about" icon={ShieldCheckIcon} label={t('nav.about')} onClick={onNavigate} />
        <NavItem to="/settings" icon={Cog6ToothIcon} label={t('nav.settings')} onClick={onNavigate} />
        {user && (
          <button 
            onClick={async () => {
              await signOut();
              toast.success('Signed out successfully');
              onNavigate?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all group mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Sign Out"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-left">{t('nav.sign_out')}</span>
          </button>
        )}
      </div>

      {(isArtist || isAdmin || userProfile?.isVerifiedArtist || userProfile?.role === 'artist') ? (
        <div className="pt-2 space-y-2">
          <Link 
            to="/artist-dashboard"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Creator Dashboard"
          >
            <Squares2X2Icon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Creator Dashboard</span>
          </Link>

          <Link 
            to="/upload"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] bg-muted/50 text-muted-foreground font-bold hover:bg-muted transition-all border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 text-left"
            aria-label="Upload new track"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">{t('nav.upload_track')}</span>
          </Link>
          
          <Link 
            to="/mint"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] bg-muted/50 text-muted-foreground font-bold hover:bg-muted transition-all border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 text-left"
            aria-label="Mint new NFT"
          >
            <PlusCircleIcon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">{t('nav.mint_nft')}</span>
          </Link>
        </div>
      ) : (
        <div className="pt-2">
          <Link 
            to="/artist-onboarding"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold transition-all shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Become a Creator"
          >
            <StarIcon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Become a Creator</span>
          </Link>
        </div>
      )}

      {/* TJ Coin Price Widget */}
      <div className="mt-2 p-2 rounded-[4px] bg-muted/50 border-0 space-y-2" role="complementary" aria-label="Token Price Info">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={TJ_COIN_ICON} alt="JAM Token" className="w-[26px] h-[26px] object-contain" />
            <div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{t('nav.jam_price')}</p>
              <p className="text-sm font-bold text-foreground tracking-tighter">${JAM_PRICE_USD.toFixed(3)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest" aria-label="Price change">+2.4%</p>
          </div>
        </div>
        
        <div className="pt-2 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{t('nav.your_balance')}</p>
            <p className="text-sm font-bold text-blue-500 tracking-tighter">{parseFloat(String(userProfile.jamBalance || '0')).toLocaleString()} JAM</p>
          </div>
          <Link to="/wallet" className="p-3 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
            <PlusCircleIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  </>
);
};

function NavItem({ to, icon: Icon, label, onClick, className = "" }: { to: string; icon: any; label: string; onClick?: () => void; className?: string }) {
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-2.5 rounded-[4px] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500
        ${isActive ? 'text-blue-500 font-black' : 'text-muted-foreground/60 hover:text-foreground'}
        ${className}
      `}
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-4 w-4 transition-all ${isActive ? 'text-blue-500 scale-110' : 'text-muted-foreground/40'}`} strokeWidth={isActive ? 3 : 2} />
          <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function MobileNavItem({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) {
  return (
    <NavLink 
      to={to} 
      aria-label={label}
      onClick={onClick}
      className={({ isActive }) => `
        flex-1 flex flex-col items-center justify-center transition-all gap-1 h-full min-h-[48px] py-1 select-none active:scale-95
        ${isActive ? 'text-blue-500 font-bold' : 'text-white/90 hover:text-white'}
      `}
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-5 w-5 transition-transform ${isActive ? 'text-blue-500 scale-110' : 'text-white/90 group-hover:text-white'}`} strokeWidth={isActive ? 2.5 : 2} />
          <span className={`text-[9px] font-medium uppercase tracking-wider transition-colors ${isActive ? 'text-blue-500 font-bold' : 'text-white/90'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default Layout; 
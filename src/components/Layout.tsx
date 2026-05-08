import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Sparkles as SparklesLucide } from 'lucide-react';
import { APP_LOGO, MOCK_USER, TJ_COIN_ICON, JAM_PRICE_USD, MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import MiniAudioPlayer from './MiniAudioPlayer';
import FullPlayer from './FullPlayer';
import AddToPlaylistModal from './AddToPlaylistModal';
import TrackOptionsModal from './TrackOptionsModal';
import NFTOptionsModal from './NFTOptionsModal';
import PostModal from './PostModal';
import { SearchBar } from './SearchBar';
import { ModeToggle } from './ModeToggle';
import { NotificationBell } from './NotificationBell';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CreatePlaylistModal from './CreatePlaylistModal';
import AuthModal from './AuthModal';
import ScrollToTopButton from './ScrollToTopButton';
import AIAssistant from './AIAssistant';
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
    marketplaceFilters,
    setMarketplaceFilters,
    jamspaceFilters,
    setJamspaceFilters,
    trackToAddToPlaylist,
    setTrackToAddToPlaylist,
    optionsTrack,
    optionsCallbacks,
    setOptionsTrack,
    createPost,
    headerTitle
  } = useAudio();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const tracks = allTracks.filter(t => 
      (t.title || '').toLowerCase().includes(query) || 
      (t.artist || '').toLowerCase().includes(query)
    ).slice(0, 5);
    const nfts = allNFTs.filter(n => 
      (n.title || '').toLowerCase().includes(query) || 
      n.artist?.toLowerCase().includes(query)
    ).slice(0, 5);
    const filteredArtists = artists.filter(a => 
      (a.name || '').toLowerCase().includes(query)
    ).slice(0, 5);
    const users = firestoreUsers.filter(u => 
      (u.name || '').toLowerCase().includes(query) ||
      (u.username || '').toLowerCase().includes(query)
    ).slice(0, 5);

    return { tracks, nfts, artists: filteredArtists, users };
  }, [searchQuery, allTracks, allNFTs, artists, firestoreUsers]);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const [isMobileNavHidden, setIsMobileNavHidden] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isFabActive, setIsFabActive] = useState(true);
  const [activeFilterSubMenu, setActiveFilterSubMenu] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : ['Lo-fi hip hop', 'Cyberpunk Beats', 'Phonk Vibes'];
  });
  const trendingTopics = useMemo(() => {
    const topTracks = allTracks.sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 3).map(t => t.title);
    const topArtists = artists.sort((a, b) => b.followers - a.followers).slice(0, 2).map(a => a.name);
    return [...topTracks, ...topArtists];
  }, [allTracks, artists]);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };
  
  const isHome = location.pathname === '/';
  const isTasks = location.pathname === '/tasks';
  const isMarketplace = location.pathname.startsWith('/marketplace');
  const isJamspace = location.pathname.startsWith('/jamspace');
  const isLibrary = location.pathname.startsWith('/library');
  const isExplore = location.pathname.startsWith('/explore');
  const isDiscover = location.pathname === '/discover';
  const isSearch = location.pathname === '/search' || location.pathname === '/discover';
  const isArtistProfile = location.pathname.startsWith('/artist/');
  const isUserProfile = location.pathname.startsWith('/user/') || location.pathname === '/profile';
  const isPostDetail = location.pathname.startsWith('/post/');
  const isTrendingNFTs = location.pathname === '/trending-nfts';

  const isNotifications = location.pathname === '/notifications';
  const isWallet = location.pathname === '/wallet';
  const isProfile = location.pathname === '/profile' || location.pathname.startsWith('/profile/');
  const isProfileSettings = location.pathname === '/profile/settings';
  const isGovernance = location.pathname.startsWith('/governance');
  const isAdmin = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

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

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
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
    
    // Improved scroll handling to detect direction
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
         setIsMobileNavHidden(true); // Scrolling down
      } else {
         setIsMobileNavHidden(false); // Scrolling up
      }
      
      setLastScrollY(currentScrollY);
      
      if (!isFabActive) setIsFabActive(true);
      
      clearTimeout(fabTimeout);
      fabTimeout = setTimeout(() => {
        setIsFabActive(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial timeout
    fabTimeout = setTimeout(() => {
      setIsFabActive(false);
    }, 3000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(fabTimeout);
    };
  }, [lastScrollY, isFabActive]);

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
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 relative">
          {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-blue-400/5 rounded-full blur-[120px]" />
      </div>

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-2 focus:py-2 focus:rounded-md focus:font-bold">
        Skip to content
      </a>

      {/* Header */}
      {!isExplore && !isSearch && !isAuthModalOpen && (
        <motion.header 
          className={`fixed top-0 left-0 right-0 z-40 px-4 h-16 flex items-center justify-between transition-transform duration-300 ${isPostDetail ? '' : 'lg:left-64'} ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}
        >
          {/* Background with higher blur and subtle border */}
          <motion.div 
            className="absolute inset-0 bg-background -z-10 border-b border-border/40"
          />
          
          <div className={`flex items-center ${headerTitle ? 'justify-center flex-1' : 'gap-4 flex-1'}`}>
            {isHome ? (
              !headerTitle && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="lg:hidden p-2 rounded-[2px] bg-muted/30 hover:bg-muted transition-all"
                      aria-label="Open sidebar"
                    >
                      <motion.img 
                        layoutId="app-logo"
                        src={APP_LOGO} 
                        alt="TonJam Logo" 
                        className="w-8 h-8 object-contain" 
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Open Navigation</TooltipContent>
                </Tooltip>
              )
            ) : (
              <div className={`flex items-center ${headerTitle ? 'w-full justify-center relative' : 'gap-2'}`}>
                {!headerTitle && (
                  <BackButton 
                    className={`p-2 rounded-[2px] bg-muted/30 hover:bg-muted transition-all ${isTrendingNFTs ? 'text-white' : 'text-foreground'}`}
                    ariaLabel="Go back"
                  />
                )}
                <div className={`${headerTitle ? 'flex' : 'lg:hidden'} flex-col justify-center items-center`}>
                  <span className={cn(
                    "font-bold uppercase tracking-widest truncate transition-all duration-300",
                    headerTitle ? "text-sm italic" : "text-[12px] tracking-tighter max-w-[120px]"
                  )}>
                    {headerTitle || (isTrendingNFTs ? 'Trending NFTs' : (isJamspace ? 'JamSpace' : isLibrary ? 'Library' : isMarketplace ? 'Marketplace' : isPostDetail ? 'Post' : isWallet ? 'Wallet' : isSearch ? 'Search' : isProfileSettings ? 'Settings' : isProfile ? 'Profile' : isDiscover ? 'Discover' : isTasks ? 'Tasks' : isGovernance ? 'Governance' : isAdmin ? 'Admin' : (location.pathname.split('/')[1] || '').replace('-', ' ')))}
                  </span>
                </div>
                {headerTitle && !isHome && (
                  <BackButton 
                    className="absolute left-0 p-2 rounded-[2px] bg-muted/10 hover:bg-muted/20 transition-all text-foreground"
                    ariaLabel="Go back"
                  />
                )}
              </div>
            )}

            {!isHome && !isDiscover && !headerTitle && (
              <div className="hidden lg:flex items-center gap-4 flex-1 ml-4 overflow-hidden">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-6 bg-blue-600 rounded-full" />
                   <span className="font-bold text-xs uppercase tracking-tighter italic">
                     {isTrendingNFTs ? 'Trending NFTs' : (isJamspace ? 'JamSpace' : isLibrary ? 'Library' : isMarketplace ? 'Marketplace' : 'Details')}
                   </span>
                </div>
                
                <Separator orientation="vertical" className="h-4 bg-border/40" />

                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isSearchOpen={isSearchOpen}
                  setIsSearchOpen={setIsSearchOpen}
                  handleSearch={handleSearch}
                  handleSuggestionClick={handleSuggestionClick}
                  recentSearches={recentSearches}
                  removeRecentSearch={removeRecentSearch}
                  trendingTopics={trendingTopics}
                  placeholder={getSearchPlaceholder()}
                  className={`flex-1 relative transition-all duration-500 max-w-xl`}
                  inputClassName={`border border-border/40 bg-muted/20 rounded-[2px] py-1.5 pl-4 pr-10 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-muted-foreground/30`}
                />
              </div>
            )}
          </div>

          <div className={cn("items-center gap-2 transition-all duration-300", headerTitle ? "hidden" : "flex")}>
            {/* JAM Balance Badge */}
            <button onClick={() => navigate('/tasks')} className={`flex items-center gap-2 bg-blue-600/5 border border-blue-600/10 px-3 py-1.5 rounded-[2px] hover:bg-blue-600/10 transition-colors ${!isHome ? 'hidden sm:flex' : ''}`}>
               <img src={TJ_COIN_ICON} alt="TJ Coin" className="w-5 h-5 object-contain" />
               <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-blue-500 opacity-60">Balance (Tasks)</span>
                  <span className="text-[9px] font-bold tracking-tighter">{parseFloat(String(userProfile.jamBalance || '0')).toLocaleString()} JAM</span>
               </div>
            </button>

            <Separator orientation="vertical" className="h-6 bg-border/40 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1">
              {!isMarketplace && !isDiscover && !isLibrary && !isTrendingNFTs && (
                <NotificationBell />
              )}

              {userAddress ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => tonConnectUI.disconnect()}
                      className={`p-2.5 rounded-[2px] hover:bg-destructive/10 hover:text-destructive transition-all flex items-center gap-2 ${isWallet ? 'text-blue-500' : 'text-muted-foreground'}`}
                    >
                      <WalletIcon className="h-5 w-5" strokeWidth={2.5} />
                      <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Wallet</span>
                        <span className="text-[9px] font-black tracking-tighter">{userAddress.slice(0, 4)}...{userAddress.slice(-4)}</span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Disconnect Wallet</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => tonConnectUI.openModal()}
                      className={`p-2.5 rounded-[2px] hover:bg-muted transition-all flex items-center gap-2 ${isWallet ? 'text-blue-500' : 'text-muted-foreground'}`}
                    >
                      <WalletIcon className="h-5 w-5" strokeWidth={2.5} />
                      <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">Connect</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Connect Wallet</TooltipContent>
                </Tooltip>
              )}
              
              <Separator orientation="vertical" className="h-4 bg-border/40 mx-1" />

              {user ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/profile" className={`flex items-center gap-2 p-1 rounded-[2px] hover:bg-muted transition-all ${isProfile ? 'ring-1 ring-blue-500/30' : ''}`}>
                      <Avatar className="w-8 h-8 rounded-[2px]">
                        <AvatarImage src={userProfile?.avatar || user.photoURL || ''} alt="" className="object-cover" />
                        <AvatarFallback className="bg-blue-600/10 text-blue-500 rounded-[2px] text-[10px] font-bold">
                          {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col leading-none">
                        <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Identity</span>
                        <span className="text-[9px] font-bold tracking-tighter truncate max-w-[60px]">{user.displayName}</span>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Your Profile</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => navigate('/login')}
                      className="p-2.5 rounded-[2px] hover:bg-muted transition-all text-muted-foreground"
                    >
                      <UserIcon className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Sign In</TooltipContent>
                </Tooltip>
              )}
            </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
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
                  <span className="font-bold text-lg tracking-tight text-foreground uppercase italic">JamSpace</span>
                </Link>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-full hover:bg-muted">
                  <ArrowLeftIcon className="h-5 w-5 text-zinc-700" />
                </button>
              </div>
              <SidebarContent user={user} userProfile={userProfile} signOut={signOut} onNavigate={() => setIsMobileSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main id="main-content" className={`transition-all w-full flex-1 ${isExplore || isPostDetail ? '' : 'pt-16'} ${isPostDetail ? '' : 'lg:w-[calc(100%-16rem)] lg:ml-64'} relative z-10 overflow-x-hidden pb-24 min-h-screen`}>
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Audio Player */}
      {currentTrack && !isFullPlayerOpen && <MiniAudioPlayer isMobileNavHidden={isMobileNavHidden} />}
      <AnimatePresence>
        {isFullPlayerOpen && <FullPlayer />}
      </AnimatePresence>

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
          onMoveUp={optionsCallbacks?.onMoveUp}
          onMoveDown={optionsCallbacks?.onMoveDown}
        />
      )}

      {optionsTrack && optionsNFT && (
        <NFTOptionsModal
          nft={optionsNFT}
          onClose={() => setOptionsTrack(null)}
        />
      )}

      <CreatePlaylistModal isOpen={isCreatePlaylistModalOpen} onClose={() => setIsCreatePlaylistModalOpen(false)} />
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
      <ScrollToTopButton isMobileNavHidden={isMobileNavHidden} hasMiniPlayer={!!currentTrack && !isFullPlayerOpen} />
      {!isJamspace && <AIAssistant />}

        {/* Mobile Navigation */}
      {!isPostDetail && !isAuthModalOpen && (
        <div className={`lg:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 h-16 transition-all duration-300 w-[calc(100%-48px)] max-w-sm ${isMobileNavHidden ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="absolute inset-0 rounded-[2px] p-[1px] bg-gradient-to-r from-blue-600/50 via-blue-400/50 to-blue-600/50">
            <nav className="h-full w-full bg-background/90 backdrop-blur-xl rounded-[2px] px-4 flex justify-around items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]" aria-label="Mobile Navigation">
              <MobileNavItem to="/" icon={HomeIcon} label="Home" />
              <MobileNavItem to="/discover" icon={MagnifyingGlassIcon} label="Search" />
              <MobileNavItem to="/jamspace" icon={PaperAirplaneIcon} label="Jam" />
              <MobileNavItem to="/library" icon={RectangleStackIcon} label="Vault" />
              <MobileNavItem to="/marketplace" icon={ShoppingBagIcon} label="Asset" />
            </nav>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {isJamspace && (
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className={`lg:hidden fixed right-6 z-[100] w-14 h-14 rounded-full bg-primary shadow-2xl flex items-center justify-center transition-all duration-300 ${isFabActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'} hover:opacity-100 hover:scale-110 active:scale-95 ${
            currentTrack && !isFullPlayerOpen ? 'bottom-36' : 'bottom-20'
          }`}
          aria-label="Create Post"
        >
          <PlusIcon className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
        </button>
      )}
    </div>
      )}
    </TooltipProvider>
  );
};

const SidebarContent = ({ user, userProfile, signOut, onNavigate }: { user: any; userProfile: any; signOut: () => void; onNavigate?: () => void }) => (
  <>
    <div className="flex items-center justify-between mb-2">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm" aria-label="TonJam Home">
        <motion.img 
          layoutId="app-logo"
          src={APP_LOGO} 
          alt="" 
          className="w-[44px] h-[44px] object-contain" 
          aria-hidden="true" 
        />
        <span className="font-bold text-lg tracking-tight text-foreground uppercase italic">Discover</span>
      </Link>
      <ModeToggle />
    </div>

    <nav className="flex-1 space-y-3" aria-label="Main Navigation">
      <NavItem to="/" icon={HomeIcon} label="Home" onClick={onNavigate} />
      <NavItem to="/discover" icon={MagnifyingGlassIcon} label="Search" onClick={onNavigate} />
      <NavItem to="/discover#sonic" icon={SparklesLucide} label="Sonic AI" onClick={onNavigate} className="text-blue-500 bg-blue-500/5 border border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]" />
      <NavItem to="/jamspace" icon={PaperAirplaneIcon} label="JamSpace" onClick={onNavigate} />
      <NavItem to="/auctions" icon={StarIcon} label="Auctions" onClick={onNavigate} />
      <NavItem to="/genesis-forge" icon={TicketIcon} label="Genesis" onClick={onNavigate} />
      <NavItem to="/library" icon={RectangleStackIcon} label="Library" onClick={onNavigate} />
      <NavItem to="/marketplace" icon={ShoppingBagIcon} label="NFT Market" onClick={onNavigate} />
      
      <div className="pt-4 pb-4">
        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Account</p>
        {(userProfile.role === 'artist' || userProfile.role === 'admin' || userProfile.isVerifiedArtist) && (
          <NavItem to={`/artist/${userProfile.uid}`} icon={UserIcon} label="Artist Profile" onClick={onNavigate} />
        )}
        {(userProfile.role === 'artist' || userProfile.role === 'admin' || userProfile.isVerifiedArtist) && (
          <NavItem to="/artist-dashboard" icon={Squares2X2Icon} label="Artist Dashboard" onClick={onNavigate} />
        )}
        {userProfile.role === 'admin' && (
          <NavItem to="/admin" icon={ShieldCheckIcon} label="Admin Console" onClick={onNavigate} />
        )}
        <NavItem to="/profile" icon={UserIcon} label="User Profile" onClick={onNavigate} />
        <NavItem to="/my-nfts" icon={TicketIcon} label="My NFTs" onClick={onNavigate} />
        <NavItem to="/wallet" icon={WalletIcon} label="Wallet" onClick={onNavigate} />
        <NavItem to="/governance" icon={ShieldCheckIcon} label="Governance" onClick={onNavigate} />
        <NavItem to="/staking" icon={ArrowTrendingUpIcon} label="Staking" onClick={onNavigate} />
        <NavItem to="/about" icon={ShieldCheckIcon} label="About Us" onClick={onNavigate} />
        <NavItem to="/settings" icon={Cog6ToothIcon} label="Settings" onClick={onNavigate} />
        {user && (
          <button 
            onClick={() => {
              signOut();
              onNavigate?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[2px] text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all group mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Sign Out"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-left">Sign Out</span>
          </button>
        )}
      </div>

      {userProfile.isVerifiedArtist ? (
        <div className="pt-2 space-y-2">
          <Link 
            to="/upload"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[2px] bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Upload new track"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Upload Track</span>
          </Link>
          
          <Link 
            to="/mint"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[2px] bg-muted/50 text-muted-foreground font-bold hover:bg-muted transition-all border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 text-left"
            aria-label="Mint new NFT"
          >
            <PlusCircleIcon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Mint NFT</span>
          </Link>
        </div>
      ) : (
        <div className="pt-2">
          <Link 
            to="/artist-onboarding"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[2px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold transition-all shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="Become an Artist"
          >
            <StarIcon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Become Artist</span>
          </Link>
        </div>
      )}

      {/* TJ Coin Price Widget */}
      <div className="mt-2 p-2 rounded-[5px] bg-muted/50 border-0 space-y-2" role="complementary" aria-label="Token Price Info">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={TJ_COIN_ICON} alt="JAM Token" className="w-[26px] h-[26px] object-contain" />
            <div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">JAM Price</p>
              <p className="text-sm font-bold text-foreground tracking-tighter">${JAM_PRICE_USD.toFixed(3)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest" aria-label="Price change">+2.4%</p>
          </div>
        </div>
        
        <div className="pt-2 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Your Balance</p>
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

const NavItem = ({ to, icon: Icon, label, onClick, className = "" }: { to: string; icon: any; label: string; onClick?: () => void; className?: string }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-2.5 rounded-[2px] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500
      ${isActive ? 'bg-blue-600/10 text-blue-500 font-black' : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/50'}
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

const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <NavLink 
        to={to} 
        aria-label={label}
        className={({ isActive }) => `
          flex-1 flex flex-col items-center justify-center transition-all gap-1.5 h-12 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 mobile-nav-item
          ${isActive ? 'text-blue-500 scale-110' : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'}
        `}
      >
          {({ isActive }) => (
            <>
              <Icon className={`h-6 w-6 transition-all ${isActive ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-muted-foreground opacity-60'}`} strokeWidth={isActive ? 3 : 2.5} />
              <span className={`text-[8px] font-bold uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>{label}</span>
            </>
          )}
      </NavLink>
    </TooltipTrigger>
    <TooltipContent side="top" className="mb-2">{label}</TooltipContent>
  </Tooltip>
);

export default Layout; 
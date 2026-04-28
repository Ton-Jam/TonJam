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
import PostModal from './PostModal';
import { SearchBar } from './SearchBar';
import { ModeToggle } from './ModeToggle';
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentTrack, 
    notifications, 
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
    createPost
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
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query)
    ).slice(0, 5);
    const nfts = allNFTs.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.artist?.toLowerCase().includes(query)
    ).slice(0, 5);
    const filteredArtists = artists.filter(a => 
      a.name.toLowerCase().includes(query)
    ).slice(0, 5);
    const users = firestoreUsers.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query)
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
  const isPlayer = location.pathname === '/player';
  const isPostDetail = location.pathname.startsWith('/post/');
  const isTrendingNFTs = location.pathname === '/trending-nfts';

  const isNotifications = location.pathname === '/notifications';
  const isWallet = location.pathname === '/wallet';
  const isProfile = location.pathname === '/profile' || location.pathname.startsWith('/profile/');

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
    
    // Scroll handling is simplified to keep headers and nav always visible
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 relative">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-2 focus:py-2 focus:rounded-md focus:font-bold">
        Skip to content
      </a>

      {/* Header */}
      {!isPlayer && !isExplore && !isSearch && (
        <motion.header 
          className={`fixed top-0 left-0 right-0 z-40 px-[var(--page-margin)] md:px-[var(--page-margin-md)] h-16 flex items-center justify-between flex-wrap gap-y-2 ${isPostDetail ? '' : 'lg:left-64'} transition-transform duration-300 border-none ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}
        >
          {/* Animated Background Overlay */}
          <motion.div 
            style={{ opacity: headerOpacity }}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl -z-10 border-b border-blue-500"
          />
          <div className="flex items-center gap-2 flex-1 h-16">
            {(isHome) ? (
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-3 rounded-full hover:bg-muted transition-all"
                aria-label="Open sidebar"
              >
                <motion.img 
                  layoutId="app-logo"
                  src={APP_LOGO} 
                  alt="TonJam Logo" 
                  className="w-[36px] h-[36px] object-contain" 
                />
              </button>
            ) : (
              <>
                  <BackButton 
                    className={`p-3 rounded-full hover:bg-muted transition-all ${isTrendingNFTs ? 'text-white' : 'text-zinc-500 dark:text-muted-foreground hover:text-foreground'}`}
                    ariaLabel="Go back"
                  />
                  <div className="flex items-center gap-2 lg:hidden w-full">
                    {(isJamspace || isLibrary || isMarketplace || isTrendingNFTs) && isHeaderSearchOpen ? (
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className={`bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50 ${isTrendingNFTs ? 'text-white' : 'text-foreground'}`}
                        autoFocus
                      />
                    ) : (
                      <span className={`font-bold text-sm tracking-tight uppercase truncate max-w-[100px] ${isTrendingNFTs ? 'text-white' : 'text-foreground'}`}>
                        {isJamspace ? 'JamSpace' : isPostDetail ? 'Post' : (location.pathname.split('/')[1] || '').replace('-', ' ')}
                      </span>
                    )}
                  </div>
              </>
            )}

            {!isHome && !isDiscover && (
              <>
                {(isJamspace || isLibrary || isMarketplace || isPostDetail || isTrendingNFTs) && !isHeaderSearchOpen && (
                  <div className="hidden lg:flex items-center gap-2 ml-4 flex-1">
                    <span className={`font-bold text-lg tracking-tight uppercase truncate ${isTrendingNFTs ? 'text-white' : 'text-foreground'}`}>
                      {isTrendingNFTs ? 'Trending NFTs' : (isJamspace ? 'JamSpace' : isLibrary ? 'Library' : isMarketplace ? 'Marketplace' : 'Post')}
                    </span>
                  </div>
                )}
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
                  className={`hidden lg:flex flex-1 relative transition-all duration-300 ${isSearchOpen ? 'max-w-6xl' : 'max-w-2xl'}`}
                  inputClassName={`border-none rounded-full py-2.5 pl-5 pr-10 text-sm focus:outline-none transition-all placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500 ${isTrendingNFTs ? 'bg-white/5 text-white focus:bg-white/10' : 'bg-muted/50 text-foreground focus:bg-blue-500/10'}`}
                >
                  {filteredResults && (
                    <div className="p-4 space-y-4">
                      {filteredResults.tracks.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Tracks</h3>
                          {filteredResults.tracks.map(track => (
                            <div key={track.id} className="text-sm p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { playTrack(track); setIsSearchOpen(false); }}>
                              {track.title} - {track.artist}
                            </div>
                          ))}
                        </div>
                      )}
                      {filteredResults.artists.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Artists</h3>
                          {filteredResults.artists.map(artist => (
                            <div key={artist.uid} className="text-sm p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { navigate(`/artist/${artist.uid}`); setIsSearchOpen(false); }}>
                              {artist.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {filteredResults.nfts.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">NFTs</h3>
                          {filteredResults.nfts.map(nft => (
                            <div key={nft.id} className="text-sm p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { navigate(`/nft/${nft.id}`); setIsSearchOpen(false); }}>
                              {nft.title}
                            </div>
                          ))}
                        </div>
                      )}
                      {filteredResults.users.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Users</h3>
                          {filteredResults.users.map(user => (
                            <div key={user.uid} className="text-sm p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { navigate(`/user/${user.uid}`); setIsSearchOpen(false); }}>
                              {user.name} (@{user.username})
                            </div>
                          ))}
                        </div>
                      )}
                      {(!filteredResults.tracks.length && !filteredResults.artists.length && !filteredResults.nfts.length && !filteredResults.users.length) && (
                        <p className="text-sm text-muted-foreground p-2">No results found.</p>
                      )}
                    </div>
                  )}
                </SearchBar>
              </>
            )}

            {isDiscover && (
              <div className="flex-1 flex justify-end lg:justify-start">
              </div>
            )}

            {/* Mobile Search Toggle */}
            {!isHome && !isDiscover && (
              <div className="lg:hidden flex-1 flex justify-end">
                {isSearchOpen ? (
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
                    placeholder="Search..."
                    className="flex-1 relative"
                    inputClassName="bg-muted/50 rounded-full py-2 pl-4 text-sm focus:outline-none focus:bg-blue-500/10 transition-all text-foreground placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500"
                    dropdownClassName="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-2xl overflow-hidden z-50 p-2 max-h-[60vh] overflow-y-auto"
                  >
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2 px-2">
                          <ClockIcon className="h-3 w-3 text-zinc-400 dark:text-muted-foreground" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Recent</span>
                        </div>
                        <div className="space-y-2">
                          {recentSearches.map((item) => (
                            <div key={item} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <button 
                                onClick={() => handleSuggestionClick(item)}
                                className="flex-1 text-left text-xs text-foreground/90"
                              >
                                {item}
                              </button>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleSuggestionClick(item)} className="p-2 text-primary">
                                  <ArrowRightIcon className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => removeRecentSearch(item)} className="p-2 text-destructive/60">
                                  <XMarkIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2 px-2">
                          <ArrowTrendingUpIcon className="h-3 w-3 text-zinc-500 dark:text-primary" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Trending</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {trendingTopics.map((topic, index) => (
                            <button 
                              key={`${topic}-${index}`}
                              onClick={() => handleSuggestionClick(topic)}
                              className="flex items-center justify-between p-2 rounded-lg bg-primary/5 text-xs text-foreground/90 text-left"
                            >
                              <span>{topic}</span>
                              <ArrowTrendingUpIcon className="h-3 w-3 text-primary/60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SearchBar>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {/* TonJam Coin */}
            {isHome && (
              <Link to="/tasks" className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full" aria-label="Tasks">
                <img src={TJ_COIN_ICON} alt="JAM Coin" className="w-[36px] h-[36px] object-contain" />
              </Link>
            )}

            {/* Notification Icon & Marketplace Filters */}
            {(isMarketplace || isJamspace || isLibrary || isTrendingNFTs) && (
              <div className="flex items-center gap-1.5">
                {(isMarketplace) && (
                  <DropdownMenu onOpenChange={(open) => { if (!open) setActiveFilterSubMenu(null); }}>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Filters"
                      >
                        <AdjustmentsHorizontalIcon className="h-6 w-6 text-neutral-500 dark:text-white" strokeWidth={2.5} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[280px] sm:w-72 bg-background border-none shadow-2xl p-2 overflow-hidden" align="end">
                      <div className="flex flex-col max-h-[85vh]">
                        <AnimatePresence mode="wait">
                          {activeFilterSubMenu === null ? (
                            <motion.div 
                              key="main"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col overflow-hidden"
                            >
                              <div className="overflow-y-auto no-scrollbar max-h-[calc(85vh-60px)]">
                                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-2">Filters & Sort</DropdownMenuLabel>
                                <DropdownMenuSeparator className="m-2" />
                                
                                <DropdownMenuItem 
                                  className="flex items-center justify-between px-2 py-2 cursor-pointer focus:bg-muted transition-colors"
                                  onSelect={(e) => { e.preventDefault(); setActiveFilterSubMenu('genre'); }}
                                >
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Genre</span>
                                    <span className="text-[10px] text-muted-foreground lowercase">{marketplaceFilters.genre}</span>
                                  </div>
                                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                  className="flex items-center justify-between px-2 py-2 cursor-pointer focus:bg-muted transition-colors"
                                  onSelect={(e) => { e.preventDefault(); setActiveFilterSubMenu('artist'); }}
                                >
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Artist</span>
                                    <span className="text-[10px] text-muted-foreground lowercase">{marketplaceFilters.artist}</span>
                                  </div>
                                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                  className="flex items-center justify-between px-2 py-2 cursor-pointer focus:bg-muted transition-colors"
                                  onSelect={(e) => { e.preventDefault(); setActiveFilterSubMenu('rarity'); }}
                                >
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Rarity</span>
                                    <span className="text-[10px] text-muted-foreground lowercase">{marketplaceFilters.rarity}</span>
                                  </div>
                                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                  className="flex items-center justify-between px-2 py-2 cursor-pointer focus:bg-muted transition-colors"
                                  onSelect={(e) => { e.preventDefault(); setActiveFilterSubMenu('price'); }}
                                >
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Price Range</span>
                                    <span className="text-[10px] text-muted-foreground lowercase">
                                      {marketplaceFilters.priceRange[0] === 0 && marketplaceFilters.priceRange[1] === 1000 ? 'all prices' : 
                                      `${marketplaceFilters.priceRange[0]}-${marketplaceFilters.priceRange[1]} TON`}
                                    </span>
                                  </div>
                                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="m-2" />
                                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-2">Sort By</DropdownMenuLabel>
                                <DropdownMenuRadioGroup 
                                  value={marketplaceFilters.sortBy} 
                                  onValueChange={(val) => setMarketplaceFilters(prev => ({ ...prev, sortBy: val }))}
                                >
                                  {['Newest', 'Oldest', 'Price: Low to High', 'Price: High to Low', 'Most Liked'].map((option, index) => (
                                    <DropdownMenuRadioItem 
                                      key={`${option}-${index}`} 
                                      value={option} 
                                      className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      {option}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </div>

                              <div className="p-2 bg-background sticky bottom-0 z-10 flex gap-2">
                                <button 
                                  onClick={() => setMarketplaceFilters({
                                    genre: 'All',
                                    artist: 'All',
                                    rarity: 'All',
                                    priceRange: [0, 1000],
                                    sortBy: 'Newest'
                                  })}
                                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-muted transition-colors"
                                >
                                  Clear All
                                </button>
                                <DropdownMenuItem className="flex-1 p-2 focus:bg-transparent">
                                  <button 
                                    className="w-full py-2 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                  >
                                    Done
                                  </button>
                                </DropdownMenuItem>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="sub"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col overflow-hidden"
                            >
                              <button 
                                onClick={() => setActiveFilterSubMenu(null)}
                                className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-muted transition-colors sticky top-0 bg-background z-10"
                              >
                                <ArrowLeftIcon className="h-4 w-4 text-zinc-700" />
                                Back to Menu
                              </button>

                              <div className="overflow-y-auto no-scrollbar max-h-[calc(85vh-120px)]">
                                {activeFilterSubMenu === 'genre' && (
                                  <DropdownMenuRadioGroup value={marketplaceFilters.genre} onValueChange={(val) => setMarketplaceFilters(prev => ({ ...prev, genre: val }))}>
                                    <DropdownMenuRadioItem value="All" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>All Genres</DropdownMenuRadioItem>
                                    {Array.from(new Set(MOCK_TRACKS.map(t => t.genre))).map((g, index) => (
                                      <DropdownMenuRadioItem key={`${g}-${index}`} value={g} className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>{g}</DropdownMenuRadioItem>
                                    ))}
                                  </DropdownMenuRadioGroup>
                                )}

                                {activeFilterSubMenu === 'artist' && (
                                  <DropdownMenuRadioGroup value={marketplaceFilters.artist} onValueChange={(val) => setMarketplaceFilters(prev => ({ ...prev, artist: val }))}>
                                    <DropdownMenuRadioItem value="All" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>All Artists</DropdownMenuRadioItem>
                                    {MOCK_ARTISTS.map((a, index) => (
                                      <DropdownMenuRadioItem key={`${a.name}-${index}`} value={a.name} className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>{a.name}</DropdownMenuRadioItem>
                                    ))}
                                  </DropdownMenuRadioGroup>
                                )}

                                {activeFilterSubMenu === 'rarity' && (
                                  <DropdownMenuRadioGroup value={marketplaceFilters.rarity} onValueChange={(val) => setMarketplaceFilters(prev => ({ ...prev, rarity: val }))}>
                                    <DropdownMenuRadioItem value="All" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>All Rarities</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Unique" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>Unique (1/1)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Rare" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>Rare</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Limited" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>Limited</DropdownMenuRadioItem>
                                  </DropdownMenuRadioGroup>
                                )}

                                {activeFilterSubMenu === 'price' && (
                                  <DropdownMenuRadioGroup 
                                    value={
                                      marketplaceFilters.priceRange[0] === 0 && marketplaceFilters.priceRange[1] === 1000 ? 'All' :
                                      marketplaceFilters.priceRange[0] === 0 && marketplaceFilters.priceRange[1] === 100 ? '0-100' :
                                      marketplaceFilters.priceRange[0] === 100 && marketplaceFilters.priceRange[1] === 500 ? '100-500' : '500+'
                                    } 
                                    onValueChange={(val) => {
                                      if (val === 'All') setMarketplaceFilters(prev => ({ ...prev, priceRange: [0, 1000] }));
                                      else if (val === '0-100') setMarketplaceFilters(prev => ({ ...prev, priceRange: [0, 100] }));
                                      else if (val === '100-500') setMarketplaceFilters(prev => ({ ...prev, priceRange: [100, 500] }));
                                      else if (val === '500+') setMarketplaceFilters(prev => ({ ...prev, priceRange: [500, 1000] }));
                                    }}
                                  >
                                    <DropdownMenuRadioItem value="All" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>All Prices</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="0-100" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>0 - 100 TON</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="100-500" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>100 - 500 TON</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="500+" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>500+ TON</DropdownMenuRadioItem>
                                  </DropdownMenuRadioGroup>
                                )}
                              </div>

                              <div className="p-2 bg-background sticky bottom-0 z-10">
                                <DropdownMenuItem className="p-2 focus:bg-transparent">
                                  <button 
                                    className="w-full py-2 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                  >
                                    Apply & Done
                                  </button>
                                </DropdownMenuItem>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {(isJamspace || isLibrary || isMarketplace || isTrendingNFTs) && (
                    <button 
                      onClick={() => setIsHeaderSearchOpen(!isHeaderSearchOpen)}
                      className={`p-3 rounded-full hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isHeaderSearchOpen ? 'text-blue-500' : 'text-zinc-500 dark:text-neutral-400'}`}
                      aria-label="Search"
                    >
                      <MagnifyingGlassIcon className="h-6 w-6" strokeWidth={2.5} />
                    </button>
                )}
                {isLibrary && (
                  <button 
                    onClick={() => setIsCreatePlaylistModalOpen(true)}
                    className="p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Create Playlist"
                  >
                    <PlusIcon className="h-6 w-6" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}
                {!isJamspace && !isLibrary && !isMarketplace && !isTrendingNFTs && (
                  <button 
                    onClick={() => navigate('/notifications')} 
                    className={`p-2.5 rounded-full hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isNotifications ? 'text-blue-500' : 'text-zinc-500 dark:text-neutral-400'}`}
                    aria-label="Notifications"
                  >
                    <BellIcon className="h-[22px] w-[22px]" strokeWidth={2.5} />
                  </button>
                )}

            {userAddress && !isLibrary && !isJamspace ? (
              <div className="flex items-center gap-1">
                {!isTrendingNFTs && (
                  <div className={`hidden sm:block px-3 py-1.5 text-xs font-mono text-foreground/60`}>
                    {userAddress.slice(0, 4)}...{userAddress.slice(-4)}
                  </div>
                )}
                <button 
                  onClick={() => tonConnectUI.disconnect()}
                  className={`p-2 rounded-full hover:bg-white/10 transition-all flex items-center gap-1 ${isWallet ? 'text-blue-500' : 'text-zinc-500 dark:text-neutral-400'}`}
                  title="Disconnect Wallet"
                >
                  <WalletIcon className="h-[22px] w-[22px]" strokeWidth={2.5} />
                  <ArrowRightOnRectangleIcon className="h-[18px] w-[18px] opacity-40" strokeWidth={2.5} />
                </button>
              </div>
            ) : (!isLibrary && !isJamspace && !userAddress) ? (
              <button 
                onClick={() => tonConnectUI.openModal()}
                className={`px-3 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-1 ${isWallet ? 'text-blue-500' : 'text-zinc-500 dark:text-neutral-400'}`}
              >
                <WalletIcon className="h-[22px] w-[22px]" strokeWidth={2.5} />
                {!isTrendingNFTs && <span className="hidden sm:inline">Connect Wallet</span>}
              </button>
            ) : null}
              {isDiscover && (
              <button 
                onClick={() => setIsDiscoverFiltersOpen(!isDiscoverFiltersOpen)}
                className={`p-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isDiscoverFiltersOpen ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-white/10 text-neutral-500 dark:text-white'}`}
                aria-label="Toggle Filters"
              >
                <FunnelIcon className="h-[22px] w-[22px]" strokeWidth={2.5} />
              </button>
            )}
            {!isMarketplace && !isDiscover && !isLibrary && !isTrendingNFTs && (user ? (
              <Link to="/profile" className={`relative hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full ml-1 ${isProfile ? 'ring-2 ring-blue-500' : ''}`} aria-label="View Profile">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={userProfile?.avatar || user.photoURL || ''} alt={user.displayName || 'User'} className="object-cover" />
                  <AvatarFallback className={`bg-white/10 ${isProfile ? 'text-blue-500' : 'text-white'}`}>{user.displayName ? user.displayName.slice(0, 2).toUpperCase() : <UserIcon className="w-[22px] h-[22px]" strokeWidth={2.5} />}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
              </Link>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className={`p-2.5 rounded-full hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ml-1 ${isAuthModalOpen ? 'text-blue-500' : 'text-zinc-500 dark:text-neutral-400'}`}
                aria-label="Sign In"
              >
                <UserIcon className="h-[22px] w-[22px]" strokeWidth={2.5} />
              </button>
            ))}
          </div>
        </motion.header>
      )}

      {/* Sidebar - Desktop */}
      {!isPlayer && !isPostDetail && (
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
      <main id="main-content" className={`transition-all w-full flex-1 ${isPlayer || isExplore || isPostDetail ? '' : 'pt-16'} ${isPlayer || isPostDetail ? '' : 'lg:w-[calc(100%-16rem)] lg:ml-64'} relative z-10 overflow-x-hidden pb-24 min-h-screen`}>
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

      {optionsTrack && (
        <TrackOptionsModal 
          track={optionsTrack} 
          onClose={() => setOptionsTrack(null)} 
          onRemove={optionsCallbacks?.onRemove}
          onMoveUp={optionsCallbacks?.onMoveUp}
          onMoveDown={optionsCallbacks?.onMoveDown}
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
      {!isPlayer && !isPostDetail && (
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-blue-500 h-[61px] px-2 flex justify-around items-center shadow-2xl transition-transform duration-300 ${isMobileNavHidden ? 'translate-y-full' : 'translate-y-0'}`} aria-label="Mobile Navigation">
          <MobileNavItem to="/" icon={HomeIcon} label="Home" />
          <MobileNavItem to="/discover" icon={MagnifyingGlassIcon} label="Search" />
          <MobileNavItem to="/jamspace" icon={PaperAirplaneIcon} label="JamSpace" />
          <MobileNavItem to="/library" icon={RectangleStackIcon} label="Library" />
          <MobileNavItem to="/marketplace" icon={ShoppingBagIcon} label="NFT" />
        </nav>
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
            className="w-full flex items-center gap-4 px-6 py-4 rounded-[12px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Sign Out"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Sign Out</span>
          </button>
        )}
      </div>

      {userProfile.isVerifiedArtist ? (
        <div className="pt-4 space-y-3">
          <Link 
            to="/upload"
            onClick={onNavigate}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-[12px] bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Upload new track"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Upload Track</span>
          </Link>
          
          <Link 
            to="/mint"
            onClick={onNavigate}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-[12px] bg-muted/50 text-muted-foreground font-bold hover:bg-muted transition-all border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full text-left"
            aria-label="Mint new NFT"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Mint NFT</span>
          </Link>
        </div>
      ) : (
        <div className="pt-4 space-y-3">
          <Link 
            to="/artist-onboarding"
            onClick={onNavigate}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-[12px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-foreground font-bold transition-all shadow-lg shadow-purple-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Become an Artist"
          >
            <StarIcon className="h-5 w-5" />
            <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Become Artist</span>
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
            <p className="text-sm font-bold text-blue-500 tracking-tighter">{parseFloat(userProfile.jamBalance || '0').toLocaleString()} JAM</p>
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
      flex items-center gap-4 px-6 py-4 rounded-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      ${isActive ? 'bg-blue-500/10 text-blue-500 font-bold' : 'text-zinc-500 dark:text-neutral-400 hover:text-foreground hover:bg-white/5'}
      ${className}
    `}
  >
    {({ isActive }) => (
      <>
        <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-blue-500' : 'text-zinc-500 dark:text-neutral-400'}`} strokeWidth={isActive ? 3 : 2} />
        <span className="text-[12px] uppercase font-bold tracking-[0.15em]">{label}</span>
      </>
    )}
  </NavLink>
);

const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink 
    to={to} 
    aria-label={label}
    className={({ isActive }) => `
      flex-1 flex flex-col items-center justify-center transition-all gap-2 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm mobile-nav-item
      ${isActive ? 'text-blue-500 active' : 'text-zinc-500 dark:text-neutral-400'}
    `}
  >
      {({ isActive }) => (
        <Icon className={`h-[22px] w-[22px] transition-transform ${isActive ? 'text-blue-500 scale-110' : 'text-zinc-500 dark:text-neutral-400 scale-100'}`} strokeWidth={2.5} />
      )}
  </NavLink>
);

export default Layout; 
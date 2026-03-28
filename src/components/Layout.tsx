import React, { useState, useEffect, useRef } from 'react';
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
  StarIcon
} from '@heroicons/react/24/outline';
import { APP_LOGO, MOCK_USER, TJ_COIN_ICON, JAM_PRICE_USD, MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'motion/react';
import MiniAudioPlayer from './MiniAudioPlayer';
import FullPlayer from './FullPlayer';
import AddToPlaylistModal from './AddToPlaylistModal';
import TrackOptionsModal from './TrackOptionsModal';
import PostModal from './PostModal';
// import TrackUploadModal from './TrackUploadModal';
import { ModeToggle } from './ModeToggle';
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
    setOptionsTrack,
    createPost
  } = useAudio();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeFilterSubMenu, setActiveFilterSubMenu] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : ['Lo-fi hip hop', 'Cyberpunk Beats', 'Phonk Vibes'];
  });
  const trendingTopics = ['TON Blockchain', 'NFT Drops', 'Jam Sessions', 'Web3 Music', 'Artist Dashboard'];
  const searchRef = useRef<HTMLDivElement>(null);

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
  const isArtistProfile = location.pathname.startsWith('/artist/');
  const isUserProfile = location.pathname.startsWith('/user/') || location.pathname === '/profile';
  const isPlayer = location.pathname === '/player';

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
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 64) {
        setIsHeaderHidden(true);
        document.documentElement.style.setProperty('--header-height', '0px');
      } else {
        setIsHeaderHidden(false);
        document.documentElement.style.setProperty('--header-height', '64px');
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
      {!isPlayer && !isExplore && (
        <header className={`fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl px-[var(--page-margin)] md:px-[var(--page-margin-md)] h-16 flex items-center justify-between lg:left-64 transition-transform duration-300 border-b-0 ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="flex items-center gap-2 flex-1">
            {(isHome || isTasks) ? (
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-3 rounded-full hover:bg-muted transition-all"
                aria-label="Open sidebar"
              >
                <motion.img 
                  layoutId="app-logo"
                  src={APP_LOGO} 
                  alt="TonJam Logo" 
                  className="w-8 h-8 object-contain" 
                />
              </button>
            ) : (
              <>
                <BackButton 
                  className="p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all"
                  ariaLabel="Go back"
                />
                <div className="flex items-center gap-2 lg:hidden w-full">
                  {(isJamspace || isLibrary || isMarketplace) && isHeaderSearchOpen ? (
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold text-sm tracking-tight text-foreground uppercase truncate max-w-[100px]">
                      {isJamspace ? 'JamSpace' : location.pathname.split('/')[1].replace('-', ' ')}
                    </span>
                  )}
                </div>
              </>
            )}

            {!isHome && !isDiscover && (
              <>
                {(isJamspace || isLibrary || isMarketplace) && !isHeaderSearchOpen && (
                  <div className="hidden lg:flex items-center gap-2 ml-4 flex-1">
                    <span className="font-bold text-lg tracking-tight text-foreground uppercase truncate">
                      {isJamspace ? 'JamSpace' : isLibrary ? 'Library' : 'Marketplace'}
                    </span>
                  </div>
                )}
                <div className={`hidden lg:flex flex-1 relative transition-all duration-300 ${isSearchOpen ? 'max-w-6xl' : 'max-w-2xl'} ${(isJamspace || isLibrary || isMarketplace) && !isHeaderSearchOpen ? '!hidden' : ''}`} ref={searchRef}>
                  <ButtonGroupInput 
                  placeholder={getSearchPlaceholder()} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleSearch}
                  className="w-full"
                  inputClassName="bg-muted/50 border border-blue-500/30 rounded-full py-2 pl-4 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/10 transition-all placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500"
                />

                {/* Desktop Search Dropdown */}
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-2 px-2">
                            <ClockIcon className="h-3 w-3 text-zinc-400 dark:text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent Searches</span>
                          </div>
                          <div className="space-y-2">
                            {recentSearches.length > 0 ? (
                              recentSearches.map((item) => (
                                <div key={item} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                  <button 
                                    onClick={() => handleSuggestionClick(item)}
                                    className="flex-1 text-left text-sm text-foreground/80 hover:text-foreground transition-colors"
                                  >
                                    {item}
                                  </button>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => handleSuggestionClick(item)}
                                      className="p-3 rounded-md hover:bg-primary/20 text-primary transition-colors"
                                      title="Search"
                                    >
                                      <ArrowRightIcon className="h-3 w-3" />
                                    </button>
                                    <button 
                                      onClick={() => removeRecentSearch(item)}
                                      className="p-3 rounded-md hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors"
                                      title="Remove"
                                    >
                                      <XMarkIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="px-2 text-xs text-muted-foreground italic">No recent searches</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2 px-2">
                            <ArrowTrendingUpIcon className="h-3 w-3 text-zinc-500 dark:text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trending Now</span>
                          </div>
                          <div className="space-y-2">
                            {trendingTopics.map((topic) => (
                              <div key={topic} className="group flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors">
                                <button 
                                  onClick={() => handleSuggestionClick(topic)}
                                  className="flex-1 text-left text-sm text-foreground/80 hover:text-primary transition-colors"
                                >
                                  {topic}
                                </button>
                                <button 
                                  onClick={() => handleSuggestionClick(topic)}
                                  className="opacity-0 group-hover:opacity-100 p-3 rounded-md bg-primary/10 text-primary transition-all"
                                >
                                  <ArrowTrendingUpIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  <div className="flex-1 relative" ref={searchRef}>
                    <ButtonGroupInput 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      className="w-full"
                      inputClassName="bg-muted/50 border border-blue-500/30 rounded-full py-2 pl-4 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/10 transition-all text-foreground placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500"
                    />

                    {/* Mobile Search Dropdown */}
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-background border border-blue-500/20 rounded-xl shadow-2xl overflow-hidden z-50 p-2 max-h-[60vh] overflow-y-auto"
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
                              {trendingTopics.map((topic) => (
                                <button 
                                  key={topic}
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
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-2 ml-2">
            {/* TonJam Coin */}
            {(isHome || isTasks) && (
              <Link to="/tasks" className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1" aria-label="Tasks">
                <img src={TJ_COIN_ICON} alt="JAM Coin" className="w-8 h-8 object-contain" />
              </Link>
            )}

            {/* Wallet */}
            {isHome && (
              <button 
                onClick={() => tonConnectUI.openModal()}
                className="p-2 rounded-full hover:bg-muted/20 transition-all border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Connect Wallet"
              >
                <WalletIcon className="h-5 w-5 text-zinc-500 dark:text-primary" />
              </button>
            )}

            {/* Notification Icon & Marketplace Filters */}
            {(isMarketplace || isJamspace || isLibrary) && (
              <div className="flex items-center gap-2">
                {(isMarketplace || isLibrary) && (
                  <DropdownMenu onOpenChange={(open) => { if (!open) setActiveFilterSubMenu(null); }}>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Filters"
                      >
                        <AdjustmentsHorizontalIcon className="h-6 w-6" strokeWidth={2.5} />
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
                                  {['Newest', 'Oldest', 'Price: Low to High', 'Price: High to Low', 'Most Liked'].map(option => (
                                    <DropdownMenuRadioItem 
                                      key={option} 
                                      value={option} 
                                      className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      {option}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </div>

                              <div className="p-2 border-t border-border bg-background sticky bottom-0 z-10 flex gap-2">
                                <button 
                                  onClick={() => setMarketplaceFilters({
                                    genre: 'All',
                                    artist: 'All',
                                    rarity: 'All',
                                    priceRange: [0, 1000],
                                    sortBy: 'Newest'
                                  })}
                                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border border-border rounded-lg hover:bg-muted transition-colors"
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
                                className="flex items-center gap-2 px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-muted transition-colors border-b border-border sticky top-0 bg-background z-10"
                              >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Back to Menu
                              </button>

                              <div className="overflow-y-auto no-scrollbar max-h-[calc(85vh-120px)]">
                                {activeFilterSubMenu === 'genre' && (
                                  <DropdownMenuRadioGroup value={marketplaceFilters.genre} onValueChange={(val) => setMarketplaceFilters(prev => ({ ...prev, genre: val }))}>
                                    <DropdownMenuRadioItem value="All" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>All Genres</DropdownMenuRadioItem>
                                    {Array.from(new Set(MOCK_TRACKS.map(t => t.genre))).map(g => (
                                      <DropdownMenuRadioItem key={g} value={g} className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>{g}</DropdownMenuRadioItem>
                                    ))}
                                  </DropdownMenuRadioGroup>
                                )}

                                {activeFilterSubMenu === 'artist' && (
                                  <DropdownMenuRadioGroup value={marketplaceFilters.artist} onValueChange={(val) => setMarketplaceFilters(prev => ({ ...prev, artist: val }))}>
                                    <DropdownMenuRadioItem value="All" className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>All Artists</DropdownMenuRadioItem>
                                    {MOCK_ARTISTS.map(a => (
                                      <DropdownMenuRadioItem key={a.name} value={a.name} className="text-[11px] font-bold uppercase tracking-widest px-2 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>{a.name}</DropdownMenuRadioItem>
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

                              <div className="p-2 border-t border-border bg-background sticky bottom-0 z-10">
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
                {(isJamspace || isLibrary || isMarketplace) && (
                  <button 
                    onClick={() => setIsHeaderSearchOpen(!isHeaderSearchOpen)}
                    className="p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="h-6 w-6" strokeWidth={2.5} />
                  </button>
                )}
                {isJamspace && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Filters"
                      >
                        <AdjustmentsHorizontalIcon className="h-6 w-6" strokeWidth={2.5} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background border-none shadow-2xl">
                      <DropdownMenuLabel>Sort & View</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={jamspaceFilters.sortOrder} onValueChange={(val) => setJamspaceFilters(prev => ({ ...prev, sortOrder: val as any }))}>
                        <DropdownMenuRadioItem value="Newest">Newest</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Oldest">Oldest</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={jamspaceFilters.viewMode} onValueChange={(val) => setJamspaceFilters(prev => ({ ...prev, viewMode: val as any }))}>
                        <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
                {!isJamspace && !isLibrary && !isMarketplace && (
                  <button 
                    onClick={() => navigate('/notifications')} 
                    className="p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Notifications"
                  >
                    <BellIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            
            {/* User Avatar / Sign In */}
            <div className="hidden sm:block">
              <TonConnectButton />
            </div>
            {isDiscover && (
              <button 
                onClick={() => setIsDiscoverFiltersOpen(!isDiscoverFiltersOpen)}
                className={`p-3 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isDiscoverFiltersOpen ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground'}`}
                aria-label="Toggle Filters"
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
            )}
            {!isMarketplace && !isDiscover && !isJamspace && !isLibrary && (user ? (
              <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-blue-500/20 dark:border-0 hover:opacity-80 transition-all flex items-center justify-center bg-blue-500/10 dark:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="View Profile">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt={`${user.user_metadata.full_name || 'User'} avatar`} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-blue-600 dark:text-muted-foreground" />
                )}
              </Link>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="p-3 rounded-full bg-blue-600 dark:bg-primary hover:bg-blue-500 dark:hover:bg-primary/90 text-foreground dark:text-primary-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Sign In"
              >
                <UserIcon className="h-5 w-5" />
              </button>
            ))}
        </header>
      )}

      {/* Sidebar - Desktop */}
      {!isPlayer && (
        <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-background border-r-0 flex-col p-4 z-50 overflow-y-auto transition-colors duration-300" aria-label="Main Sidebar">
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
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent user={user} userProfile={userProfile} signOut={signOut} onNavigate={() => setIsMobileSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main id="main-content" className={`transition-all w-full ${isPlayer || isExplore ? '' : 'pt-16'} ${isPlayer ? '' : 'lg:ml-64'} relative z-10 overflow-x-hidden pb-24`}>
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Audio Player */}
      {currentTrack && !isFullPlayerOpen && <MiniAudioPlayer />}
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
      <ScrollToTopButton />
      <AIAssistant />

      {/* Mobile Navigation */}
      {!isPlayer && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t-0 h-16 px-2 flex justify-around items-center shadow-2xl" aria-label="Mobile Navigation">
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
          className={`lg:hidden fixed right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${
            currentTrack && !isFullPlayerOpen ? 'bottom-36' : 'bottom-20'
          }`}
          aria-label="Create Post"
        >
          <img src={APP_LOGO} alt="" className="w-8 h-8 object-contain" />
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
          className="w-10 h-10 object-contain" 
          aria-hidden="true" 
        />
        <span className="font-bold text-lg tracking-tight text-foreground uppercase italic">Discover</span>
      </Link>
      <ModeToggle />
    </div>

    <nav className="flex-1 space-y-2" aria-label="Main Navigation">
      <NavItem to="/" icon={HomeIcon} label="Home" onClick={onNavigate} />
      <NavItem to="/discover" icon={MagnifyingGlassIcon} label="Search" onClick={onNavigate} />
      <NavItem to="/jamspace" icon={PaperAirplaneIcon} label="JamSpace" onClick={onNavigate} />
      <NavItem to="/library" icon={RectangleStackIcon} label="Library" onClick={onNavigate} />
      <NavItem to="/marketplace" icon={ShoppingBagIcon} label="NFT Market" onClick={onNavigate} />
      
      <div className="pt-2 pb-2">
        <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Account</p>
        {userProfile.isVerifiedArtist && (
          <NavItem to={`/artist/${userProfile.id}`} icon={UserIcon} label="Artist Profile" onClick={onNavigate} />
        )}
        {userProfile.isVerifiedArtist && (
          <NavItem to="/artist-dashboard" icon={Squares2X2Icon} label="Artist Dashboard" onClick={onNavigate} />
        )}
        <NavItem to="/admin" icon={ShieldCheckIcon} label="Admin Console" onClick={onNavigate} />
        <NavItem to="/profile" icon={UserIcon} label="User Profile" onClick={onNavigate} />
        <NavItem to="/wallet" icon={WalletIcon} label="Wallet" onClick={onNavigate} />
        <NavItem to="/staking" icon={ArrowTrendingUpIcon} label="Staking" onClick={onNavigate} />
        <NavItem to="/about" icon={ShieldCheckIcon} label="About Us" onClick={onNavigate} />
        <NavItem to="/settings" icon={Cog6ToothIcon} label="Settings" onClick={onNavigate} />
        {user && (
          <button 
            onClick={() => {
              signOut();
              onNavigate?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Sign Out"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Sign Out</span>
          </button>
        )}
      </div>

      {userProfile.isVerifiedArtist ? (
        <div className="pt-2 space-y-2">
          <Link 
            to="/upload"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Upload new track"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Upload Track</span>
          </Link>
          <Link 
            to="/mint"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] bg-muted/50 text-muted-foreground font-bold hover:bg-muted transition-all border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Mint new NFT"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Mint NFT</span>
          </Link>
        </div>
      ) : (
        <div className="pt-2 space-y-2">
          <Link 
            to="/artist-onboarding"
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-foreground font-bold transition-all shadow-lg shadow-purple-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            <img src={TJ_COIN_ICON} alt="JAM Token" className="w-6 h-6 object-contain" />
            <div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">JAM Price</p>
              <p className="text-sm font-bold text-foreground tracking-tighter">${JAM_PRICE_USD.toFixed(3)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest" aria-label="Price change">+2.4%</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-foreground/5 flex items-center justify-between">
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

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; onClick?: () => void }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      ${isActive ? 'bg-zinc-500/10 text-zinc-900 dark:text-blue-500 font-bold' : 'text-zinc-500 dark:text-neutral-500 hover:text-zinc-700 dark:hover:text-neutral-400 hover:bg-zinc-500/5'}
    `}
  >
    <Icon className="h-6 w-6" />
    <span className="text-[12px] uppercase font-bold tracking-[0.15em]">{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) => (
  <NavLink 
    to={to} 
    aria-label={label}
    className={({ isActive }) => `
      flex-1 flex flex-col items-center justify-center transition-all gap-2 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm mobile-nav-item
      ${isActive ? 'text-blue-600 dark:text-blue-500 active' : 'text-zinc-500 dark:text-neutral-500 hover:text-zinc-700 dark:hover:text-neutral-400'}
    `}
  >
    {({ isActive }) => (
      <Icon className={`h-7 w-7 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
    )}
  </NavLink>
);

export default Layout; 
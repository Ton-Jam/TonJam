import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Search, 
  Send, 
  Library, 
  ShoppingBag, 
  User, 
  Settings as SettingsIcon, 
  Bell,
  PlusCircle,
  LucideIcon,
  Wallet,
  LayoutDashboard,
  Upload,
  Shield,
  TrendingUp,
  ArrowLeft,
  LogOut,
  LogIn,
  PlusCircle as PlusCircleIcon,
  Filter,
  Share2
} from 'lucide-react';
import { APP_LOGO, MOCK_USER, TJ_COIN_ICON, JAM_PRICE_USD } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import MiniAudioPlayer from './MiniAudioPlayer';
import FullPlayer from './FullPlayer';
// import TrackUploadModal from './TrackUploadModal';
import { ModeToggle } from './ModeToggle';
import CreatePlaylistModal from './CreatePlaylistModal';
import AuthModal from './AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrack, notifications, isFullPlayerOpen, userProfile, searchQuery, setSearchQuery, isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen, isDiscoverFiltersOpen, setIsDiscoverFiltersOpen } = useAudio();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const isHome = location.pathname === '/';
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
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
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

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-bold">
        Skip to content
      </a>

      {/* Header */}
      {!isExplore && !isPlayer && (
        <header className={`fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl px-4 md:px-6 h-16 flex items-center justify-between lg:left-64 transition-transform duration-300 border-b-0 ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="flex items-center gap-4 flex-1">
            {!isHome && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            
            <div className="flex items-center gap-3 lg:hidden">
              {isHome ? (
                <img src={APP_LOGO} alt="TonJam Logo" className="w-8 h-8 object-contain" />
              ) : (
                <span className="font-bold text-sm tracking-tight text-foreground uppercase truncate max-w-[100px]">{location.pathname.split('/')[1].replace('-', ' ')}</span>
              )}
            </div>

            {!isHome && !isDiscover && (
              <div className={`hidden lg:flex flex-1 relative transition-all duration-300 ${isSearchOpen ? 'max-w-6xl' : 'max-w-2xl'}`} ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input 
                  type="text" 
                  placeholder={getSearchPlaceholder()} 
                  className="w-full bg-muted/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/70"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleSearch}
                  aria-label="Search"
                />
              </div>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="w-full bg-muted/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      autoFocus
                      aria-label="Search"
                    />
                  </div>
                ) : (
                  location.pathname.startsWith('/marketplace') ? (
                    <button 
                      onClick={() => tonConnectUI.openModal()}
                      className="p-2 rounded-full hover:bg-muted text-primary hover:text-primary/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Connect Wallet"
                    >
                      <Wallet className="h-5 w-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/notifications')} 
                      className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            {(isArtistProfile || isUserProfile) && (
              <button 
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({ url: window.location.href });
                    } else {
                      await navigator.clipboard.writeText(window.location.href);
                    }
                  } catch (err: any) {
                    if (err.name !== 'AbortError') {
                      console.error('Error sharing:', err);
                    }
                  }
                }}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
            )}
            {isHome && (
              <>
                <Link to="/tasks" className="flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full" aria-label="Tasks">
                  <img src={TJ_COIN_ICON} alt="JAM Coin" className="w-8 h-8 object-contain drop-shadow-md" />
                </Link>

                <button 
                  onClick={() => tonConnectUI.openModal()}
                  className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-all border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Connect Wallet"
                >
                  <Wallet className="h-5 w-5 text-primary" />
                </button>
                
                {user ? (
                  <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border-0 hover:opacity-80 transition-all flex items-center justify-center bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="View Profile">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt={`${user.user_metadata.full_name || 'User'} avatar`} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Link>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="p-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Sign In"
                  >
                    <User className="h-5 w-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </header>
      )}

      {/* Sidebar - Desktop */}
      {!isPlayer && (
        <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-background border-r-0 flex-col p-6 z-50 overflow-y-auto transition-colors duration-300" aria-label="Main Sidebar">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm" aria-label="TonJam Home">
              <img src={APP_LOGO} alt="" className="w-10 h-10 object-contain" aria-hidden="true" />
              <span className="font-bold text-lg tracking-tight text-foreground uppercase italic">Discover</span>
            </Link>
            <ModeToggle />
          </div>

          <nav className="flex-1 space-y-2" aria-label="Main Navigation">
            <NavItem to="/" icon={HomeIcon} label="Home" />
            <NavItem to="/discover" icon={Search} label="Search" />
            <NavItem to="/jamspace" icon={Send} label="JamSpace" />
            <NavItem to="/library" icon={Library} label="Library" />
            <NavItem to="/marketplace" icon={ShoppingBag} label="NFT Market" />
            
            <div className="pt-6 pb-2">
              <p className="px-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Account</p>
              {userProfile.isVerifiedArtist && (
                <NavItem to={`/artist/${userProfile.id}`} icon={User} label="Artist Profile" />
              )}
              {userProfile.isVerifiedArtist && (
                <NavItem to="/artist-dashboard" icon={LayoutDashboard} label="Artist Dashboard" />
              )}
              <NavItem to="/admin" icon={Shield} label="Admin Console" />
              <NavItem to="/profile" icon={User} label="User Profile" />
              <NavItem to="/wallet" icon={Wallet} label="Wallet" />
              <NavItem to="/staking" icon={TrendingUp} label="Staking" />
              <NavItem to="/about" icon={Shield} label="About Us" />
              <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
              {user && (
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-4 px-5 py-3 rounded-[5px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Sign Out"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Sign Out</span>
                </button>
              )}
            </div>

            {userProfile.isVerifiedArtist && (
              <div className="pt-6 space-y-3">
                <Link 
                  to="/upload"
                  className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[5px] bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Upload new track"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Upload Track</span>
                </Link>
                <Link 
                  to="/mint"
                  className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[5px] bg-muted/50 text-muted-foreground font-bold hover:bg-muted transition-all border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Mint new NFT"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Mint NFT</span>
                </Link>
              </div>
            )}

            {/* TJ Coin Price Widget */}
            <div className="mt-8 p-4 rounded-[5px] bg-muted/50 border-0 flex items-center justify-between" role="complementary" aria-label="Token Price Info">
              <div className="flex items-center gap-3">
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
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main id="main-content" className={`pb-48 lg:pb-32 transition-all w-full ${isExplore || isPlayer ? 'pt-0' : 'pt-16 lg:pt-16'} ${isPlayer ? 'lg:ml-0' : 'lg:ml-64'} relative z-10`}>
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Audio Player */}
      {currentTrack && !isFullPlayerOpen && <MiniAudioPlayer />}
      {isFullPlayerOpen && <FullPlayer />}

      <CreatePlaylistModal isOpen={isCreatePlaylistModalOpen} onClose={() => setIsCreatePlaylistModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Mobile Navigation */}
      {!isPlayer && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t-0 h-20 px-2 flex justify-around items-center shadow-2xl" aria-label="Mobile Navigation">
          <MobileNavItem to="/" icon={HomeIcon} label="Home" />
          <MobileNavItem to="/discover" icon={Search} label="Search" />
          <MobileNavItem to="/jamspace" icon={Send} label="JamSpace" />
          <MobileNavItem to="/library" icon={Library} label="Library" />
          <MobileNavItem to="/marketplace" icon={ShoppingBag} label="NFT Market" />
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-4 px-5 py-3.5 rounded-[5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
      ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
    `}
  >
    <Icon className="h-6 w-6 stroke-[2.5]" />
    <span className="text-[12px] uppercase font-bold tracking-[0.15em]">{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex-1 flex flex-col items-center justify-center transition-all gap-1.5 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm
      ${isActive ? 'text-blue-500' : 'text-muted-foreground'}
    `}
  >
    {({ isActive }) => (
      <>
        <Icon className={`h-6 w-6 stroke-[2.5] transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
        <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
        <div className={`w-1 h-1 rounded-full bg-blue-500 transition-all mt-0.5 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
      </>
    )}
  </NavLink>
);

export default Layout; 
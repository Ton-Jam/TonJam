import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Search, 
  Music2, 
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
  PlusCircle as PlusCircleIcon
} from 'lucide-react';
import { APP_LOGO, MOCK_USER, TJ_COIN_ICON, JAM_PRICE_USD } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import MiniAudioPlayer from './MiniAudioPlayer';
import FullPlayer from './FullPlayer';
import TrackUploadModal from './TrackUploadModal';
import { ModeToggle } from './ModeToggle';
import CreatePlaylistModal from './CreatePlaylistModal';
import AuthModal from './AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrack, notifications, isFullPlayerOpen, userProfile, searchQuery, setSearchQuery, isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen } = useAudio();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const isHome = location.pathname === '/';
  const isExplore = location.pathname.startsWith('/explore');

  const getSearchPlaceholder = () => {
    const path = location.pathname;
    if (path.startsWith('/marketplace')) return 'Scan Network Protocols (NFTs)...';
    if (path.startsWith('/jamspace')) return 'Search Live Nodes & Sessions...';
    if (path.startsWith('/library')) return 'Search Your Frequencies...';
    if (path.startsWith('/profile')) return 'Search Releases & Activity...';
    if (path.startsWith('/artist-dashboard')) return 'Search Your Catalog & Stats...';
    if (path.startsWith('/discover')) return 'Search Artists, Genres, Vibes...';
    if (path.startsWith('/wallet')) return 'Search Transactions...';
    return 'Search tracks, artists, NFTs...';
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

  return (
    <div className="flex min-h-screen bg-black text-white transition-colors duration-300">
      {/* Header */}
      {!isExplore && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between lg:left-64 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1">
            {!isHome && (
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            
            <div className="flex items-center gap-3 lg:hidden">
              {isHome ? (
                <img src={APP_LOGO} alt="App Logo" className="w-8 h-8 object-contain" />
              ) : (
                <span className="font-bold text-sm tracking-tight text-white uppercase truncate max-w-[100px]">{location.pathname.split('/')[1].replace('-', ' ')}</span>
              )}
            </div>

            {!isHome && (
              <div className={`hidden lg:flex flex-1 relative transition-all duration-300 ${isSearchOpen ? 'max-w-3xl' : 'max-w-xl'}`} ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder={getSearchPlaceholder()} 
                  className="w-full bg-white/5 border border-white/10 rounded-[5px] py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>
            )}

            {/* Mobile Search Toggle */}
            {!isHome && (
              <div className="lg:hidden flex-1 flex justify-end">
                {isSearchOpen ? (
                  <div className="flex-1 relative" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="w-full bg-white/5 border border-white/10 rounded-[10px] py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all">
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            {isHome && (
              <>
                <Link to="/tasks" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                  <img src={TJ_COIN_ICON} alt="Tasks" className="w-8 h-8 object-contain drop-shadow-md" />
                </Link>

                <button 
                  onClick={() => tonConnectUI.openModal()}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                >
                  <Wallet className="h-5 w-5 text-blue-500" />
                </button>
                
                {user ? (
                  <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-all flex items-center justify-center bg-white/5">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white/70" />
                    )}
                  </Link>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all"
                    title="Sign In"
                  >
                    <LogIn className="h-5 w-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </header>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-black border-r border-white/5 flex-col p-6 z-50 overflow-y-auto transition-colors duration-300">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-3">
            <img src={APP_LOGO} alt="App Logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-lg tracking-tight text-white uppercase italic">TonJam</span>
          </Link>
          <ModeToggle />
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={HomeIcon} label="Home" />
          <NavItem to="/discover" icon={Search} label="Search" />
          <NavItem to="/jamspace" icon={Music2} label="JamSpace" />
          <NavItem to="/library" icon={Library} label="Library" />
          <NavItem to="/marketplace" icon={ShoppingBag} label="Marketplace" />
          
          <div className="pt-6 pb-2">
            <p className="px-5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Account</p>
            <NavItem to="/artist-dashboard" icon={LayoutDashboard} label="Artist Dashboard" />
            <NavItem to="/admin" icon={Shield} label="Admin Console" />
            <NavItem to="/profile" icon={User} label="Profile" />
            <NavItem to="/wallet" icon={Wallet} label="Wallet" />
            <NavItem to="/staking" icon={TrendingUp} label="Staking" />
            <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
            {user && (
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-4 px-5 py-3 rounded-[5px] text-white/40 hover:text-red-500 hover:bg-red-500/5 transition-all group mt-2"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Sign Out</span>
              </button>
            )}
          </div>

          {userProfile.isVerifiedArtist && (
            <div className="pt-6 space-y-3">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[5px] bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Upload Track</span>
              </button>
              <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[5px] bg-white/5 text-white/60 font-bold hover:bg-white/10 transition-all border border-white/5">
                <PlusCircle className="h-5 w-5" />
                <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Mint NFT</span>
              </button>
            </div>
          )}

          {/* TJ Coin Price Widget */}
          <div className="mt-8 p-4 rounded-[5px] bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={TJ_COIN_ICON} alt="JAM" className="w-6 h-6 object-contain" />
              <div>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">JAM Price</p>
                <p className="text-sm font-bold text-white tracking-tighter">${JAM_PRICE_USD.toFixed(3)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">+2.4%</p>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`pb-32 lg:pb-24 lg:ml-64 transition-all w-full ${isExplore ? 'pt-0' : 'pt-16 lg:pt-16'}`}>
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Audio Player */}
      {currentTrack && !isFullPlayerOpen && <MiniAudioPlayer />}
      {isFullPlayerOpen && <FullPlayer />}

      <TrackUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <CreatePlaylistModal isOpen={isCreatePlaylistModalOpen} onClose={() => setIsCreatePlaylistModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/5 h-20 px-2 flex justify-around items-center shadow-2xl">
        <MobileNavItem to="/" icon={HomeIcon} label="Home" />
        <MobileNavItem to="/discover" icon={Search} label="Search" />
        <MobileNavItem to="/jamspace" icon={Music2} label="JamSpace" />
        <MobileNavItem to="/library" icon={Library} label="Library" />
        <MobileNavItem to="/marketplace" icon={ShoppingBag} label="Market" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-4 px-5 py-3.5 rounded-[5px] transition-all
      ${isActive ? 'bg-blue-600/10 text-blue-500 font-bold' : 'text-white/40 hover:text-white hover:bg-white/5'}
    `}
  >
    <Icon className="h-5 w-5" />
    <span className="text-[12px] uppercase font-bold tracking-[0.15em]">{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex-1 flex flex-col items-center justify-center transition-all gap-1.5 h-full
      ${isActive ? 'text-blue-500' : 'text-white/40'}
    `}
  >
    {({ isActive }) => (
      <>
        <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
        <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
        <div className={`w-1 h-1 rounded-full bg-blue-500 transition-all mt-0.5 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
      </>
    )}
  </NavLink>
);

export default Layout; 
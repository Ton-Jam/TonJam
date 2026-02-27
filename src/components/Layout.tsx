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
  LayoutDashboard
} from 'lucide-react';
import { APP_LOGO, MOCK_USER, TJ_COIN_ICON } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import MiniAudioPlayer from './MiniAudioPlayer';
import FullPlayer from './FullPlayer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrack, notifications, isFullPlayerOpen } = useAudio();
  const { user } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const isHome = location.pathname === '/';

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
      {isHome && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between lg:left-64 transition-colors duration-300">
          <div className="flex items-center gap-3 lg:hidden">
            <img src={APP_LOGO} alt="App Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight text-white uppercase">TonJam</span>
          </div>
          
          <div className="hidden lg:flex flex-1 max-w-xl relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search tracks, artists, NFTs..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* TonJam Coin Icon -> Tasks */}
            <Link to="/tasks" className="p-2 hover:opacity-80 transition-opacity">
              <img src={TJ_COIN_ICON} alt="Tasks" className="w-6 h-6 object-contain" />
            </Link>

            {/* Wallet Icon -> TonConnect */}
            <button 
              onClick={() => tonConnectUI.openModal()}
              className="p-2 text-white hover:text-blue-400 transition-colors"
            >
              <Wallet className="w-6 h-6" />
            </button>
            
            {/* Avatar -> Profile */}
            <Link to="/profile" className="p-1 hover:opacity-80 transition-opacity">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </Link>
          </div>
        </header>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-black border-r border-white/5 flex-col p-6 z-50 overflow-y-auto transition-colors duration-300">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <img src={APP_LOGO} alt="App Logo" className="w-10 h-10 object-contain" />
          <span className="font-bold text-xl tracking-tight text-white uppercase italic">TonJam</span>
        </Link>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={HomeIcon} label="Home" />
          <NavItem to="/discover" icon={Search} label="Search" />
          <NavItem to="/jamspace" icon={Music2} label="JamSpace" />
          <NavItem to="/library" icon={Library} label="Library" />
          <NavItem to="/marketplace" icon={ShoppingBag} label="Marketplace" />
          
          <div className="pt-6 pb-2">
            <p className="px-5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Account</p>
            <NavItem to="/artist-dashboard" icon={LayoutDashboard} label="Artist Dashboard" />
            <NavItem to="/profile" icon={User} label="Profile" />
            <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
          </div>

          <div className="pt-6">
            <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[10px] bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
              <PlusCircle className="h-5 w-5" />
              <span className="text-[12px] uppercase font-bold tracking-[0.15em]">Mint NFT</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`pb-32 lg:pb-24 lg:ml-64 transition-all w-full ${isHome ? 'pt-16 lg:pt-16' : ''}`}>
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Audio Player */}
      {currentTrack && !isFullPlayerOpen && <MiniAudioPlayer />}
      {isFullPlayerOpen && <FullPlayer />}

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
      flex items-center gap-4 px-5 py-3.5 rounded-[10px] transition-all
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
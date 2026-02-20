
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import MiniAudioPlayer from './MiniAudioPlayer';
import FullAudioPlayer from './FullAudioPlayer';
import TrackOptionsModal from './TrackOptionsModal';
import { APP_LOGO, TJ_COIN_ICON, MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS } from '../constants';
import { useAudio } from '../context/AudioContext';
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const userAddress = useTonAddress();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const location = useLocation();
  const navigate = useNavigate();
  const { isFullPlayerOpen, currentTrack, optionsTrack, setOptionsTrack, userProfile, addNotification } = useAudio();

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

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { artists: [], tracks: [], nfts: [] };
    const query = searchQuery.toLowerCase();
    return {
      artists: MOCK_ARTISTS.filter(a => a.name.toLowerCase().includes(query)).slice(0, 3),
      tracks: MOCK_TRACKS.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)).slice(0, 3),
      nfts: MOCK_NFTS.filter(n => n.title.toLowerCase().includes(query) || n.creator.toLowerCase().includes(query)).slice(0, 3)
    };
  }, [searchQuery]);

  const handleWalletAction = async () => {
    try {
      if (wallet) {
        await tonConnectUI.disconnect();
        addNotification("Wallet Disconnected", "info");
      } else {
        // Trigger the connection modal without clearing storage to avoid breaking the handshake
        await tonConnectUI.openModal();
        
        // Reminder for Testnet users
        addNotification("Check Tonkeeper is in TESTNET mode", "info", 5000);
      }
    } catch (e) {
      console.error("TON Connect UI Error:", e);
      addNotification("Wallet Protocol Failed", "error");
    }
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-0 lg:pl-64 bg-black text-white">
      {/* Top Header - Strictly Home Screen Only */}
      {isHome && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-white/5 px-4 md:px-12 py-2 flex items-center justify-between lg:left-64">
          <div className="flex items-center gap-2 lg:hidden">
            <img 
              src={APP_LOGO} 
              alt="TonJam" 
              className="w-14 h-14 object-contain" 
            />
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tighter italic text-white uppercase leading-none">TONJAM</span>
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mt-1">TESTNET</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center bg-white/5 border border-white/10 px-6 py-2.5 w-[320px] rounded-xl relative" ref={searchRef}>
            <i className="fas fa-search text-white/60 mr-4"></i>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search frequencies..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/40 italic font-medium"
            />
            
            {/* Search Dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-4 space-y-6">
                  
                  {/* Artists */}
                  {searchResults.artists.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic mb-3">Nodes</h4>
                      <div className="space-y-2">
                        {searchResults.artists.map(artist => (
                          <div 
                            key={artist.id}
                            onClick={() => {
                              navigate(`/artist/${artist.id}`);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                          >
                            <img src={artist.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-black text-white italic group-hover:text-blue-400 transition-colors">{artist.name}</p>
                                {artist.verified && <i className="fas fa-check-circle text-blue-500 text-[8px]"></i>}
                              </div>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">{artist.followers.toLocaleString()} Fans</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracks */}
                  {searchResults.tracks.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic mb-3">Frequencies</h4>
                      <div className="space-y-2">
                        {searchResults.tracks.map(track => (
                          <div 
                            key={track.id}
                            onClick={() => {
                              navigate('/library'); // Or wherever tracks are best viewed
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                          >
                            <img src={track.coverUrl} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                            <div>
                              <p className="text-xs font-black text-white italic group-hover:text-blue-400 transition-colors">{track.title}</p>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">{track.artist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NFTs */}
                  {searchResults.nfts.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic mb-3">Assets</h4>
                      <div className="space-y-2">
                        {searchResults.nfts.map(nft => (
                          <div 
                            key={nft.id}
                            onClick={() => {
                              navigate('/marketplace');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                          >
                            <img src={nft.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                            <div>
                              <p className="text-xs font-black text-white italic group-hover:text-blue-400 transition-colors">{nft.title}</p>
                              <p className="text-[8px] text-blue-500 uppercase tracking-widest">{nft.price} TON</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.artists.length === 0 && searchResults.tracks.length === 0 && searchResults.nfts.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">No signals detected.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button 
              onClick={() => navigate('/tasks')}
              className="w-8 h-8 md:w-[38px] md:h-[38px] transition-transform active:scale-95 hover:scale-110 flex-shrink-0"
            >
              <img src={TJ_COIN_ICON} className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]" alt="TJ Coin" />
            </button>

            {/* Wallet Button */}
            <button 
              onClick={handleWalletAction}
              className={`relative w-10 h-10 flex items-center justify-center transition-all active:scale-90 group ${
                userAddress ? 'text-blue-400' : 'text-white/40 hover:text-white'
              }`}
            >
              <i className={`fas ${userAddress ? 'fa-link' : 'fa-wallet'} text-lg`}></i>
              {userAddress && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse"></span>
              )}
            </button>
            
            <Link to="/profile" className="relative flex-shrink-0">
              <div className={`p-0.5 rounded-full border transition-all ${userAddress ? 'border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'border-white/10'}`}>
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 md:w-[38px] md:h-[38px] rounded-full object-cover"
                />
              </div>
            </Link>
          </div>
        </header>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-black border-r border-white/5 flex-col p-8 z-50 overflow-y-auto no-scrollbar">
        <Link to="/" className="flex items-center gap-3 mb-16 group">
          <img 
            src={APP_LOGO} 
            alt="TonJam" 
            className="w-16 h-16 object-contain group-hover:rotate-12 transition-transform" 
          />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter italic text-white uppercase leading-none">TONJAM</span>
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mt-1">TESTNET</span>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          <NavItem to="/" icon="fa-house" label="Home" />
          <NavItem to="/discover" icon="fa-magnifying-glass" label="Search" />
          <NavItem to="/jamspace" icon="fa-users" label="JamSpace" />
          <NavItem to="/library" icon="fa-layer-group" label="Library" />
          <NavItem to="/marketplace" icon="fa-store" label="NFTs" />
          <div className="pt-8 pb-3 text-[8px] font-black text-white/30 uppercase tracking-[0.4em] px-5">Developer</div>
          <NavItem to="/forge" icon="fa-code-branch" label="Protocol Forge" />
          <div className="pt-8 pb-3 text-[8px] font-black text-white/30 uppercase tracking-[0.4em] px-5">Rewards</div>
          <NavItem to="/tasks" icon="fa-gem" label="Earn TJ" />
          <div className="pt-8 pb-3 text-[8px] font-black text-white/30 uppercase tracking-[0.4em] px-5">Account</div>
          <NavItem to="/profile" icon="fa-user" label="Profile" />
          <NavItem to="/settings" icon="fa-cog" label="Settings" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`${isHome ? 'pt-16' : 'pt-6'} transition-all w-full`}>
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/5 h-16 px-4 flex justify-between items-center shadow-2xl">
        <MobileNavItem to="/" icon="fa-house" />
        <MobileNavItem to="/discover" icon="fa-magnifying-glass" />
        <MobileNavItem to="/jamspace" icon="fa-users" />
        <MobileNavItem to="/forge" icon="fa-code-branch" />
        <MobileNavItem to="/library" icon="fa-layer-group" />
        <MobileNavItem to="/marketplace" icon="fa-store" />
      </nav>

      <MiniAudioPlayer onOptionsClick={() => currentTrack && setOptionsTrack(currentTrack)} />
      {isFullPlayerOpen && <FullAudioPlayer />}
      {optionsTrack && (
        <TrackOptionsModal 
          track={optionsTrack} 
          onClose={() => setOptionsTrack(null)} 
        />
      )}
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all
      ${isActive ? 'bg-blue-600/10 text-white font-black border-l-2 border-blue-500' : 'text-white/50 hover:text-white hover:bg-white/5'}
    `}
  >
    <i className={`fas ${icon} text-base w-6 text-center`}></i>
    <span className="text-[10px] uppercase font-black tracking-[0.15em]">{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon }: { to: string; icon: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      w-12 h-12 flex flex-col items-center justify-center transition-all gap-1 rounded-xl
      ${isActive ? 'text-blue-500 bg-blue-500/5' : 'text-white/40 hover:text-white'}
    `}
  >
    {({ isActive }) => (
      <>
        <i className={`fas ${icon} text-lg`}></i>
        <div className={`w-1 h-1 rounded-full bg-blue-500 transition-all ${isActive ? 'scale-100' : 'scale-0'}`}></div>
      </>
    )}
  </NavLink>
);

export default Layout;

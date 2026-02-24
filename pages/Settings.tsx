
import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { TON_LOGO, MOCK_USER } from '../constants';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { supabase } from '../services/supabaseClient';

type SettingsCategory = 'General' | 'Audio' | 'Web3' | 'Social' | 'Advanced';

const Settings: React.FC = () => {
  const { addNotification, userProfile, setUserProfile } = useAudio();
  const { user, signInWithGoogle, signOut } = useAuth();
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('General');
  const [isSyncing, setIsSyncing] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);
  
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('tonjam_theme') || 'dark');

  const themes = [
    { id: 'dark', name: 'Midnight', color: 'bg-black border-white/20' },
    { id: 'light', name: 'Sun', color: 'bg-white border-black/10' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-[#050014] border-[#00fff2]/50' },
    { id: 'ocean', name: 'Ocean', color: 'bg-[#02040a] border-[#38bdf8]/50' },
    { id: 'forest', name: 'Forest', color: 'bg-[#020a02] border-[#34d399]/50' },
  ];

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('tonjam_theme', themeId);
    document.documentElement.classList.remove('light', 'cyberpunk', 'ocean', 'forest');
    if (themeId !== 'dark') {
      document.documentElement.classList.add(themeId);
    }
    addNotification(`${themes.find(t => t.id === themeId)?.name} theme activated`, 'success');
  };

  const [settings, setSettings] = useState({
    notifications: true,
    autoplay: true,
    audioQuality: 'Extreme (Lossless)',
    publicProfile: true,
    allowTips: true,
    explicitContent: false,
    downloadOverCellular: false
  });

  useEffect(() => {
    // Check if user has spotify data
    if (user?.user_metadata?.spotify) {
      setSpotifyProfile(user.user_metadata.spotify);
    }
  }, [user]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_VERIFIED') {
        const profile = event.data.data;
        setSpotifyProfile(profile);
        addNotification(`Verified as ${profile.display_name}`, 'success');
        
        if (user) {
          const { error } = await supabase.auth.updateUser({
            data: { spotify: profile }
          });
          if (error) {
            console.error('Error saving Spotify profile:', error);
            addNotification('Failed to save verification status', 'error');
          } else {
            addNotification('Verification saved to profile', 'success');
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, addNotification]);

  const handleSpotifyConnect = async () => {
    try {
      const response = await fetch('/api/auth/spotify/url');
      const { url } = await response.json();
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(url, 'Spotify Verification', `width=${width},height=${height},top=${top},left=${left}`);
    } catch (error) {
      console.error('Failed to start Spotify auth:', error);
      addNotification('Failed to start Spotify verification', 'error');
    }
  };

  const categories: { id: SettingsCategory; icon: string }[] = [
    { id: 'General', icon: 'fa-sliders' },
    { id: 'Audio', icon: 'fa-headphones' },
    { id: 'Web3', icon: 'fa-link' },
    { id: 'Social', icon: 'fa-users' },
    { id: 'Advanced', icon: 'fa-microchip' },
  ];

  const toggleSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    addNotification(`${String(key).replace(/([A-Z])/g, ' $1').trim()} updated`, 'success');
  };

  const handleResetConnection = () => {
    localStorage.removeItem('ton-connect-storage_http-bridge-framework');
    addNotification("Connection state purged. Please try reconnecting.", "success");
    if (userAddress) tonConnectUI.disconnect();
  };

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-8">
      <h2 className="text-xl font-black tracking-tighter uppercase text-white mb-2">{title}</h2>
      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">{description}</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 pb-32 max-w-6xl mx-auto px-4 md:px-12">
      <header className="py-12 flex flex-col items-center md:items-start">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.6em]">Network Protocols</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none mb-10">
          Settings
        </h1>

        {/* Categories - Pill Buttons */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar w-full pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-8 py-3.5 rounded-full flex items-center gap-3 transition-all border ${
                activeCategory === cat.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20'
                  : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white'
              }`}
            >
              <i className={`fas ${cat.icon} text-xs`}></i>
              <span className="text-[10px] font-black uppercase tracking-widest">{cat.id}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          
          {activeCategory === 'General' && (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
              <section className="glass p-10 rounded-lg border-white/5 border">
                <SectionHeader title="Interface Identity" description="Adjust your sensory experience" />
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-4">Interface Theme</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {themes.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={`relative p-4 rounded-xl border transition-all group overflow-hidden ${
                            currentTheme === theme.id 
                              ? 'border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className={`absolute inset-0 opacity-20 ${theme.color}`}></div>
                          <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full border-2 ${theme.color} shadow-lg`}></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${currentTheme === theme.id ? 'text-blue-400' : 'text-white/40'}`}>
                              {theme.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <SettingToggle 
                    label="Native Notifications" 
                    description="Push alerts for new drops, biddings, and feed signals" 
                    active={settings.notifications} 
                    onToggle={() => toggleSetting('notifications')} 
                  />
                </div>
              </section>

              {/* Supabase Integration */}
              <section className="glass p-10 rounded-lg border-green-500/20 border bg-green-500/[0.02]">
                <SectionHeader title="Cloud Sync" description="Synchronize profile with Supabase Network" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Supabase Status</h4>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">
                      {user ? `Connected: ${user.email}` : "Disconnected"}
                    </p>
                  </div>
                  {user ? (
                    <button 
                      onClick={signOut}
                      className="px-6 py-2 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                    >
                      Disconnect Cloud
                    </button>
                  ) : (
                    <button 
                      onClick={signInWithGoogle}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
                    >
                      Connect Google
                    </button>
                  )}
                </div>
              </section>

              {/* Connection Doctor */}
              <section className="glass p-10 rounded-lg border-blue-500/20 border bg-blue-500/[0.02]">
                <SectionHeader title="Connection Doctor" description="Troubleshoot wallet pairing issues" />
                <div className="space-y-6">
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black">
                    If Tonkeeper is not opening or failing to connect, try resetting the bridge state. Remember to enable <span className="text-blue-500">Testnet mode</span> in Tonkeeper settings (tap version 5 times).
                  </p>
                  <button 
                    onClick={handleResetConnection}
                    className="px-8 py-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Reset Connection State
                  </button>
                </div>
              </section>
            </div>
          )}
          
          {activeCategory === 'Web3' && (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
               <section className="glass p-10 rounded-lg border-white/5 border">
                <SectionHeader title="Network Node" description="Manage blockchain connectivity" />
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">Active Wallet</h4>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">
                        {userAddress ? userAddress : "Disconnected"}
                      </p>
                    </div>
                    {userAddress ? (
                      <button 
                        onClick={() => tonConnectUI.disconnect()}
                        className="px-6 py-2 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button 
                        onClick={() => tonConnectUI.openModal()}
                        className="px-6 py-2 electric-blue-bg text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
               </section>
            </div>
          )}

          {activeCategory === 'Social' && (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
               <section className="glass p-10 rounded-lg border-white/5 border">
                <SectionHeader title="Artist Verification" description="Prove your identity across platforms" />
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${spotifyProfile ? 'bg-[#1DB954]' : 'bg-white/5'}`}>
                            <i className="fab fa-spotify text-2xl text-white"></i>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Spotify</h4>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">
                                {spotifyProfile ? `Verified: ${spotifyProfile.display_name}` : "Not Verified"}
                            </p>
                        </div>
                    </div>
                    {spotifyProfile ? (
                      <div className="px-4 py-2 bg-[#1DB954]/10 text-[#1DB954] rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#1DB954]/20">
                        Verified
                      </div>
                    ) : (
                      <button 
                        onClick={handleSpotifyConnect}
                        className="px-6 py-2 bg-[#1DB954] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20"
                      >
                        Verify Artist
                      </button>
                    )}
                  </div>
                </div>
               </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SettingToggleProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ label, description, active, onToggle }) => (
  <div className="flex items-center justify-between gap-8 group">
    <div className="flex-1">
      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-blue-400 transition-colors">{label}</h4>
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{description}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 border flex-shrink-0 ${
        active 
          ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${active ? 'left-[1.9rem]' : 'left-1.5'}`}></div>
    </button>
  </div>
);

export default Settings;

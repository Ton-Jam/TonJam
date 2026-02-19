
import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { TON_LOGO, MOCK_USER } from '../constants';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

type SettingsCategory = 'General' | 'Audio' | 'Web3' | 'Social' | 'Advanced';

const Settings: React.FC = () => {
  const { addNotification, userProfile, setUserProfile } = useAudio();
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('General');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: true,
    autoplay: true,
    audioQuality: 'Extreme (Lossless)',
    darkMode: !document.documentElement.classList.contains('light'),
    publicProfile: true,
    allowTips: true,
    explicitContent: false,
    downloadOverCellular: false
  });

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
    
    if (key === 'darkMode') {
      if (newValue) {
        document.documentElement.classList.remove('light');
        localStorage.setItem('tonjam_theme', 'dark');
        addNotification("Neural Dark enabled", 'info');
      } else {
        document.documentElement.classList.add('light');
        localStorage.setItem('tonjam_theme', 'light');
        addNotification("Solar Light enabled", 'info');
      }
      return;
    }

    addNotification(`${String(key).replace(/([A-Z])/g, ' $1').trim()} updated`, 'success');
  };

  const handleResetConnection = () => {
    localStorage.removeItem('ton-connect-storage_http-bridge-framework');
    addNotification("Connection state purged. Please try reconnecting.", "success");
    if (userAddress) tonConnectUI.disconnect();
  };

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-8">
      <h2 className="text-xl font-black italic tracking-tighter uppercase text-white mb-2">{title}</h2>
      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black italic">{description}</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 pb-32 max-w-6xl mx-auto px-4 md:px-12">
      <header className="py-12 flex flex-col items-center md:items-start">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.6em] italic">Network Protocols</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none mb-10">
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
                  <SettingToggle 
                    label="Dark Interface" 
                    description="High-contrast neural theme optimized for night synchronization" 
                    active={settings.darkMode} 
                    onToggle={() => toggleSetting('darkMode')} 
                  />
                  <SettingToggle 
                    label="Native Notifications" 
                    description="Push alerts for new drops, biddings, and feed signals" 
                    active={settings.notifications} 
                    onToggle={() => toggleSetting('notifications')} 
                  />
                </div>
              </section>

              {/* Connection Doctor */}
              <section className="glass p-10 rounded-lg border-blue-500/20 border bg-blue-500/[0.02]">
                <SectionHeader title="Connection Doctor" description="Troubleshoot wallet pairing issues" />
                <div className="space-y-6">
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black italic">
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
                      <h4 className="text-sm font-black text-white uppercase italic tracking-tight">Active Wallet</h4>
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
      <h4 className="text-sm font-black text-white uppercase italic tracking-tight mb-1 group-hover:text-blue-400 transition-colors">{label}</h4>
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold italic">{description}</p>
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

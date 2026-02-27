import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, User, Wallet, Moon, Sun, Globe, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const SettingItem = ({ icon: Icon, label, description, children }: any) => (
    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">{label}</h3>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-4xl mx-auto pb-32">
      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Settings</h1>
        <p className="text-sm font-bold text-white/20 uppercase tracking-[0.3em]">Configure your neural interface</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.5em] mb-4">Account Protocols</h2>
        
        <SettingItem 
          icon={User} 
          label="Profile Identity" 
          description="Manage your public presence and bio"
        >
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest transition-all">Edit</button>
        </SettingItem>

        <SettingItem 
          icon={Wallet} 
          label="Wallet Connection" 
          description={user?.id ? "Connected to TON Mainnet" : "No wallet detected"}
        >
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">Manage</button>
        </SettingItem>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.5em] mb-4">Preferences</h2>
        
        <SettingItem 
          icon={Bell} 
          label="Signal Notifications" 
          description="Receive alerts for sales and drops"
        >
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'left-7' : 'left-1'}`} />
          </button>
        </SettingItem>

        <SettingItem 
          icon={darkMode ? Moon : Sun} 
          label="Visual Interface" 
          description="Toggle between light and dark modes"
        >
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </SettingItem>

        <SettingItem 
          icon={Globe} 
          label="Regional Node" 
          description="Select your primary data center"
        >
          <select className="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer">
            <option className="bg-neutral-900">Europe-West</option>
            <option className="bg-neutral-900">US-East</option>
            <option className="bg-neutral-900">Asia-Pacific</option>
          </select>
        </SettingItem>
      </div>

      <div className="pt-10 border-t border-white/5">
        <button 
          onClick={() => signOut()}
          className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Heart, Zap, Gavel, UserPlus, ChevronRight, Satellite } from 'lucide-react';
import { APP_LOGO, TJ_COIN_ICON, TON_LOGO } from '@/constants';
import NotificationDetailModal from '@/components/NotificationDetailModal';
import { useAudio } from '@/context/AudioContext';

type NotificationType = 'Social' | 'Syncs' | 'Rewards' | 'System';

interface NotifyItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon?: string;
  img?: string;
}

const MOCK_NOTIFICATIONS: NotifyItem[] = [
  { id: '1', type: 'Syncs', title: 'NFT SOLD', message: 'Solar Pulse #001 synced to @crypto_whale for 12.5 TON', time: '2m ago', isRead: false, icon: 'gem' },
  { id: '2', type: 'Rewards', title: 'TJ COIN EARNED', message: 'Protocol bonus: +250 TJ earned for "Neon Nights" streak', time: '15m ago', isRead: false, img: TJ_COIN_ICON },
  { id: '3', type: 'Social', title: 'SIGNAL RESONANCE', message: '@luna_ray liked your broadcast: "Synthesized soul..."', time: '1h ago', isRead: true, icon: 'heart' },
  { id: '4', type: 'System', title: 'RELAY UPDATE', message: 'TonJam Node v1.0.4 synchronized successfully', time: '4h ago', isRead: true, icon: 'zap' },
  { id: '5', type: 'Syncs', title: 'NEW BID', message: 'Your bid on "Deep Horizon #042" has been outbid', time: '6h ago', isRead: true, icon: 'gavel' },
  { id: '6', type: 'Social', title: 'NEW FOLLOWER', message: '@beat_architect is now tracking your frequencies', time: '1d ago', isRead: true, icon: 'user-plus' },
];

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { followedUserIds, artists, firestoreUsers } = useAudio();
  const [activeTab, setActiveTab] = useState<'All' | NotificationType>('All');
  const [notifications, setNotifications] = useState<NotifyItem[]>(MOCK_NOTIFICATIONS);
  const [selectedNotification, setSelectedNotification] = useState<NotifyItem | null>(null);

  // Helper to determine if a notification is from a followed user
  const isFromFollowedUser = (message: string) => {
    const followedNames = [
      ...artists.filter(a => followedUserIds.includes(a.uid)).map(a => a.name.toLowerCase()),
      ...firestoreUsers.filter(u => followedUserIds.includes(u.uid)).map(u => u.name.toLowerCase()),
      ...firestoreUsers.filter(u => followedUserIds.includes(u.uid)).map(u => u.username.toLowerCase())
    ];
    
    // For mock matching
    if (followedNames.length > 0 && (message.includes('@luna_ray') || message.includes('@crypto_whale') || message.includes('Neon Nights'))) {
      return true;
    }
    
    return followedNames.some(name => message.toLowerCase().includes(name));
  };

  const filtered = (activeTab === 'All' ? notifications : notifications.filter(n => n.type === activeTab))
    .sort((a, b) => {
      const aFollowed = isFromFollowedUser(a.message);
      const bFollowed = isFromFollowedUser(b.message);
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;
      return 0;
    });

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotifyItem) => {
    if (!item.isRead) {
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    }
    setSelectedNotification(item);
  };

  const renderIcon = (item: NotifyItem) => {
    if (item.img) return <img src={item.img} className="w-8 h-8 object-contain drop-shadow" alt="" />;
    
    const iconProps = {
      className: `h-6 w-6 ${!item.isRead ? 'text-white' : 'text-white/60'}`
    };

    switch (item.icon) {
      case 'gem': return <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30"><Gem {...iconProps} className="w-6 h-6 text-purple-400" /></div>;
      case 'heart': return <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30"><Heart {...iconProps} className="w-6 h-6 text-pink-400" /></div>;
      case 'zap': return <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30"><Zap {...iconProps} className="w-6 h-6 text-blue-400" /></div>;
      case 'gavel': return <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30"><Gavel {...iconProps} className="w-6 h-6 text-amber-400" /></div>;
      case 'user-plus': return <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30"><UserPlus {...iconProps} className="w-6 h-6 text-blue-400" /></div>;
      default: return <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20"><Zap {...iconProps} className="w-6 h-6 text-white" /></div>;
    }
  };

  return (
    <div className="animate-in fade-in duration-700 min-h-screen pb-4 bg-[#0B0F14]">
      {/* Header Area */}
      <header className="px-4 md:px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img src={APP_LOGO} className="w-5 h-5 opacity-40" alt="" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Neural Relay logs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none">Notifications</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={markAllRead} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase text-blue-400 tracking-widest hover:bg-white/10 hover:text-blue-300 transition-colors">Mark all read</button>
            <button onClick={clearAll} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase text-red-500 tracking-widest hover:bg-white/10 hover:text-red-400 transition-colors">Purge logs</button>
          </div>
        </div>
      </header>

      {/* Tabs - Converted to Pill Buttons */}
      <nav className="px-4 md:px-4 mb-8 sticky top-[var(--header-height,64px)] z-30 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex gap-3 py-4 overflow-x-auto no-scrollbar mask-edges">
          {['All', 'Social', 'Syncs', 'Rewards', 'System'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              aria-selected={activeTab === tab}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === tab ? 'bg-blue-500 text-black border-blue-400 shadow-[0_0_15px_rgba(8,145,178,0.4)]' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* List */}
      <main className="px-4 md:px-4 max-w-4xl mx-auto space-y-3">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div 
              key={item.id} 
              role="button" 
              tabIndex={0} 
              onClick={() => handleNotificationClick(item)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotificationClick(item); } }}
              className={`group flex items-center gap-4 p-5 rounded-3xl transition-all cursor-pointer border ${item.isRead ? 'glass-card border-white/5 hover:bg-white/10' : 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(8,145,178,0.1)]'}`}
            >
              {/* Icon Container */}
              <div className="flex-shrink-0 relative">
                {renderIcon(item)}
                {!item.isRead && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0B0F14] animate-pulse"></div>
                )}
              </div>
              {/* Text Content */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.title}</h4>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.time}</span>
                </div>
                <p className={`text-sm md:text-base font-bold tracking-tight ${item.isRead ? 'text-white/70' : 'text-white'}`}>
                  {item.message}
                </p>
              </div>
              <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity pl-4 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(prev => prev.filter(n => n.id !== item.id));
                  }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-red-400 hover:bg-white/10 hover:border-red-500/30 hover:scale-110 transition-all flex items-center justify-center"
                  title="Dismiss notification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all flex items-center justify-center">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-center glass-card border border-white/5 rounded-3xl">
            <Satellite className="h-16 w-16 text-white/5 mb-6 animate-spin-slow" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30">Neural void detected</p>
            <p className="text-sm text-white/40 mt-4">No active signals match this criteria.</p>
          </div>
        )}
      </main>

      <NotificationDetailModal 
        notification={selectedNotification} 
        onClose={() => setSelectedNotification(null)} 
      />
    </div>
  );
};

export default Notifications;

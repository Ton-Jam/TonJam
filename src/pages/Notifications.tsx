import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Heart, Zap, Gavel, UserPlus, ChevronRight, Satellite } from 'lucide-react';
import { APP_LOGO, TJ_COIN_ICON, TON_LOGO } from '@/constants';

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
  const [activeTab, setActiveTab] = useState<'All' | NotificationType>('All');
  const [notifications, setNotifications] = useState<NotifyItem[]>(MOCK_NOTIFICATIONS);

  const filtered = activeTab === 'All' ? notifications : notifications.filter(n => n.type === activeTab);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const renderIcon = (item: NotifyItem) => {
    if (item.img) return <img src={item.img} className="w-8 h-8 object-contain" alt="" />;
    
    const iconProps = {
      className: `h-6 w-6 ${item.type === 'Syncs' ? 'text-amber-500' : item.type === 'Rewards' ? 'text-yellow-500' : 'text-primary'}`
    };

    switch (item.icon) {
      case 'gem': return <Gem {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      case 'gavel': return <Gavel {...iconProps} />;
      case 'user-plus': return <UserPlus {...iconProps} />;
      default: return <Zap {...iconProps} />;
    }
  };

  return (
    <div className="animate-in fade-in duration-700 min-h-screen pb-4">
      {/* Header Area */}
      <header className="px-4 md:px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img src={APP_LOGO} className="w-5 h-5 opacity-40" alt="" />
              <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em]">Neural Relay logs</span>
            </div>
            <h1 className="text-[32px] md:text-[68px] font-bold tracking-tighter uppercase text-foreground leading-none">Notifications</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={markAllRead} className="text-[10px] font-bold uppercase text-primary tracking-widest hover:text-foreground transition-colors">Mark all read</button>
            <button onClick={clearAll} className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest hover:text-destructive transition-colors">Purge logs</button>
          </div>
        </div>
      </header>

      {/* Tabs - Converted to Pill Buttons */}
      <nav className="px-4 md:px-4 mb-4 -b sticky top-[var(--header-height,64px)] backdrop-blur-xl z-30 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex gap-4 py-4 overflow-x-auto no-scrollbar">
          {['All', 'Social', 'Syncs', 'Rewards', 'System'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              aria-selected={activeTab === tab}
              className={`flex-shrink-0 px-4 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* List */}
      <main className="px-4 md:px-4 max-w-4xl mx-auto space-y-4">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div key={item.id} role="button" tabIndex={0} className={`group flex items-center gap-4 p-4 rounded-[10px] transition-all cursor-pointer ${item.isRead ? 'bg-foreground/[0.02] hover:bg-muted/50' : 'bg-primary/[0.05] border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]'}`}>
              {/* Icon Container */}
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center relative">
                {renderIcon(item)}
                {!item.isRead && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
                )}
              </div>
              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.title}</h4>
                  <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">{item.time}</span>
                </div>
                <p className={`text-sm font-medium tracking-tight ${item.isRead ? 'text-muted-foreground/80' : 'text-foreground'}`}>
                  {item.message}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-10 h-10 rounded-full text-muted-foreground/50 hover:text-foreground transition-all bg-transparent flex items-center justify-center">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 flex flex-col items-center text-center">
            <Satellite className="h-16 w-16 text-foreground/5 mb-4 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-muted-foreground/30">Neural void detected. No active signals.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;

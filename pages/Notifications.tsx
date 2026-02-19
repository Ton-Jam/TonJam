import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_LOGO, TJ_COIN_ICON, TON_LOGO } from '../constants';

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
  { id: '1', type: 'Syncs', title: 'NFT SOLD', message: 'Solar Pulse #001 synced to @crypto_whale for 12.5 TON', time: '2m ago', isRead: false, icon: 'fa-gem' },
  { id: '2', type: 'Rewards', title: 'TJ COIN EARNED', message: 'Protocol bonus: +250 TJ earned for "Neon Nights" streak', time: '15m ago', isRead: false, img: TJ_COIN_ICON },
  { id: '3', type: 'Social', title: 'SIGNAL RESONANCE', message: '@luna_ray liked your broadcast: "Synthesized soul..."', time: '1h ago', isRead: true, icon: 'fa-heart' },
  { id: '4', type: 'System', title: 'RELAY UPDATE', message: 'TonJam Node v1.0.4 synchronized successfully', time: '4h ago', isRead: true, icon: 'fa-bolt' },
  { id: '5', type: 'Syncs', title: 'NEW BID', message: 'Your bid on "Deep Horizon #042" has been outbid', time: '6h ago', isRead: true, icon: 'fa-gavel' },
  { id: '6', type: 'Social', title: 'NEW FOLLOWER', message: '@beat_architect is now tracking your frequencies', time: '1d ago', isRead: true, icon: 'fa-user-plus' },
];

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'All' | NotificationType>('All');
  const [notifications, setNotifications] = useState<NotifyItem[]>(MOCK_NOTIFICATIONS);

  const filtered = activeTab === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="animate-in fade-in duration-700 min-h-screen pb-32">
      {/* Header Area */}
      <header className="px-6 md:px-12 py-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <img src={APP_LOGO} className="w-5 h-5 opacity-40" alt="" />
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] italic">Neural Relay logs</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none">Notifications</h1>
          </div>

          <div className="flex gap-4">
             <button onClick={markAllRead} className="text-[10px] font-black uppercase text-blue-500 tracking-widest hover:text-white transition-colors">Mark all read</button>
             <button onClick={clearAll} className="text-[10px] font-black uppercase text-white/20 tracking-widest hover:text-red-500 transition-colors">Purge logs</button>
          </div>
        </div>
      </header>

      {/* Tabs - Converted to Pill Buttons */}
      <nav className="px-6 md:px-12 mb-12 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-xl z-30">
        <div className="max-w-4xl mx-auto flex gap-4 py-4 overflow-x-auto no-scrollbar">
          {['All', 'Social', 'Syncs', 'Rewards', 'System'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeTab === tab 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                : 'bg-white/5 border-white/5 text-white/30 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* List */}
      <main className="px-6 md:px-12 max-w-4xl mx-auto space-y-2">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div 
              key={item.id} 
              className={`group flex items-center gap-6 p-6 rounded-[2rem] border transition-all cursor-pointer ${item.isRead ? 'bg-white/[0.02] border-white/5 hover:bg-white/5' : 'bg-blue-500/[0.03] border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.05)]'}`}
            >
              {/* Icon Container - Backdrop removed */}
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center relative">
                 {item.img ? (
                   <img src={item.img} className="w-8 h-8 object-contain" alt="" />
                 ) : (
                   <i className={`fas ${item.icon} text-lg ${item.type === 'Syncs' ? 'text-amber-500' : item.type === 'Rewards' ? 'text-yellow-500' : 'text-blue-500'}`}></i>
                 )}
                 {!item.isRead && (
                   <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-black"></div>
                 )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">{item.title}</h4>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">{item.time}</span>
                </div>
                <p className={`text-sm italic font-medium tracking-tight ${item.isRead ? 'text-white/60' : 'text-white'}`}>
                  {item.message}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="w-10 h-10 rounded-full text-white/20 hover:text-white transition-all bg-transparent">
                    <i className="fas fa-chevron-right text-xs"></i>
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 flex flex-col items-center text-center">
             <i className="fas fa-satellite text-6xl text-white/5 mb-8 animate-pulse"></i>
             <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10 italic">Neural void detected. No active signals.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
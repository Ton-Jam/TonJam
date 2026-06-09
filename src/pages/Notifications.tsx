import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Heart, Zap, Gavel, UserPlus, ChevronRight, Satellite, X as XMarkIcon } from 'lucide-react';
import { APP_LOGO, TJ_COIN_ICON } from '@/constants';
import NotificationDetailModal from '@/components/NotificationDetailModal';
import { useAudio } from '@/context/AudioContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
    if (item.img) return <img src={item.img} className="w-6 h-6 object-contain" alt="" />;
    
    const iconProps = {
      className: cn("h-4 w-4", !item.isRead ? "text-blue-500" : "text-muted-foreground")
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between gap-4 w-full max-w-full">
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase text-foreground">Signals</h1>
          </div>
          <div className="flex gap-1">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllRead}
                className="h-7 rounded-lg text-[8px] font-black uppercase tracking-widest bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3"
            >
                Read All
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="h-7 rounded-lg text-[8px] font-black uppercase tracking-widest bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 px-3"
            >
                Purge
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="All" className="flex-1 flex flex-col" onValueChange={(val) => setActiveTab(val as any)}>
        <div className="border-b border-white/5 py-2">
          <div className="overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8 lg:px-12">
            <TabsList className="bg-transparent h-auto p-0 gap-2 flex justify-start">
              {['All', 'Social', 'Syncs', 'Rewards', 'System'].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-white/5 hover:bg-white/10 text-muted-foreground border border-[#C0C0C0]/35 data-[state=active]:border-transparent hover:border-[#C0C0C0]/60 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground shrink-0 cursor-pointer h-auto"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <TabsContent value={activeTab} className="flex-1 m-0">
            <ScrollArea className="h-full">
                <div className="w-full max-w-full px-4 py-6 space-y-2">
                    {filtered.length > 0 ? (
                        filtered.map(item => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "group relative p-3 rounded-2xl transition-all cursor-pointer border",
                                    item.isRead ? "bg-muted/10 border-white/5 hover:bg-muted/20" : "bg-blue-500/5 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                                )}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className="flex items-center gap-2">
                                    {/* Small Icon container */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                                        item.isRead ? "bg-muted/30 border-white/5" : "bg-blue-500/10 border-blue-500/20"
                                    )}>
                                        {renderIcon(item)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-[0.2em]",
                                                item.isRead ? "text-muted-foreground/40" : "text-blue-500/60"
                                            )}>{item.type}</span>
                                            <span className="text-[7px] font-bold text-muted-foreground/30 uppercase tracking-widest">{item.time}</span>
                                        </div>
                                        <h4 className={cn(
                                            "text-[10px] font-black tracking-tight uppercase truncate",
                                            item.isRead ? "text-foreground/60" : "text-foreground"
                                        )}>{item.title}</h4>
                                        <p className={cn(
                                            "text-[9px] font-bold tracking-tight leading-snug line-clamp-1 mt-0",
                                            item.isRead ? "text-muted-foreground/50" : "text-muted-foreground"
                                        )}>
                                            {item.message}
                                        </p>
                                    </div>

                                    {/* Swipe action placeholder / hover delete */}
                                    <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNotifications(prev => prev.filter(n => n.id !== item.id));
                                            }}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                {!item.isRead && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-32 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Satellite className="h-8 w-8 text-muted-foreground/20" />
                            </div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Void Detected</h3>
                            <p className="text-muted-foreground text-xs font-medium mt-2 max-w-xs">Your signal relay is perfectly clear. No new notifications reported.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </TabsContent>
      </Tabs>

      <NotificationDetailModal 
        notification={selectedNotification} 
        onClose={() => setSelectedNotification(null)} 
      />
    </div>
  );
};

export default Notifications;

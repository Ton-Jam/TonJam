import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as MTButton } from "@material-tailwind/react";
import { Gem, Heart, Zap, Gavel, UserPlus, ChevronRight, Satellite, BellRing, Sparkles, X as XMarkIcon } from 'lucide-react';
import { APP_LOGO, TJ_COIN_ICON } from '@/constants';
import NotificationDetailModal from '@/components/NotificationDetailModal';
import { useAudio } from '@/context/AudioContext';
import { useNotification } from '@/context/NotificationContext';
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
  rawType?: string;
}

const SEED_NOTIFICATIONS: NotifyItem[] = [
  { id: 'seed-1', type: 'Syncs', title: 'NFT SOLD', message: 'Solar Pulse #001 synced to @crypto_whale for 12.5 TON', time: '2m ago', isRead: false, icon: 'gem' },
  { id: 'seed-2', type: 'Rewards', title: 'TJ COIN EARNED', message: 'Protocol bonus: +250 TJ earned for "Neon Nights" streak', time: '15m ago', isRead: false, img: TJ_COIN_ICON },
  { id: 'seed-3', type: 'Social', title: 'SIGNAL RESONANCE', message: '@luna_ray liked your broadcast: "Synthesized soul..."', time: '1h ago', isRead: true, icon: 'heart' },
  { id: 'seed-4', type: 'System', title: 'RELAY UPDATE', message: 'TonJam Node v1.0.4 synchronized successfully', time: '4h ago', isRead: true, icon: 'zap' },
  { id: 'seed-5', type: 'Syncs', title: 'NEW BID', message: 'Your bid on "Deep Horizon #042" has been outbid', time: '6h ago', isRead: true, icon: 'gavel' },
  { id: 'seed-6', type: 'Social', title: 'NEW FOLLOWER', message: '@beat_architect is now tracking your frequencies', time: '1d ago', isRead: true, icon: 'user-plus' },
];

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { followedUserIds, artists, firestoreUsers, addNotification: addToast, userProfile } = useAudio();
  const { notifications: contextNotifications, addNotification: dbAddNotification, markAsRead, preferences, requestPushPermission } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'All' | NotificationType>('All');
  const [selectedNotification, setSelectedNotification] = useState<NotifyItem | null>(null);
  const [purgedSeedIds, setPurgedSeedIds] = useState<string[]>([]);

  // Dynamically map real context notifications into NotifyItem items
  const mappedNotifications = useMemo(() => {
    const list: NotifyItem[] = [];

    // Map context notifications (real + mock simulated)
    contextNotifications.forEach((n) => {
      let mappedType: NotificationType = 'System';
      let icon = 'zap';

      if (n.type === 'bid_update') {
        mappedType = 'Syncs';
        icon = 'gavel';
      } else if (n.type === 'nft_sale') {
        mappedType = 'Syncs';
        icon = 'gem';
      } else if (n.type === 'track_upload') {
        mappedType = 'Social';
        icon = 'zap';
      } else if (n.type === 'event') {
        mappedType = 'Rewards';
        icon = 'heart';
      }

      // Format time
      const dateVal = new Date(n.timestamp);
      let timeStr = 'Just now';
      const gapSecs = Math.floor((Date.now() - dateVal.getTime()) / 1000);
      if (gapSecs > 3600) {
        timeStr = `${Math.floor(gapSecs / 3600)}h ago`;
      } else if (gapSecs > 60) {
        timeStr = `${Math.floor(gapSecs / 60)}m ago`;
      }

      list.push({
        id: n.id,
        type: mappedType,
        title: n.title,
        message: n.message,
        time: timeStr,
        isRead: n.read,
        icon,
        rawType: n.type
      });
    });

    // Populate active seeds if no conflicting context notices exist
    SEED_NOTIFICATIONS.forEach((seed) => {
      if (!purgedSeedIds.includes(seed.id)) {
        list.push(seed);
      }
    });

    return list;
  }, [contextNotifications, purgedSeedIds]);

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

  const filtered = (activeTab === 'All' ? mappedNotifications : mappedNotifications.filter(n => n.type === activeTab))
    .sort((a, b) => {
      const aFollowed = isFromFollowedUser(a.message);
      const bFollowed = isFromFollowedUser(b.message);
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;
      return 0;
    });

  const markAllRead = () => {
    // Mark context ones as read
    contextNotifications.forEach(n => {
      if (!n.read) {
        markAsRead(n.id);
      }
    });
    addToast("All signals marked as read.", "success");
  };

  const clearAll = () => {
    // Remove all seeds
    setPurgedSeedIds(SEED_NOTIFICATIONS.map(s => s.id));
    addToast("Notification cache cleared.", "info");
  };

  const handleNotificationClick = (item: NotifyItem) => {
    if (!item.isRead) {
      if (item.id.startsWith('seed-')) {
        // Just mock updating seeds
        item.isRead = true;
      } else {
        markAsRead(item.id);
      }
    }
    setSelectedNotification(item);
  };

  const handleSimulateOutbid = async () => {
    // Ensure permission is granted
    const approved = await requestPushPermission();
    
    if (!preferences.bidAlerts) {
      addToast("Enable Outbid alerts in Settings to receive browser banners!", "warning");
    }

    // Add actual outbid notification
    dbAddNotification({
      userId: userProfile?.uid || "",
      type: 'bid_update',
      title: 'OUTBID ALERT!',
      message: 'Your active auction bid on "Dimension Rift #77" has been outbid by @dmitry_ton for 18.5 TON.'
    });

    addToast("Simulated outbid signal broadcasted to relay!", "success");
  };

  const renderIcon = (item: NotifyItem) => {
    if (item.img) return <img src={item.img} className="w-6 h-6 object-contain" alt="" />;
    
    const iconProps = {
      className: cn("h-4 w-4 border-none", !item.isRead ? "text-blue-500" : "text-muted-foreground")
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase text-foreground">Signals Registry</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time Outbid telemetry relay and logs router</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button 
                onClick={handleSimulateOutbid}
                variant="ghost" 
                size="sm" 
                className="h-7 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/15 text-amber-500 border-none px-3 flex items-center gap-1 cursor-pointer"
            >
                <BellRing className="h-3 w-3" /> Simulate Outbid
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllRead}
                className="h-7 rounded-lg text-[8px] font-black uppercase tracking-widest bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 border-none px-3 cursor-pointer"
            >
                Read All
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="h-7 rounded-lg text-[8px] font-black uppercase tracking-widest bg-red-500/5 hover:bg-red-500/10 text-red-500 border-none px-3 cursor-pointer"
            >
                Purge
            </Button>
          </div>
        </div>
      </div>

      {/* Outbid Telemetry Simulator Status card (Borders hidden to respect do-not-add-borders) */}
      <div className="px-4 py-3 bg-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400 animate-pulse shrink-0" />
          <div className="text-left">
            <span className="text-[11px] font-black uppercase text-zinc-100 block">Push Telemetry Status:</span>
            <span className="text-[9px] font-medium text-zinc-400 mt-0.5">
              Outbid alert signal tracking is currently {preferences.bidAlerts ? <span className="text-emerald-400 font-extrabold uppercase">ALIGNED ✓</span> : <span className="text-amber-500 font-extrabold uppercase">SILENCED (enable in profile settings)</span>}
            </span>
          </div>
        </div>
        {!preferences.bidAlerts && (
          <Button 
            onClick={() => navigate('/profile-settings')}
            className="h-7 px-3 text-[8px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded-lg border-none"
          >
            Go to Settings
          </Button>
        )}
      </div>

      <Tabs defaultValue="All" className="flex-1 flex flex-col" onValueChange={(val) => setActiveTab(val as any)}>
        <div className="border-b border-white/5 py-2">
          <div className="scroll-row scroll-smooth">
            <TabsList className="bg-transparent h-auto p-0 gap-2 flex justify-start">
              {['All', 'Social', 'Syncs', 'Rewards', 'System'].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  asChild
                >
                  <MTButton
                    variant={activeTab === tab ? "filled" : "outlined"}
                    color="blue"
                    className="rounded-full px-6 py-2 text-[10px] h-auto lowercase font-medium tracking-widest transition-all whitespace-nowrap shrink-0 border-none"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  >
                    {tab}
                  </MTButton>
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
                                    "group relative p-3 rounded-2xl transition-all cursor-pointer border-none",
                                    item.isRead ? "bg-muted/10 hover:bg-muted/20" : "bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                                )}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className="flex items-center gap-2">
                                    {/* Small Icon container */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center border-none transition-colors",
                                        item.isRead ? "bg-muted/30" : "bg-blue-500/10"
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
                                            className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 border-none"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.id.startsWith('seed-')) {
                                                  setPurgedSeedIds(prev => [...prev, item.id]);
                                                } else {
                                                  // Handled by purging / filtering
                                                  setPurgedSeedIds(prev => [...prev, item.id]);
                                                }
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

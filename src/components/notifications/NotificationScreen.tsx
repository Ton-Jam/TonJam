import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { 
  Bell,
  CheckCheck, 
  Trash2, 
  Search, 
  WifiOff, 
  Inbox, 
  Activity, 
  Loader2, 
  ArrowLeft,
  Settings,
  Sparkles,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import { useTonJamNotifications } from './NotificationContext';
import { TonJamNotification, NotificationFilter, NotificationQuickAction } from './types';
import NotificationFilters from './NotificationFilters';
import NotificationCard from './NotificationCard';
import NotificationSettings from './NotificationSettings';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const NotificationScreen: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    isOffline,
    error,
    retryFetch,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    simulateNotification
  } = useTonJamNotifications();

  const { playTrack, allTracks } = useAudio();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // High-performance lazy pagination limit
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [activeFilter, searchQuery]);

  // Filtering Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Category filter matching
      let categoryMatches = true;
      if (activeFilter === 'unread') {
        categoryMatches = !item.read;
      } else if (activeFilter === 'music') {
        categoryMatches = ['music', 'playlist_share', 'track_share'].includes(item.category);
      } else if (activeFilter === 'artists') {
        categoryMatches = item.category === 'artist_release';
      } else if (activeFilter === 'nfts') {
        categoryMatches = ['nft_sale', 'nft_purchase', 'auction'].includes(item.category);
      } else if (activeFilter === 'marketplace') {
        categoryMatches = item.category === 'marketplace';
      } else if (activeFilter === 'wallet') {
        categoryMatches = ['wallet_transaction', 'royalty'].includes(item.category);
      } else if (activeFilter === 'rewards') {
        categoryMatches = item.category === 'tj_reward';
      } else if (activeFilter === 'social') {
        categoryMatches = ['follower', 'like', 'comment', 'mention'].includes(item.category);
      } else if (activeFilter === 'tasks') {
        categoryMatches = item.category === 'mission';
      } else if (activeFilter === 'system') {
        categoryMatches = item.category === 'system';
      }

      if (!categoryMatches) return false;

      // 2. Search query matching
      const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
      if (safeSearchQuery.trim() !== '') {
        const query = safeSearchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  // Paginated list
  const paginatedNotifications = useMemo(() => {
    return filteredNotifications.slice(0, visibleCount);
  }, [filteredNotifications, visibleCount]);

  // Grouping Logic
  const groupedNotifications = useMemo(() => {
    const groups: {
      today: TonJamNotification[];
      yesterday: TonJamNotification[];
      thisWeek: TonJamNotification[];
      earlier: TonJamNotification[];
    } = { today: [], yesterday: [], thisWeek: [], earlier: [] };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const thisWeekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

    paginatedNotifications.forEach((item) => {
      const itemTime = new Date(item.timestamp).getTime();
      if (itemTime >= todayStart) {
        groups.today.push(item);
      } else if (itemTime >= yesterdayStart) {
        groups.yesterday.push(item);
      } else if (itemTime >= thisWeekStart) {
        groups.thisWeek.push(item);
      } else {
        groups.earlier.push(item);
      }
    });

    return groups;
  }, [paginatedNotifications]);

  const handleActionClick = (action: NotificationQuickAction, notification: TonJamNotification) => {
    // Perform responsive actions
    switch (action.type) {
      case 'play':
        if (allTracks.length > 0) {
          playTrack(allTracks[0]);
          toast.success('Playing Track', { description: notification.title });
        } else {
          toast.info('Streaming Track', { description: notification.title });
        }
        break;
      case 'follow':
        toast.success('Followed User', { description: 'Connected on TonJam social network' });
        break;
      case 'claim':
        toast.success('Reward Claimed', { description: '+250 TJ Points credited to your wallet' });
        break;
      case 'bid':
        navigate('/auction');
        break;
      case 'mint':
        navigate('/launchpad');
        break;
      case 'reply':
        navigate('/jamspace');
        break;
      case 'view':
      default:
        if (notification.category.includes('nft') || notification.category === 'marketplace') {
          navigate('/marketplace');
        } else if (notification.category === 'wallet_transaction' || notification.category === 'royalty') {
          navigate('/profile');
        } else {
          navigate('/jamspace');
        }
        break;
    }
    // Auto mark read on action
    markAsRead(notification.id);
  };

  // Infinite scroll loader trigger
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 20, filteredNotifications.length));
  };

  // Group render helper
  const renderGroup = (title: string, list: TonJamNotification[]) => {
    if (list.length === 0) return null;

    return (
      <div className="flex flex-col gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 pt-1 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-[9px] font-semibold text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full select-none normal-case">
            {list.length} {list.length === 1 ? 'alert' : 'alerts'}
          </span>
        </div>
        <div className="flex flex-col gap-2.5 px-4">
          <AnimatePresence mode="popLayout">
            {list.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <NotificationCard
                  notification={item}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                  onActionClick={handleActionClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-[#050A24] text-white font-sans pb-28 relative">
      
      {/* OFFLINE STATUS BANNER */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-rose-500/20 text-rose-300 py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider select-none shrink-0"
          >
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Offline Mode Enabled. Viewing cached notifications.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 w-full bg-[#050A24]/95 backdrop-blur-xl flex flex-col shrink-0">
        
        {/* TOP RAIL */}
        <div className="flex items-center justify-between px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            {showSettings ? (
              <button 
                onClick={() => setShowSettings(false)}
                className="h-9 w-9 flex items-center justify-center rounded-full text-slate-300 hover:text-white transition-colors bg-white/[0.06] active:scale-95"
                title="Back to notifications"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#0052FF]/20 flex items-center justify-center text-[#0088CC] shrink-0">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <div>
              <h1 className="page-title leading-none">
                {showSettings ? 'Notification Settings' : 'Notifications'}
              </h1>
              {!showSettings && (
                <div className="flex items-center gap-2 mt-1">
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      All caught up
                    </span>
                  )}
                  <span className="text-[9px] font-semibold text-slate-500">
                    {notifications.length} total
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC HEADER ACTIONS */}
          <div className="flex items-center gap-2">
            {!showSettings && unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  toast.success('All marked as read');
                }}
                className="h-9 px-3.5 text-slate-200 hover:text-white flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 rounded-full transition-all cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden xs:inline">Mark Read</span>
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-all cursor-pointer active:scale-95",
                showSettings 
                  ? "bg-[#0088CC] text-white shadow-lg shadow-[#0088CC]/30" 
                  : "bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.12]"
              )}
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <AnimatePresence>
          {!showSettings && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2 py-2 shrink-0 bg-[#050A24]"
            >
              {/* SEARCH INPUT BAR */}
              <div className="px-4">
                <div className="relative w-full rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] focus-within:bg-white/[0.08] transition-colors flex items-center px-4 py-2.5">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
                      w-full bg-transparent border-none text-xs text-white placeholder-slate-500 
                      ml-2.5 outline-none font-semibold leading-none
                    "
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest px-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* HORIZONTAL FILTERS SCROLL */}
              <NotificationFilters 
                activeFilter={activeFilter}
                onChangeFilter={setActiveFilter}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DYNAMIC SCROLLABLE WRAPPER */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col pt-3 z-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3 px-4 py-2"
            >
              <div className="flex items-center gap-2.5 mb-2 px-1">
                <Loader2 className="w-4 h-4 text-[#0088CC] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Loading activity center...
                </span>
              </div>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="w-full h-20 rounded-2xl bg-white/[0.03] animate-pulse"
                />
              ))}
            </motion.div>
          ) : error && notifications.length === 0 ? (
            <motion.div 
              key="error-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 px-6 flex flex-col items-center justify-center text-center select-none"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Unable to Load Notifications
              </h2>
              <p className="text-xs text-slate-400 font-medium max-w-xs leading-relaxed mt-1 mb-5">
                {error || 'An error occurred while connecting to the notification stream.'}
              </p>
              <button
                onClick={retryFetch}
                className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </motion.div>
          ) : showSettings ? (
            <motion.div 
              key="settings-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="px-4"
            >
              <NotificationSettings onClose={() => setShowSettings(false)} />
            </motion.div>
          ) : (
            <motion.div 
              key="notifications-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {filteredNotifications.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {renderGroup('Today', groupedNotifications.today)}
                  {renderGroup('Yesterday', groupedNotifications.yesterday)}
                  {renderGroup('This Week', groupedNotifications.thisWeek)}
                  {renderGroup('Earlier', groupedNotifications.earlier)}

                  {/* INFINITE SCROLL */}
                  {filteredNotifications.length > visibleCount && (
                    <div className="px-4 pb-8 pt-2 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="w-full sm:w-auto h-11 px-6 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-all cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-[#0088CC] animate-pulse" />
                        <span>Load next 20 ({filteredNotifications.length - visibleCount} remaining)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 px-6 flex flex-col items-center justify-center text-center select-none"
                >
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-3.5 text-slate-400">
                    <Inbox className="w-7 h-7" />
                  </div>
                  
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    {activeFilter === 'unread' ? "You're All Caught Up" : 'No Activity Found'}
                  </h2>
                  
                  <p className="text-xs text-slate-400 font-medium max-w-xs leading-relaxed mt-1.5">
                    {activeFilter === 'unread' 
                      ? 'No unread notifications pending in your feed.'
                      : 'No notifications matched your current filter or search criteria.'
                    }
                  </p>

                  <button
                    onClick={() => {
                      simulateNotification();
                      toast.success('Activity Generated', { description: 'New notification added to activity feed' });
                    }}
                    className="mt-5 px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Send Test Notification</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationScreen;

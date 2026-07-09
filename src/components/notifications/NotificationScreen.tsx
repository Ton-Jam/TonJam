import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  CheckCheck, 
  Trash2, 
  Search, 
  WifiOff, 
  Inbox, 
  BellRing, 
  Activity, 
  Loader2, 
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useTonJamNotifications } from './NotificationContext';
import { TonJamNotification, NotificationFilter, NotificationQuickAction } from './types';
import NotificationFilters from './NotificationFilters';
import NotificationCard from './NotificationCard';
import NotificationSettings from './NotificationSettings';
import { TonJamButton } from '@/components/ui/buttons/TonJamButton';
import { 
  PageTitle, 
  SectionTitle, 
  Label, 
  ButtonText 
} from '@/components/ui/typography/Typography';

export const NotificationScreen: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    isOffline, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    simulateNotification
  } = useTonJamNotifications();

  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // High-performance lazy pagination limit
  const [visibleCount, setVisibleCount] = useState(20);
  const listBottomRef = useRef<HTMLDivElement>(null);

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
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
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
    // Perform simulated actions
    switch (action.type) {
      case 'play':
        alert(`Starting stream transmission: ${notification.title}`);
        break;
      case 'follow':
        alert(`Established reverse social link back!`);
        break;
      case 'claim':
        alert(`Successfully claimed: ${notification.title}`);
        break;
      case 'bid':
        alert(`Auction counter-bid proposed to ledger!`);
        break;
      case 'mint':
        alert(`Triggering contract mint for exclusive collectible!`);
        break;
      case 'reply':
        alert(`Input reply portal opened.`);
        break;
      case 'view':
      default:
        alert(`Navigating to target content details.`);
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
        <SectionTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 pt-1 flex items-center justify-between border-none">
          <span>{title}</span>
          <Label className="text-[9px] font-semibold text-slate-600 bg-white/[0.03] px-2 py-0.5 rounded-full select-none normal-case">
            {list.length} signals
          </Label>
        </SectionTitle>
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
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-[#0A113A] text-slate-100 font-sans pb-16 relative">
      
      {/* OFFLINE STATUS BANNER (NO BORDERS) */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-amber-500/10 text-amber-500 py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider select-none shrink-0"
          >
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Connection Interrupted. Cache Mode Enabled.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STICKY HEADER (NO BORDERS) */}
      <div className="sticky top-0 z-20 w-full bg-[#0A113A]/90 backdrop-blur-md flex flex-col shrink-0">
        
        {/* TOP RAIL */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            {showSettings ? (
              <TonJamButton 
                onClick={() => setShowSettings(false)}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </TonJamButton>
            ) : (
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            )}
            <div>
              <PageTitle className="text-sm font-black tracking-widest uppercase text-white leading-none border-none">
                {showSettings ? 'Telemetry Settings' : 'Signals Hub'}
              </PageTitle>
              {!showSettings && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-blue-400">
                    {unreadCount} unread
                  </Label>
                  <span className="text-[8px] font-bold text-slate-600">•</span>
                  <Label className="text-[9px] font-semibold text-slate-400 normal-case">
                    {notifications.length} total cached
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC HEADER ACTIONS */}
          <div className="flex items-center gap-1">
            {!showSettings && unreadCount > 0 && (
              <TonJamButton
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-slate-400 hover:text-white flex items-center gap-1.5"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <ButtonText className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Mark Read</ButtonText>
              </TonJamButton>
            )}

            <TonJamButton
              onClick={() => setShowSettings(!showSettings)}
              variant={showSettings ? 'primary' : 'ghost'}
              size="sm"
              className="h-9 w-9 p-0 rounded-lg"
              title="Notification Settings"
            >
              <Settings className="w-5 h-5" />
            </TonJamButton>
          </div>
        </div>

        {/* SEARCH & FILTERS DYNAMIC TABS - Only visible on Notifications Main View */}
        <AnimatePresence>
          {!showSettings && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2.5 py-3 shrink-0 bg-[#0A113A]"
            >
              {/* SEARCH INPUT BAR */}
              <div className="px-4">
                <div className="relative w-full rounded-xl bg-white/[0.03] hover:bg-white/[0.05] focus-within:bg-white/[0.06] transition-colors flex items-center px-3.5 py-2.5">
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Query signals cache..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
                      w-full bg-transparent border-none text-xs text-white placeholder-slate-500 
                      ml-2.5 outline-none font-semibold leading-none
                    "
                  />
                  {searchQuery && (
                    <TonJamButton 
                      onClick={() => setSearchQuery('')}
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest cursor-pointer bg-transparent"
                    >
                      Clear
                    </TonJamButton>
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
            // SKELETON CARDS LOADING (NO BORDERS)
            <motion.div 
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 px-4 py-2"
            >
              <div className="flex items-center gap-2.5 mb-2 px-1">
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Synchronizing telemetry registers...
                </span>
              </div>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="w-full h-24 rounded-2xl bg-white/[0.02] flex items-center gap-4 p-4 animate-pulse"
                >
                  <div className="w-11 h-11 rounded-full bg-white/[0.04]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 bg-white/[0.04] rounded-full w-24" />
                    <div className="h-3.5 bg-white/[0.05] rounded-full w-[80%]" />
                    <div className="h-2 bg-white/[0.03] rounded-full w-[95%]" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : showSettings ? (
            // SETTINGS OVERLAY
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
            // MAIN CONTENT CHANNELS
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

                  {/* HIGH-PERFORMANCE INFINITE SCROLL / LOAD MORE BUTTON */}
                  {filteredNotifications.length > visibleCount && (
                    <div className="px-4 pb-8 pt-2 flex justify-center">
                      <TonJamButton
                        onClick={handleLoadMore}
                        variant="secondary"
                        className="w-full sm:w-auto h-11 px-6 rounded-full flex items-center justify-center gap-2"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                        <ButtonText>Sync next 20 signals ({filteredNotifications.length - visibleCount} remaining)</ButtonText>
                      </TonJamButton>
                    </div>
                  )}
                </div>
              ) : (
                // EMPTY STATE CHANNELS (NO BORDERS)
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-24 px-6 flex flex-col items-center justify-center text-center select-none"
                >
                  <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-5 text-slate-600">
                    <Inbox className="w-8 h-8" />
                  </div>
                  
                  <PageTitle className="text-sm font-black uppercase tracking-widest text-slate-300 border-none">
                    {activeFilter === 'unread' ? 'Clean Signal Status' : 'Registry Empty'}
                  </PageTitle>
                  
                  <p className="text-xs text-slate-500 font-semibold max-w-xs leading-relaxed mt-2">
                    {activeFilter === 'unread' 
                      ? 'No unread telemetry signals detected. All active frequency alerts are cleared!'
                      : 'No signals matched your query criteria. Synchronize developer triggers or alter your filters.'
                    }
                  </p>

                  <TonJamButton
                    onClick={() => simulateNotification()}
                    variant="primary"
                    className="mt-6 px-6 rounded-full shadow-md shadow-blue-500/10"
                  >
                    <ButtonText>Broadcast Simulation Signal</ButtonText>
                  </TonJamButton>
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

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Search } from 'lucide-react';
import { useTonJamNotifications } from './NotificationContext';
import { TonJamNotification, NotificationFilter, NotificationQuickAction } from './types';
import NotificationsHeader from './NotificationsHeader';
import NotificationFilterPills from './NotificationFilterPills';
import NotificationGroupHeader from './NotificationGroupHeader';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import NotificationEmptyState from './NotificationEmptyState';
import NotificationErrorState from './NotificationErrorState';
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
  } = useTonJamNotifications();

  const { playTrack, allTracks } = useAudio();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(25);
  }, [activeFilter, searchQuery]);

  // Filtering Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Category Filter Matching
      let categoryMatches = true;

      if (activeFilter === 'verified_artists') {
        categoryMatches = Boolean(
          item.isVerified ||
          item.metadata?.isVerified ||
          item.category === 'artist_release' ||
          item.musicPreview?.isVerified
        );
      } else if (activeFilter === 'mentions') {
        categoryMatches = Boolean(
          item.category === 'mention' ||
          item.category === 'comment' ||
          item.socialPreview !== undefined
        );
      } else if (activeFilter === 'music_nfts') {
        categoryMatches = Boolean(
          item.musicPreview !== undefined ||
          item.nftPreview !== undefined ||
          [
            'music',
            'artist_release',
            'playlist_share',
            'track_share',
            'nft_sale',
            'nft_purchase',
            'auction',
            'marketplace',
          ].includes(item.category)
        );
      } else if (activeFilter === 'unread') {
        categoryMatches = !item.read;
      }

      if (!categoryMatches) return false;

      // 2. Search Query Matching
      const safeSearch = searchQuery.trim().toLowerCase();
      if (safeSearch) {
        return (
          item.title.toLowerCase().includes(safeSearch) ||
          item.description.toLowerCase().includes(safeSearch) ||
          (item.senderName && item.senderName.toLowerCase().includes(safeSearch)) ||
          item.category.toLowerCase().includes(safeSearch)
        );
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  // Paginated List
  const paginatedNotifications = useMemo(() => {
    return filteredNotifications.slice(0, visibleCount);
  }, [filteredNotifications, visibleCount]);

  // Grouping Logic: Today, Yesterday, Earlier
  const groupedNotifications = useMemo(() => {
    const groups: {
      today: TonJamNotification[];
      yesterday: TonJamNotification[];
      earlier: TonJamNotification[];
    } = { today: [], yesterday: [], earlier: [] };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    paginatedNotifications.forEach((item) => {
      const itemTime = new Date(item.timestamp).getTime();
      if (itemTime >= todayStart) {
        groups.today.push(item);
      } else if (itemTime >= yesterdayStart) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    });

    return groups;
  }, [paginatedNotifications]);

  const handleActionClick = (action: NotificationQuickAction, notification: TonJamNotification) => {
    switch (action.type) {
      case 'play': {
        const targetTrackId = action.payload?.trackId || notification.metadata?.trackId;
        const found = targetTrackId ? allTracks.find((t) => t.id === targetTrackId) : null;
        if (found) {
          playTrack(found);
          toast.success('Playing Track', { description: found.title });
        } else if (allTracks.length > 0) {
          playTrack(allTracks[0]);
          toast.success('Playing Track', { description: notification.title });
        }
        break;
      }
      case 'follow':
        toast.success('Followed User', { description: `Connected with ${notification.senderName || 'user'}` });
        break;
      case 'claim':
        toast.success('Reward Claimed', { description: '+250 TJ Points credited to your TON wallet' });
        break;
      case 'bid': {
        const targetNftId = action.payload?.nftId || notification.metadata?.nftId;
        if (targetNftId) {
          navigate(`/nft/${targetNftId}`);
        } else {
          navigate('/marketplace');
        }
        break;
      }
      case 'mint': {
        const targetNftId = action.payload?.nftId || notification.metadata?.nftId;
        if (targetNftId) {
          navigate(`/nft/${targetNftId}`);
        } else {
          navigate('/launchpad');
        }
        break;
      }
      case 'reply':
        navigate('/jamspace');
        break;
      case 'join':
        navigate('/jamspace');
        break;
      case 'view':
      default: {
        if (notification.metadata?.nftId) {
          navigate(`/nft/${notification.metadata.nftId}`);
        } else if (notification.metadata?.trackId) {
          navigate(`/track/${notification.metadata.trackId}`);
        } else if (notification.category.includes('nft') || notification.category === 'marketplace' || notification.category === 'auction') {
          navigate('/marketplace');
        } else if (notification.category === 'wallet_transaction' || notification.category === 'royalty') {
          navigate('/profile');
        } else {
          navigate('/jamspace');
        }
        break;
      }
    }
    markAsRead(notification.id);
  };

  const handleItemClick = (notification: TonJamNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.metadata?.nftId) {
      navigate(`/nft/${notification.metadata.nftId}`);
    } else if (notification.metadata?.trackId) {
      navigate(`/track/${notification.metadata.trackId}`);
    } else if (['auction', 'nft_sale', 'nft_purchase'].includes(notification.category)) {
      navigate('/marketplace');
    } else if (['music', 'artist_release'].includes(notification.category) && allTracks.length > 0) {
      playTrack(allTracks[0]);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success('All marked as read');
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 25, filteredNotifications.length));
  };

  const renderGroup = (title: string, list: TonJamNotification[]) => {
    if (list.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        <NotificationGroupHeader title={title} count={list.length} />
        <div className="flex flex-col gap-2 px-4">
          <AnimatePresence mode="popLayout">
            {list.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
              >
                <NotificationItem
                  notification={item}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                  onActionClick={handleActionClick}
                  onItemClick={handleItemClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-[#F5F7FB] font-sans pb-32 relative select-none">
      {/* OFFLINE STATUS BANNER */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-rose-500/15 text-rose-300 py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold shrink-0"
          >
            <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span>Offline Mode. Viewing cached notifications.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllRead}
        onOpenSettings={() => setShowSettings(!showSettings)}
        showBack={true}
      />

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-lg mx-auto flex flex-col pt-2">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="px-4"
            >
              <NotificationSettings onClose={() => setShowSettings(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="notifications-feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {/* FILTER PILLS */}
              <NotificationFilterPills
                activeFilter={activeFilter}
                onChangeFilter={setActiveFilter}
              />

              {/* SEARCH INPUT BAR */}
              <div className="px-4">
                <div className="relative w-full rounded-full bg-[#111C30] hover:bg-[#16243E] transition-colors flex items-center px-3.5 py-2 border border-white/[0.04]">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-[#F5F7FB] placeholder-[#94A3B8] ml-2 outline-none font-medium"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] font-bold text-[#94A3B8] hover:text-[#F5F7FB] uppercase tracking-wider px-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* CONTENT AREA: SKELETON, ERROR, OR GROUPED LIST */}
              {isLoading ? (
                <NotificationSkeleton />
              ) : error && notifications.length === 0 ? (
                <NotificationErrorState
                  errorMessage={error}
                  onRetry={retryFetch}
                />
              ) : filteredNotifications.length > 0 ? (
                <div className="flex flex-col gap-5 mt-1">
                  {renderGroup('Today', groupedNotifications.today)}
                  {renderGroup('Yesterday', groupedNotifications.yesterday)}
                  {renderGroup('Earlier', groupedNotifications.earlier)}

                  {filteredNotifications.length > visibleCount && (
                    <div className="px-4 pt-2 pb-6 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 rounded-full bg-[#111C30] hover:bg-[#16243E] text-xs font-semibold text-[#94A3B8] hover:text-[#F5F7FB] transition-all cursor-pointer border border-white/[0.04]"
                      >
                        Load more ({filteredNotifications.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NotificationEmptyState
                  isFilterEmpty={activeFilter !== 'all' || searchQuery.trim() !== ''}
                  filterName={
                    activeFilter === 'verified_artists'
                      ? 'Verified Artists'
                      : activeFilter === 'mentions'
                      ? 'Mentions'
                      : activeFilter === 'music_nfts'
                      ? 'Music & NFTs'
                      : undefined
                  }
                  onResetFilter={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationScreen;

import React, { useState, useMemo } from 'react';
import {
  Settings,
  CheckCheck,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  TonJamHeader,
  NotificationFilterPills,
  NotificationItem,
  SkeletonRow,
  EmptyState,
  ErrorState,
} from '../index';
import { UnifiedNotification, NotificationFilterType } from '../types';
import { toast } from 'sonner';

interface MobileNotificationsScreenProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}

const INITIAL_NOTIFICATIONS: UnifiedNotification[] = [
  {
    id: 'notif-1',
    category: 'music',
    subType: 'new_track',
    title: 'New Track Drop',
    description: 'released "TON Odyssey (VIP Club Mix)" — stream the exclusive master stem.',
    senderName: 'CYBERPUNK TON',
    senderHandle: 'cyberpunkton',
    senderAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    timestamp: '5m ago',
    read: false,
    previewImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    previewTitle: 'TON Odyssey (VIP Club Mix)',
    previewSubtitle: 'Single · Lossless Master Stems',
    actionLabel: 'Listen Now',
  },
  {
    id: 'notif-2',
    category: 'nft',
    subType: 'bid',
    title: 'New Bid Received',
    description: 'placed a new bid of 14.5 TON on your rare collectible "Sonic Horizons #08".',
    senderName: 'Elena Rostova',
    senderHandle: 'elena_sound',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    timestamp: '22m ago',
    read: false,
    previewImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    previewTitle: 'Sonic Horizons #08 (Rare Tier)',
    previewSubtitle: 'Highest Bid: 14.5 TON · 2h remaining',
    actionLabel: 'Review Bid',
  },
  {
    id: 'notif-3',
    category: 'social',
    subType: 'like',
    title: 'Liked your JamSpace comment',
    description: 'liked your review on "The Genesis Soundscape: Decentralizing Electronic Music".',
    senderName: 'Krupy Beats',
    senderHandle: 'krupybeats',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 'notif-4',
    category: 'social',
    subType: 'follower',
    title: 'New Follower',
    description: 'started following your artist catalog on TonJam.',
    senderName: 'Marcus Wright',
    senderHandle: 'mwright_audio',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    timestamp: '3h ago',
    read: true,
    actionLabel: 'Follow Back',
  },
  {
    id: 'notif-5',
    category: 'nft',
    subType: 'sale',
    title: 'Music NFT Sold',
    description: 'Your 1-of-1 master NFT "Midnight Waves" was sold for 42.0 TON. Royalties credited!',
    senderName: 'TonJam Marketplace',
    senderHandle: 'tonjam_market',
    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    timestamp: '5h ago',
    read: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    previewTitle: 'Midnight Waves #01 (1/1 Master)',
    previewSubtitle: 'Sold for 42.0 TON ($231 USD)',
    actionLabel: 'View Transaction',
  },
  {
    id: 'notif-6',
    category: 'account',
    subType: 'verification',
    title: 'Artist Badge Verified',
    description: 'Your application for verified artist status has been approved by TonJam DAO curators.',
    senderName: 'TonJam DAO',
    senderHandle: 'tonjam_curators',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    timestamp: '1d ago',
    read: true,
  },
  {
    id: 'notif-7',
    category: 'nft',
    subType: 'auction',
    title: 'Outbid Alert',
    description: 'You were outbid by @dj_tony on "Genesis Album Key #03". The current top bid is 8.2 TON.',
    senderName: 'TonJam Auctions',
    senderHandle: 'tonjam_auctions',
    senderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    timestamp: '2d ago',
    read: true,
    actionLabel: 'Place Higher Bid',
  },
];

export const MobileNotificationsScreen: React.FC<MobileNotificationsScreenProps> = ({
  onNavigate,
  onBack,
  showBack = false,
}) => {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('all');
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal');

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filter logic
  const filteredNotifications = useMemo(() => {
    if (simulatedState === 'empty') return [];

    return notifications.filter((n) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'verified_artists') return Boolean(n.isVerified);
      if (activeFilter === 'mentions') return n.subType === 'mention' || n.subType === 'reply';
      if (activeFilter === 'music_nfts') return n.category === 'music' || n.category === 'nft';
      return true;
    });
  }, [notifications, activeFilter, simulatedState]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleItemClick = (notification: UnifiedNotification) => {
    // Mark this notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    if (notification.actionDestination && onNavigate) {
      onNavigate(notification.actionDestination);
    } else {
      toast.info(`Opened: ${notification.title}`);
    }
  };

  const handleActionClick = (notification: UnifiedNotification) => {
    handleItemClick(notification);
    toast.success(`Action taken on ${notification.title}`);
  };

  const handlePreviewPlay = (notification: UnifiedNotification) => {
    toast.success(`Now Playing: ${notification.previewTitle || 'Selected track'}`);
  };

  return (
    <div className="w-full flex flex-col bg-[#080D1A] text-white select-none pb-24 text-left">
      {/* SCREEN HEADER */}
      <TonJamHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
        showBack={showBack}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#2E8CEB]" />
                <span className="hidden xs:inline">Mark Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate?.('/settings?tab=notifications')}
              className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Notification settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-3 pt-1">
        {/* FILTER PILLS */}
        <NotificationFilterPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          unreadCount={unreadCount}
        />

        {/* NOTIFICATION FEED BODY */}
        {simulatedState === 'loading' ? (
          <div className="pt-2">
            <SkeletonRow count={5} />
          </div>
        ) : simulatedState === 'error' ? (
          <div className="pt-4">
            <ErrorState
              title="Failed to sync notifications"
              message="Network interruption prevented loading recent events."
              onRetry={() => {
                setSimulatedState('normal');
                toast.success('Notifications re-synced successfully');
              }}
            />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              heading="You're all caught up."
              supportingText="Updates from artists, listeners, and your music community will appear here."
              buttonText="Explore TonJam"
              onAction={() => {
                if (simulatedState === 'empty') setSimulatedState('normal');
                onNavigate?.('/discover');
              }}
            />
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {filteredNotifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onItemClick={handleItemClick}
                onActionClick={handleActionClick}
                onPreviewPlay={handlePreviewPlay}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNotificationsScreen;

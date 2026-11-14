import React, { useState, useMemo } from 'react';
import { Settings, CheckCheck } from 'lucide-react';
import {
  TonJamHeader,
  NotificationFilterPills,
  NotificationItem,
  SkeletonRow,
  EmptyState,
  ErrorState,
} from '../index';
import { UnifiedNotification, NotificationFilterType } from '../types';
import { useTonJamNotifications } from '@/components/notifications/NotificationContext';
import { toast } from 'sonner';

interface MobileNotificationsScreenProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}

export const MobileNotificationsScreen: React.FC<MobileNotificationsScreenProps> = ({
  onNavigate,
  onBack,
  showBack = false,
}) => {
  const { notifications: realNotifications, isLoading, error, retryFetch, markAsRead, markAllAsRead } = useTonJamNotifications();
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('all');

  const notifications = useMemo<UnifiedNotification[]>(() => {
    return realNotifications.map((n) => ({
      id: n.id,
      category: (n.category === 'nft_sale' || n.category === 'nft_purchase' || n.category === 'auction' || n.category === 'marketplace')
        ? 'nft'
        : (n.category === 'music' || n.category === 'artist_release')
        ? 'music'
        : (n.category === 'system' ? 'account' : 'social'),
      subType: (n.metadata?.subCategory as any) || 'system',
      title: n.title,
      description: n.description,
      senderName: n.senderName || 'TonJam',
      senderHandle: n.senderName || 'tonjam',
      senderAvatar: n.avatarUrl || '',
      isVerified: Boolean(n.isVerified),
      timestamp: n.timestamp,
      read: n.read,
      previewImageUrl: n.thumbnailUrl,
      previewTitle: n.musicPreview?.title || n.nftPreview?.title,
      actionLabel: n.quickAction?.label,
      actionDestination: n.link,
    }));
  }, [realNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'verified_artists') return Boolean(n.isVerified);
      if (activeFilter === 'mentions') return n.subType === 'mention' || n.subType === 'reply';
      if (activeFilter === 'music_nfts') return n.category === 'music' || n.category === 'nft';
      return true;
    });
  }, [notifications, activeFilter]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleItemClick = async (notification: UnifiedNotification) => {
    await markAsRead(notification.id);
    if (notification.actionDestination && onNavigate) {
      onNavigate(notification.actionDestination);
    }
  };

  const handleActionClick = async (notification: UnifiedNotification) => {
    await handleItemClick(notification);
  };

  const handlePreviewPlay = (notification: UnifiedNotification) => {
    if (notification.previewTitle) {
      toast.info(notification.previewTitle);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#080D1A] text-white select-none pb-24 text-left">
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
        <NotificationFilterPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          unreadCount={unreadCount}
        />

        {isLoading ? (
          <div className="pt-2">
            <SkeletonRow count={5} />
          </div>
        ) : error ? (
          <div className="pt-4">
            <ErrorState
              title="Failed to sync notifications"
              message={error}
              onRetry={retryFetch}
            />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              heading="You're all caught up."
              supportingText="Updates from artists, listeners, and your music community will appear here."
              buttonText="Explore TonJam"
              onAction={() => onNavigate?.('/discover')}
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

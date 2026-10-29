import React from 'react';
import NotificationItem from './NotificationItem';
import { TonJamNotification, NotificationQuickAction } from './types';

export interface NotificationCardProps {
  notification: TonJamNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onActionClick: (action: NotificationQuickAction, notification: TonJamNotification) => void;
  onCardClick?: (notification: TonJamNotification) => void;
}

export const formatTimeAgo = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete,
  onActionClick,
  onCardClick,
}) => {
  return (
    <NotificationItem
      notification={notification}
      onMarkRead={onMarkRead}
      onDelete={onDelete}
      onActionClick={onActionClick}
      onItemClick={onCardClick}
    />
  );
};

export default NotificationCard;

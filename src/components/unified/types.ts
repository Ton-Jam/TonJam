export type MobileTab = 'settings' | 'notifications' | 'earn';

export interface ProfileData {
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  role: string;
  walletAddress?: string;
}

export type NotificationCategory = 'social' | 'music' | 'nft' | 'account';

export type NotificationFilterType = 'all' | 'verified_artists' | 'mentions' | 'music_nfts';

export interface UnifiedNotification {
  id: string;
  category: NotificationCategory;
  subType: 'like' | 'reply' | 'mention' | 'follower' | 'new_track' | 'new_album' | 'announcement' | 'bid' | 'sale' | 'outbid' | 'auction' | 'security' | 'verification';
  title: string;
  description: string;
  senderName: string;
  senderHandle: string;
  senderAvatar: string;
  isVerified?: boolean;
  timestamp: string;
  read: boolean;
  previewImageUrl?: string;
  previewTitle?: string;
  previewSubtitle?: string;
  actionLabel?: string;
  actionDestination?: string;
}

export type TaskCategoryType = 'All Tasks' | 'Daily' | 'Music' | 'Community';

export type TaskStatusType = 'available' | 'in_progress' | 'claimable' | 'completed' | 'locked';

export interface UnifiedTask {
  id: string;
  title: string;
  description: string;
  category: 'Daily' | 'Music' | 'Community' | 'Profile';
  reward: number;
  status: TaskStatusType;
  progress?: {
    current: number;
    total: number;
  };
  isFeatured?: boolean;
  actionLabel?: string;
  iconType: 'music' | 'daily' | 'community' | 'profile' | 'star';
  completedAt?: string;
}

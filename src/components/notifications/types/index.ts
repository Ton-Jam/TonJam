export type NotificationCategory =
  | 'music'
  | 'artist_release'
  | 'follower'
  | 'like'
  | 'comment'
  | 'mention'
  | 'playlist_share'
  | 'track_share'
  | 'nft_sale'
  | 'nft_purchase'
  | 'auction'
  | 'marketplace'
  | 'wallet_transaction'
  | 'royalty'
  | 'tj_reward'
  | 'mission'
  | 'system';

export type NotificationFilter =
  | 'all'
  | 'unread'
  | 'music'
  | 'artists'
  | 'nfts'
  | 'marketplace'
  | 'wallet'
  | 'rewards'
  | 'social'
  | 'tasks'
  | 'system';

export interface NotificationQuickAction {
  label: string;
  type: 'play' | 'follow' | 'reply' | 'view' | 'claim' | 'join' | 'bid' | 'mint' | 'dismiss';
  payload?: any;
}

export interface TonJamNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timestamp: string; // ISO string
  read: boolean;
  avatarUrl?: string; // Optional user avatar
  thumbnailUrl?: string; // Optional cover/NFT thumbnail
  quickAction?: NotificationQuickAction;
  metadata?: {
    trackId?: string;
    artistId?: string;
    nftId?: string;
    txHash?: string;
    rewardAmount?: number;
    bidAmount?: number;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  directAlerts: boolean;
  marketActivity: boolean;
  dropsAndReleases: boolean;
  socialSignals: boolean;
  bidAlerts: boolean;
  saleEvents: boolean;
  rewardsAndMissions: boolean;
  systemUpdates: boolean;
  digestFrequency?: 'none' | 'daily' | 'weekly';
}

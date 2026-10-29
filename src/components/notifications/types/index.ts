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
  | 'verified_artists'
  | 'mentions'
  | 'music_nfts'
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

export interface MusicPreviewData {
  trackId?: string;
  title: string;
  artist: string;
  artwork?: string;
  audioUrl?: string;
  duration?: number;
  isVerified?: boolean;
}

export interface NFTPreviewData {
  nftId?: string;
  title: string;
  thumbnailUrl?: string;
  event: 'bid' | 'sale' | 'outbid' | 'auction' | 'minted' | 'listed';
  amountTon?: number;
  txHash?: string;
  sellerOrBidder?: string;
}

export interface SocialPreviewData {
  postExcerpt?: string;
  postId?: string;
  targetUser?: string;
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
  senderName?: string;
  isVerified?: boolean;
  musicPreview?: MusicPreviewData;
  nftPreview?: NFTPreviewData;
  socialPreview?: SocialPreviewData;
  quickAction?: NotificationQuickAction;
  metadata?: {
    trackId?: string;
    artistId?: string;
    artistName?: string;
    isVerified?: boolean;
    nftId?: string;
    nftTitle?: string;
    txHash?: string;
    rewardAmount?: number;
    bidAmount?: number;
    commentId?: string;
    postId?: string;
    subCategory?: string;
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

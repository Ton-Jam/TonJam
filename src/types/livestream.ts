export type StreamStatus = 'live' | 'ended' | 'scheduled';

export type StreamCategory = 
  | 'Live Performance' 
  | 'DJ Set' 
  | 'Studio Jam' 
  | 'Beat Making' 
  | 'Listening Party' 
  | 'Q&A Session' 
  | 'NFT Drop'
  | 'Acoustic Lounge';

export type NFTHolderTier = 'Genesis VIP' | 'Diamond Holder' | 'Collector' | 'Artist VIP' | 'Top Tipper' | 'Listener';

export interface UserHeldNFT {
  id: string;
  title: string;
  imageUrl: string;
  rarity?: string;
  edition?: string;
  collectionName?: string;
  artistId?: string;
  isGenesis?: boolean;
}

export interface ViewerPrivileges {
  tier: NFTHolderTier;
  badgeLabel: string;
  badgeColor: string;
  glowEffect: boolean;
  canPriorityPinQA: boolean;
  canRequestSongs: boolean;
  canTriggerVipSoundboard: boolean;
  specialEmotesUnlocked: boolean;
  superTipMultipliers: boolean;
  heldNFTs: UserHeldNFT[];
}

export interface LiveStreamSession {
  id: string;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  artistHandle: string;
  artistAddress: string;
  artistVerified: boolean;
  status: StreamStatus;
  category: StreamCategory;
  tags: string[];
  thumbnailUrl: string;
  videoSourceType: 'webcam' | 'screen' | 'stage_visualizer' | 'simulated_feed';
  streamVideoUrl?: string;
  viewerCount: number;
  peakViewers: number;
  totalTipsTon: number;
  totalTipsGram: number;
  totalTipsTJ: number;
  startedAt: string;
  endedAt?: string;
  nftGated?: boolean;
  requiredNftCollection?: string;
  requiredNftName?: string;
  pinnedAnnouncement?: {
    text: string;
    author: string;
    timestamp: string;
    isVip?: boolean;
  } | null;
  currentSongPlaying?: {
    title: string;
    trackId?: string;
    coverUrl?: string;
    artist?: string;
    genre?: string;
  } | null;
  quality?: '4K Ultra' | '1080p60' | '720p' | 'Auto';
}

export interface LiveStreamChatMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userAddress?: string;
  text: string;
  timestamp: string;
  type: 'chat' | 'tip' | 'qa' | 'nft_drop' | 'system' | 'pinned';
  tipAmount?: number;
  tipCurrency?: 'TON' | 'GRAM' | 'JAM';
  userNfts?: UserHeldNFT[];
  highestTierBadge?: NFTHolderTier;
  privileges?: Partial<ViewerPrivileges>;
  isHost?: boolean;
  isArtist?: boolean;
  isPinned?: boolean;
  questionAnswered?: boolean;
  reactions?: {
    heart?: number;
    fire?: number;
    diamond?: number;
    rocket?: number;
  };
}

export interface LiveStreamTip {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderAddress: string;
  amount: number;
  currency: 'TON' | 'GRAM' | 'JAM';
  message?: string;
  timestamp: string;
  senderNfts?: UserHeldNFT[];
  senderTier?: NFTHolderTier;
}

export interface LiveStreamSongRequest {
  id: string;
  streamId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterNfts?: UserHeldNFT[];
  requesterTier?: NFTHolderTier;
  songTitle: string;
  artistName: string;
  tipAmount?: number;
  currency?: string;
  status: 'pending' | 'playing' | 'completed' | 'declined';
  isVipPriority: boolean;
  createdAt: string;
}

export interface LiveStreamQAQuestion {
  id: string;
  streamId: string;
  askerId: string;
  askerName: string;
  askerAvatar: string;
  askerTier?: NFTHolderTier;
  askerNfts?: UserHeldNFT[];
  question: string;
  isAnswered: boolean;
  upvotes: number;
  createdAt: string;
  isVipPriority: boolean;
}


export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  genre: string;
  mood?: string;
  isNFT: boolean;
  artistVerified?: boolean;
  price?: string; 
  listingType?: 'fixed' | 'auction';
  auctionDuration?: string;
  streamingPrice?: string;
  editions?: string;
  editionType?: string;
  rarity?: string;
  royalty?: string;
  bpm?: number;
  key?: string;
  bitrate?: string; // e.g. "FLAC", "320kbps"
  playCount?: number;
  streams?: number; // Alias for playCount used in UI
  likes?: number;
  jamScore?: number;
  releaseDate?: string;
  ipfsUrl?: string; // Decentralized metadata/audio link
  cid?: string; // Content Identifier
  description?: string;
  audioIpfsUrl?: string;
  coverIpfsUrl?: string;
  royaltySplits?: RoyaltySplit[];
  lyrics?: string;
  recommendationReason?: string;
  recommendationScore?: number;
  isCollaboration?: boolean;
  createdAt: string;
}

export interface NFTTrait {
  trait_type: string;
  value: string | number;
}

export interface NFTHistory {
  event: string;
  from: string;
  to: string;
  date: string;
  price?: string;
}

export interface NFTOffer {
  id: string;
  offerer: string;
  price: string;
  duration: string;
  timestamp: string;
}

export interface ExclusiveContent {
  id: string;
  title: string;
  type: 'video' | 'track' | 'image' | 'document';
  url: string;
  description?: string;
}

export interface NFTItem {
  id: string;
  trackId: string;
  title: string;
  owner: string;
  creator: string;
  artist?: string;
  artistId?: string;
  price: string;
  imageUrl: string;
  coverUrl?: string; // Alias for imageUrl
  audioUrl?: string;
  edition: string;
  supply?: number;
  minted?: number;
  isAuction?: boolean;
  contractAddress?: string;
  royaltySplits?: { address: string, percentage: number }[];
  stems_available?: boolean;
  description?: string;
  traits?: NFTTrait[];
  attributes?: NFTTrait[]; // Alias for traits
  history?: NFTHistory[];
  offers?: NFTOffer[];
  exclusiveContent?: ExclusiveContent[];
  ipfsUrl?: string; // Decentralized metadata link
  cid?: string; // Content Identifier
  createdAt?: string;
  // Auction specific fields
  listingType?: 'fixed' | 'auction';
  auctionStartTime?: string; // ISO string or timestamp
  auctionEndTime?: string; // ISO string or timestamp
  auctionEndDate?: string; // Alias for auctionEndTime
  startingBid?: string;
  royalty?: number;
}

export interface SongRequest {
  id: string;
  artistId: string;
  requesterId: string;
  requesterName: string;
  songTitle: string;
  description?: string;
  status: 'pending' | 'accepted' | 'fulfilled' | 'rejected';
  tipAmount?: string; // in TON
  hasTipped?: boolean;
  createdAt: string;
}

export interface RoyaltySplit {
  address: string;
  percentage: number; // e.g. 0.05 for 5%
  label?: string; // e.g. "Producer", "Manager"
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  ticketUrl?: string;
}

export interface Collaboration {
  id: string;
  artistName: string;
  trackTitle: string;
  coverUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  handle?: string;
  walletAddress?: string;
  avatarUrl: string;
  followers: number;
  verified: boolean;
  isVerifiedArtist?: boolean;
  genre?: string;
  monthlyListeners?: number;
  bio?: string;
  bannerUrl?: string;
  socials?: {
    x?: string;
    spotify?: string;
    instagram?: string;
    website?: string;
    telegram?: string;
  };
  royaltyConfig?: {
    streamingSplits: RoyaltySplit[];
    nftSaleSplits: RoyaltySplit[];
    streamingPercentage?: number;
    nftSaleShare?: number;
  };
  earnings?: {
    streaming: number;
    nftSales: number;
    total: number;
  };
  events?: Event[];
  collaborations?: Collaboration[];
  profileTheme?: 'light' | 'dark' | 'cyberpunk' | 'ocean' | 'neon';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  reactions?: Record<string, number>;
  userReactions?: string[]; // Array of emojis the current user has reacted with
  replies?: Comment[]; // Nested replies
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userHandle?: string;
  userAvatar: string;
  isVerified?: boolean;
  content: string;
  imageUrl?: string;
  video?: string;
  trackId?: string;
  track?: Track; // Optional populated track
  nftId?: string;
  nft?: NFTItem; // Optional populated NFT
  likes: number;
  isLiked?: boolean;
  reposts?: number;
  isReposted?: boolean;
  comments: number;
  commentList?: Comment[];
  timestamp: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  artistId?: string;
  title?: string;
  subtitle?: string;
  type?: string;
  paymentAmount?: string;
  paymentCurrency?: string;
  status?: string;
  artistName?: string;
  link?: string;
  targetId?: string;
}

export interface Playlist {
  id: string;
  title: string;
  coverUrl: string;
  trackCount: number;
  creator: string;
  description?: string;
  trackIds?: string[];
  isPrivate?: boolean;
  isCollaborative?: boolean;
  tags?: string[];
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bannerUrl?: string;
  bio?: string;
  walletAddress?: string;
  followers: number;
  following: number;
  earnings: number;
  isVerifiedArtist?: boolean;
  socials?: {
    x?: string;
    spotify?: string;
    instagram?: string;
    website?: string;
    telegram?: string;
  };
  isPremium?: boolean;
  tonBalance?: number;
  jamBalance?: number;
  stakedJam?: number;
  pendingJamRewards?: number;
  lastStakingUpdate?: string;
  streamingEarnings?: number;
  nftEarnings?: number;
  followedArtists?: string[];
  followedUserIds?: string[];
  likedTrackIds?: string[];
  friends?: string[];
  favoriteGenres?: string[];
  transactions?: Transaction[];
  createdPlaylistIds?: string[];
  ownedNftIds?: string[];
  listedNftIds?: string[];
  anthemId?: string;
  createdAt?: string;
  role?: 'artist' | 'collector' | 'admin';
  profileTheme?: 'light' | 'dark' | 'cyberpunk' | 'ocean' | 'neon';
}

export interface Transaction {
  id: string;
  type: 'stream' | 'nft_sale' | 'nft_mint' | 'withdrawal' | 'platform_fee' | 'jam_purchase' | 'premium_subscription' | 'stake' | 'unstake' | 'claim_rewards' | 'sponsorship' | 'deposit';
  amount: number; // Total amount in TON or JAM
  platformFee: number; // Total platform fee
  artistShare: number; // Amount sent to artist
  recipientAddress: string;
  senderAddress?: string;
  trackId?: string;
  trackTitle?: string;
  nftId?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export interface SponsoredContent {
  id: string;
  artistId: string;
  artistName: string;
  type: 'track' | 'nft' | 'announcement';
  title: string;
  description?: string;
  imageUrl: string;
  targetId?: string; // trackId or nftId
  link?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  paymentAmount: string; // in TON or JAM
  paymentCurrency: 'TON' | 'JAM';
  durationDays: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: string;
  currency: 'TON' | 'JAM';
  recipientAddress: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  txHash?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  points: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'achievement' | 'milestone' | 'seasonal';
  progress: number;
  total: number;
  dueDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  priority?: 'high' | 'medium' | 'low';
}


export interface Collection {
  id: string;
  artistId: string;
  name: string;
  description?: string;
  coverUrl: string;
  nftIds: string[]; // List of NFT IDs in this collection
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'track_upload' | 'nft_sale' | 'event' | 'bid_update' | 'general';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  directAlerts: boolean;
  marketActivity: boolean;
  dropsAndReleases: boolean;
  socialSignals: boolean;
  bidAlerts: boolean;
  saleEvents: boolean;
  revenueThreshold?: number;
}

export interface TokenGating {
  enabled: boolean;
  tokenAddress?: string; // Address of the required token or NFT collection
  minAmount?: string; // Minimum amount required (e.g. "100" for tokens, "1" for NFT)
  tokenSymbol?: string; // Display symbol (e.g. "JAM", "TON")
  tokenType: 'jetton' | 'nft'; // TON specific types
}

export class Track {
  id!: string;
  songId!: string;
  albumId?: string;
  title!: string;
  artist!: string;
  artistId!: string;
  coverUrl!: string;
  audioUrl!: string;
  duration!: number; // in seconds
  genre: string = 'Unknown';
  mood?: 'chill' | 'energetic' | 'focus' | 'happy' | 'melancholic' | 'Unknown' | string = 'Unknown';
  isNFT!: boolean;
  artistVerified?: boolean;
  price?: string; 
  listingType?: 'fixed' | 'auction';
  auctionDuration?: string;
  streamingPrice?: string;
  editions?: string;
  minted?: number;
  editionType?: string;
  rarity?: string;
  royalty?: string;
  bpm?: number = 0;
  key?: string = '';
  bitrate?: string; // e.g. "FLAC", "320kbps"
  playCount?: number = 0;
  streams?: number; // Alias for playCount used in UI
  likes?: number = 0;
  jamScore?: number;
  releaseDate?: string;
  ipfsUrl?: string; // Decentralized metadata/audio link
  cid?: string; // Content Identifier
  description?: string;
  audioIpfsUrl?: string;
  coverIpfsUrl?: string;
  royaltySplits?: RoyaltySplit[];
  lyrics?: string = '';
  isExclusive?: boolean;
  isExplicit?: boolean;
  recommendationReason?: string;
  recommendationScore?: number;
  isCollaboration?: boolean;
  createdAt!: string | number;
  tokenGating?: TokenGating;
  isDrmProtected?: boolean;
  watermarkText?: string;
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

export interface Listing {
  id: string;
  nftId: string;
  nftAddress?: string;
  sellerId: string;
  price: string;
  status: 'active' | 'sold' | 'cancelled';
  buyerId?: string;
  createdAt: string;
  updatedAt: string;
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
  ownerId?: string;
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
  royaltySplits?: RoyaltySplit[];
  stems_available?: boolean;
  artistVerified?: boolean;
  description?: string;
  traits?: NFTTrait[];
  attributes?: NFTTrait[]; // Alias for traits
  history?: NFTHistory[];
  offers?: NFTOffer[];
  exclusiveContent?: ExclusiveContent[];
  isBundle?: boolean;
  bundleTracks?: { title: string; audioUrl: string }[];
  bundleVisuals?: { title: string; imageUrl: string }[];
  ipfsUrl?: string; // Decentralized metadata link
  cid?: string; // Content Identifier
  createdAt?: string;
  views?: number;
  // Auction specific fields
  listingType?: 'fixed' | 'auction';
  auctionStartTime?: string; // ISO string or timestamp
  auctionEndTime?: string; // ISO string or timestamp
  auctionEndDate?: string; // Alias for auctionEndTime
  startingBid?: string;
  royalty?: number;
  tokenGating?: TokenGating;
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

export interface Collaborator {
  id: string;
  userId?: string;
  address: string;
  name: string;
  role: string;
  royalty: number;
}

export interface RoyaltySplit {
  address: string;
  percentage: number; // e.g. 0.05 for 5%
  label?: string; // e.g. "Producer", "Manager"
}

export interface RoyaltySplitExtended extends RoyaltySplit {
  label: string;
}

export interface ArtistEvent {
  id: string;
  artistId: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  ticketUrl?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  status?: 'upcoming' | 'past' | 'cancelled';
}

export interface Collaboration {
  id: string;
  artistName: string;
  trackTitle: string;
  coverUrl: string;
}

export interface Artist {
  uid: string;
  name: string;
  username?: string;
  walletAddress?: string;
  avatarUrl: string;
  followers: number;
  verified: boolean;
  isVerifiedArtist?: boolean;
  genre?: string;
  monthlyListeners?: number;
  bio?: string;
  bannerUrl?: string;
  bannerImageUrl?: string;
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
  events?: ArtistEvent[];
  collaborations?: Collaboration[];
  collaborators?: Collaborator[];
  pinnedNftIds?: string[];
  profileTheme?: 'light' | 'dark' | 'cyberpunk' | 'ocean' | 'neon';
  playCount?: number;
  location?: string;
  isLive?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface PostComment {
  id: string;
  postId?: string;
  userId: string;
  userName: string;
  username?: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  createdAt?: string;
  likes: number;
  reactions?: Record<string, number>;
  userReactions?: string[]; // Array of emojis the current user has reacted with
  replies?: PostComment[]; // Nested replies
  replyToId?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  username?: string;
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
  commentList?: PostComment[];
  timestamp: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  artistId?: string;
  title?: string;
  subtitle?: string;
  type?: string;
  isExclusive?: boolean;
  paymentAmount?: string;
  paymentCurrency?: string;
  status?: string;
  artistName?: string;
  link?: string;
  targetId?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  releaseYear: number;
  trackIds: string[];
  genre: string;
  description?: string;
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
  folderId?: string;
  updatedAt?: string;
}

export interface PlaylistFolder {
  id: string;
  title: string;
  creator: string;
  playlistIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
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
  location?: string;
  website?: string;
  isPremium?: boolean;
  tonBalance?: number;
  jamBalance?: number;
  tjBalance?: number;
  stakedJam?: number;
  pendingJamRewards?: number;
  lastStakingUpdate?: string;
  autoCompound?: boolean;
  streamingEarnings?: number;
  nftEarnings?: number;
  followedArtists?: string[];
  followedUserIds?: string[];
  likedTrackIds?: string[];
  likedNftIds?: string[];
  friends?: string[];
  favoriteGenres?: string[];
  transactions?: Transaction[];
  createdPlaylistIds?: string[];
  ownedTrackIds?: string[];
  ownedNftIds?: string[];
  listedNftIds?: string[];
  anthemId?: string;
  createdAt?: string;
  role?: 'artist' | 'collector' | 'admin';
  collectorTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Legend' | 'None';
  badges?: string[];
  profileTheme?: 'light' | 'dark' | 'cyberpunk' | 'ocean' | 'neon';
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  royaltyConfig?: {
    streamingSplits: RoyaltySplit[];
    nftSaleSplits: RoyaltySplit[];
  };
  collaborators?: Collaborator[];
}

export interface ArtistVerificationRequest {
  id: string;
  userId: string;
  artistName: string;
  email: string;
  bio: string;
  statement?: string; // New field
  genre: string;
  socialLinks: {
    x?: string;
    spotify?: string;
    instagram?: string;
    website?: string;
    soundcloud?: string;
  };
  portfolioUrls: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewerNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  uid: string;
  username: string;
  name: string;
  avatar?: string;
  verified?: boolean;
  followers: number;
  walletAddress?: string;
}

export interface Royalty {
  artistId: string;
  totalEarned: string; // Total lifetime earnings in TON
  pendingWithdrawal: string; // Earnings available for withdrawal
  lastWithdrawal?: string; // Last withdrawal timestamp
}

export interface Transaction {
  id: string;
  type: 'stream' | 'nft_sale' | 'nft_mint' | 'withdrawal' | 'platform_fee' | 'jam_purchase' | 'premium_subscription' | 'stake' | 'unstake' | 'claim_rewards' | 'sponsorship' | 'deposit' | 'tip' | 'fan_club_join';
  amount: number; // Total amount in TON or JAM
  platformFee: number; // Total platform fee
  artistShare: number; // Amount sent to artist
  recipientAddress: string;
  senderAddress?: string;
  userId?: string;
  participants?: string[];
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
  subtitle?: string;
  description: string;
  reward: string;
  points: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'achievement' | 'milestone' | 'seasonal' | 'one-time' | 'referral' | 'boost' | 'onchain' | 'social';
  progress: number;
  total: number;
  color?: string;
  iconName?: string;
  dueDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  priority?: 'high' | 'medium' | 'low';
  link?: string;
}

export interface TaskCompletion {
  id?: string;
  userId: string;
  taskId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Proposal {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  category: string;
  startTime: string;
  endTime: string;
  forVotes: number;
  againstVotes: number;
  voters?: string[];
  createdAt: string;
}

export interface TreasuryStats {
  balance: number; // Current balance in TON
  totalFeesCollected: number;
  totalGrantsAllocated: number;
  updatedAt: string;
}

export interface GrantAllocation {
  id: string;
  proposalId: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  category: 'artist_grant' | 'feature_development';
  status: 'pending' | 'distributed';
  timestamp: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  choice: 'for' | 'against';
  power: number;
  createdAt: string;
}

export interface TrackMetadata {
  track_id: string;
  title: string;
  artist: {
    name: string;
    id: string;
  };
  album?: string;
  release_year?: number;
  sonic_attributes: {
    bpm: number;
    energy_score: number;
    valence: number;
  };
  taxonomy: {
    primary_genre: 'Pop' | 'Hip-Hop & Rap' | 'R&B & Soul' | 'Electronic & Dance' | 'Afrobeats & African' | 'Latin' | 'Rock & Alternative' | 'Country & Americana' | 'Jazz & Blues' | 'Classical & Instrumental' | 'Reggae & Dancehall' | 'Global Fusion';
    subgenres: string[];
  };
  semantic_tags: {
    moods: string[];
    activities: string[];
    textures: string[];
  };
}

export interface FanTokenBalance {
  id: string;
  userId: string;
  artistId: string;
  balance: number;
  updatedAt: string;
}

export interface UnlockedExclusiveContent {
  id: string;
  userId: string;
  artistId: string;
  contentId: string;
  unlockedAt: string;
}

export interface ArtistPoll {
  id: string;
  artistId: string;
  artistName: string;
  question: string;
  options: string[];
  status: 'active' | 'closed';
  endTime: string;
  createdAt: string;
}

export interface ArtistPollVote {
  id: string;
  pollId: string;
  userId: string;
  choiceIndex: number;
  weight: number;
  votedAt: string;
}

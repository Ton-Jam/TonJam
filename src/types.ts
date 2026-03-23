
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
  // Auction specific fields
  listingType?: 'fixed' | 'auction';
  auctionStartTime?: string; // ISO string or timestamp
  auctionEndTime?: string; // ISO string or timestamp
  startingBid?: string;
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
  };
  earnings?: {
    streaming: number;
    nftSales: number;
    total: number;
  };
  events?: Event[];
  collaborations?: Collaboration[];
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
}

export interface Transaction {
  id: string;
  type: 'stream' | 'nft_sale' | 'nft_mint' | 'withdrawal' | 'platform_fee' | 'jam_purchase' | 'premium_subscription' | 'stake' | 'unstake' | 'claim_rewards';
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

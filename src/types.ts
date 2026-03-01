
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  genre: string;
  isNFT: boolean;
  artistVerified?: boolean;
  price?: string; 
  bpm?: number;
  key?: string;
  bitrate?: string; // e.g. "FLAC", "320kbps"
  playCount?: number;
  streams?: number; // Alias for playCount used in UI
  likes?: number;
  releaseDate?: string;
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
  royalty?: number; // percentage
  stems_available?: boolean;
  description?: string;
  traits?: NFTTrait[];
  attributes?: NFTTrait[]; // Alias for traits
  history?: NFTHistory[];
  offers?: NFTOffer[];
  // Auction specific fields
  listingType?: 'fixed' | 'auction';
  auctionStartTime?: string; // ISO string or timestamp
  auctionEndTime?: string; // ISO string or timestamp
  startingBid?: string;
}

export interface Artist {
  id: string;
  name: string;
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
    streamingPercentage: number; // e.g. 0.05 (5%)
    nftSaleShare: number; // e.g. 0.10 (10%)
  };
  earnings?: {
    streaming: string;
    nftSales: string;
    total: string;
  };
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
  earnings: string;
  isVerifiedArtist?: boolean;
  streamingEarnings?: string;
  nftEarnings?: string;
  followedArtists?: string[];
  followedUserIds?: string[];
  friends?: string[];
  socials?: {
    x?: string;
    instagram?: string;
    website?: string;
    telegram?: string;
    spotify?: string;
  };
}

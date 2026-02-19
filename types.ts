
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
  likes?: number;
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
  price: string;
  imageUrl: string;
  edition: string;
  contractAddress?: string;
  royalty?: number; // percentage
  stems_available?: boolean;
  description?: string;
  traits?: NFTTrait[];
  history?: NFTHistory[];
  offers?: NFTOffer[];
  // Auction specific fields
  listingType?: 'fixed' | 'auction';
  auctionEndTime?: string; // ISO string or timestamp
  startingBid?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  followers: number;
  verified: boolean;
  bio?: string;
  bannerUrl?: string;
  socials?: {
    x?: string;
    spotify?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  trackId?: string;
  likes: number;
  comments: number;
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
}

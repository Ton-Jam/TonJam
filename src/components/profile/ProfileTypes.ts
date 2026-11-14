export interface ProfileData {
  uid: string;
  name: string;
  username: string;
  avatar: string;
  bannerUrl?: string;
  coverPhoto?: string;
  bio?: string;
  genre?: string;
  country?: string;
  memberSince: string;
  walletAddress?: string;
  isSpotifyVerified: boolean;
  isArtistVerified: boolean;
  isTonVerified?: boolean;
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  
  // Stats
  followers: number;
  following: number;
  monthlyListeners: number;
  totalStreams: number;
  nftsOwned: number;
  nftsSold: number;
  playlistsCount: number;
  tjPoints: number;

  socials?: {
    x?: string;
    spotify?: string;
    instagram?: string;
    website?: string;
    telegram?: string;
    discord?: string;
  };
  languages?: string[];
}

export interface ActivityEvent {
  id: string;
  type: 'like' | 'comment' | 'share' | 'nft_purchase' | 'nft_sale' | 'follow';
  title: string;
  description: string;
  timestamp: string;
  rawDate?: string;
  metadata?: {
    trackId?: string;
    nftId?: string;
    artistId?: string;
    price?: string;
    commentText?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface ListeningStat {
  genre: string;
  percentage: number;
}

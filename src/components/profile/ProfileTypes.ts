import { NFTItem, Track, Playlist, Post } from '@/types';

export interface ProfileData {
  uid: string;
  name: string;
  username: string;
  avatar: string;
  bannerUrl?: string;
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

export const MOCK_PROFILE: ProfileData = {
  uid: 'tj_user_99',
  name: 'DJ Krupy',
  username: 'krupy_beats',
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=500&h=500&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&h=400&q=80',
  bio: 'Pioneering supersonic audio waves in the TON ecosystem. Audio engineer, multi-instrumentalist, and digital artifact collector.',
  genre: 'Electronic / Synthwave',
  country: 'United Kingdom',
  memberSince: 'March 2026',
  walletAddress: 'EQBvW3Fi_ZcrT9S6Jv5N3m9T7y9H5n7P5w9N7K5w9N7K5w9',
  isSpotifyVerified: true,
  isArtistVerified: false,
  verificationStatus: 'none',
  
  followers: 12450,
  following: 382,
  monthlyListeners: 84300,
  totalStreams: 245900,
  nftsOwned: 42,
  nftsSold: 18,
  playlistsCount: 12,
  tjPoints: 850,

  socials: {
    x: 'https://x.com/krupy_beats',
    spotify: 'https://open.spotify.com/artist/krupy',
    instagram: 'https://instagram.com/krupy_beats',
    website: 'https://krupybeats.audio',
    telegram: 'https://t.me/krupy_beats',
    discord: 'https://discord.gg/krupybeats'
  },
  languages: ['English', 'German']
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Genesis Listener', description: 'Listened to TonJam on launch day', icon: 'zap', unlockedAt: '2026-03-01' },
  { id: '2', title: 'Audiophile', description: 'Streamed over 100 tracks in high-fidelity', icon: 'music', unlockedAt: '2026-03-15' },
  { id: '3', title: 'Curator Elite', description: 'Created a playlist with over 50 followers', icon: 'folder-heart', unlockedAt: '2026-04-10' },
  { id: '4', title: 'Web3 Patron', description: 'Collected 10 music NFTs from emerging creators', icon: 'gem', unlockedAt: '2026-05-02' }
];

export const MOCK_LISTENING_STATS: ListeningStat[] = [
  { genre: 'Synthwave', percentage: 45 },
  { genre: 'Techno', percentage: 25 },
  { genre: 'Ambient', percentage: 15 },
  { genre: 'Hip Hop', percentage: 10 },
  { genre: 'Indie', percentage: 5 }
];

export const MOCK_ACTIVITY_LOGS: ActivityEvent[] = [
  {
    id: 'act_1',
    type: 'nft_purchase',
    title: 'NFT Purchased',
    description: 'Collected "Sonic Resonance #04" for 15.0 TON',
    timestamp: '2 hours ago',
    metadata: { nftId: 'nft_1', price: '15.0 TON' }
  },
  {
    id: 'act_2',
    type: 'like',
    title: 'Liked a Track',
    description: 'Liked "Ethereal Escape" by DJ Starlight',
    timestamp: '5 hours ago',
    metadata: { trackId: 'track_2' }
  },
  {
    id: 'act_3',
    type: 'comment',
    title: 'Commented on Track',
    description: 'Awesome bassline in this remix!',
    timestamp: '1 day ago',
    metadata: { trackId: 'track_3', commentText: 'Awesome bassline in this remix!' }
  },
  {
    id: 'act_4',
    type: 'share',
    title: 'Shared Profile',
    description: 'Shared DJ Krupy\'s artist profile',
    timestamp: '2 days ago'
  },
  {
    id: 'act_5',
    type: 'nft_sale',
    title: 'NFT Sold',
    description: 'Sold "Retro Wave #09" to @ton_whale for 25.0 TON',
    timestamp: '3 days ago',
    metadata: { nftId: 'nft_3', price: '25.0 TON' }
  },
  {
    id: 'act_6',
    type: 'follow',
    title: 'Followed Artist',
    description: 'Followed CyberPunk Crew',
    timestamp: '4 days ago',
    metadata: { artistId: 'artist_4' }
  }
];

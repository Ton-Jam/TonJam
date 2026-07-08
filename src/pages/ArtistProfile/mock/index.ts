import { 
  ArtistStats, 
  ArtistPost, 
  ArtistEvent, 
  TopSupporter, 
  ArtistMission, 
  ArtistAnalyticsData, 
  AlbumData, 
  NFTCollectionData, 
  PlaylistData, 
  MutualFollower 
} from "../types";
import { Track, NFTItem } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";

export const getArtistStats = (artistId: string): ArtistStats => {
  return {
    monthlyListeners: 184500,
    followers: 85400,
    following: 142,
    streams: 4850000,
    albumsCount: 4,
    singlesCount: 12,
    playlistsCount: 3,
    nftCollectionsCount: 3,
    nftOwnersCount: 2450,
    floorPrice: "4.5 TON",
    totalSales: "18.5K TON"
  };
};

export const getMockAlbums = (artistId: string): AlbumData[] => [
  {
    id: "album-solar-pulse",
    title: "Solar Pulse",
    coverUrl: "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png",
    releaseYear: 2024,
    trackCount: 10,
    duration: "42 min 15s",
    isNFT: true,
    floorPrice: "12 TON",
    artistId
  },
  {
    id: "album-cyber-dream",
    title: "Cyber Dream",
    coverUrl: "https://i.postimg.cc/LhhtQkF0/drake.jpg",
    releaseYear: 2023,
    trackCount: 8,
    duration: "34 min 20s",
    isNFT: true,
    floorPrice: "8.5 TON",
    artistId
  },
  {
    id: "album-neon-tokyo",
    title: "Neon Tokyo",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    releaseYear: 2022,
    trackCount: 12,
    duration: "51 min 05s",
    artistId
  },
  {
    id: "album-genesis-vibration",
    title: "Genesis Vibration",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    releaseYear: 2021,
    trackCount: 6,
    duration: "25 min 40s",
    artistId
  }
];

export const getMockSingles = (artistId: string): Track[] => [
  {
    id: "single-quantum-leap",
    songId: "single-quantum-leap",
    title: "Quantum Leap (Extended)",
    artist: "DJ Krupy",
    artistId,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    duration: 310,
    genre: "Electronic",
    isNFT: true,
    playCount: 125400,
    createdAt: "2024-05-12"
  },
  {
    id: "single-crypto-synth",
    songId: "single-crypto-synth",
    title: "Crypto Synth Dreams",
    artist: "DJ Krupy",
    artistId,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    duration: 254,
    genre: "Electronic",
    isNFT: true,
    playCount: 94500,
    createdAt: "2024-04-01"
  },
  {
    id: "single-hyperion",
    songId: "single-hyperion",
    title: "Hyperion Gate",
    artist: "DJ Krupy",
    artistId,
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    duration: 220,
    genre: "Techno",
    isNFT: false,
    playCount: 42100,
    createdAt: "2024-02-15"
  }
];

export const getMockCollections = (artistId: string): NFTCollectionData[] => [
  {
    id: "col-solar-pulse-nfts",
    name: "Solar Pulse Premium Masters",
    coverUrl: "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png",
    volume: "12,450 TON",
    owners: 1240,
    items: 10,
    floorPrice: "12 TON",
    artistId
  },
  {
    id: "col-underground-vibes",
    name: "Underground Club Tape Vol. 1",
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
    volume: "4,120 TON",
    owners: 820,
    items: 8,
    floorPrice: "5.5 TON",
    artistId
  },
  {
    id: "col-krupy-visual-loops",
    name: "Krupy Generative Audio loops",
    coverUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop",
    volume: "2,350 TON",
    owners: 390,
    items: 20,
    floorPrice: "1.5 TON",
    artistId
  }
];

export const getMockPlaylists = (artistId: string): PlaylistData[] => [
  {
    id: "play-krupy-official",
    name: "This Is DJ Krupy",
    coverUrl: "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png",
    trackCount: 24,
    type: "Official",
    plays: 350000
  },
  {
    id: "play-krupy-curations",
    name: "Late Night Crypto Beats",
    coverUrl: "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=400&h=400&fit=crop",
    trackCount: 45,
    type: "Featured",
    plays: 124000
  },
  {
    id: "play-krupy-fans",
    name: "TonJam Jam Space Collaborative",
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
    trackCount: 128,
    type: "Collaborative",
    plays: 52000
  }
];

export const getMockPosts = (): ArtistPost[] => [
  {
    id: "post-1",
    type: "announcement",
    content: "🚨 BIG DROP INCOMING! My new single 'Solar Eclipse' NFT Auction goes live tonight at 20:00 UTC. Only 10 unique master rights editions. Get your TON wallets ready! 💎🎧 #TonJam #TON #NFT",
    isPinned: true,
    likes: 1240,
    comments: 185,
    shares: 42,
    timestamp: "2 hours ago"
  },
  {
    id: "post-2",
    type: "behind-the-scenes",
    content: "Working on some crazy synthesizer modular routing today in the studio. Creating that deep sub bass for the upcoming album. Let me know in the comments if you prefer the analog grit or clean digital FM sounds! 🎹🔊",
    mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=500&fit=crop",
    likes: 852,
    comments: 94,
    shares: 12,
    timestamp: "1 day ago"
  },
  {
    id: "post-3",
    type: "studio-update",
    content: "Quick render test of the generative 3D visual loops that will accompany my next NFT drop. Built completely using real-time canvas shading! Let's shake TON!",
    mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=500&fit=crop",
    likes: 641,
    comments: 42,
    shares: 8,
    timestamp: "3 days ago"
  }
];

export const getMockEvents = (artistId: string): ArtistEvent[] => [
  {
    id: "event-solar-pulse",
    type: "nft-drop",
    title: "Solar Pulse Genesis Auction",
    date: "July 12, 2026",
    time: "20:00 UTC",
    venue: "TonJam Launchpad",
    location: "Global Digital Stage",
    price: "Reserve: 50 TON"
  },
  {
    id: "event-tokyo-live",
    type: "concert",
    title: "Live at Neo-Tokyo Cyber Dome",
    date: "August 18, 2026",
    time: "22:00 JST",
    venue: "Cyber Dome",
    location: "Tokyo, Japan",
    ticketUrl: "https://example.com/tickets",
    price: "15 TON / Regular"
  },
  {
    id: "event-live-space",
    type: "live-space",
    title: "TON AMA & Listening Party",
    date: "July 24, 2026",
    time: "18:00 UTC",
    venue: "Telegram Voice Chat / JamSpace",
    location: "TonJam Channel",
    price: "Free Entry"
  }
];

export const getMockMutualFollowers = (): MutualFollower[] => [
  { id: "u-alex", name: "Alex TON", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" },
  { id: "u-julia", name: "Julia Crypto", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: "u-marcus", name: "Marcus Web3", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop" }
];

export const getTopSupporters = (): TopSupporter[] => [
  { id: "sup-1", name: "TON_Whale_99", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop", supportAmount: "1,520 TJ", streakDays: 45, badgeType: "Gold", rank: 1 },
  { id: "sup-2", name: "CryptoQueen", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", supportAmount: "1,150 TJ", streakDays: 32, badgeType: "Silver", rank: 2 },
  { id: "sup-3", name: "BeatCollector", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", supportAmount: "850 TJ", streakDays: 28, badgeType: "Bronze", rank: 3 },
  { id: "sup-4", name: "Alex_TON", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop", supportAmount: "450 TJ", streakDays: 14, badgeType: "Collector", rank: 4 }
];

export const getArtistMissions = (): ArtistMission[] => [
  { id: "mis-1", title: "Daily Listening Streak", description: "Listen to DJ Krupy for 5 consecutive days (min 30 seconds per day)", rewardTJ: 10, progress: 80, completed: false },
  { id: "mis-2", title: "Collector Milestone", description: "Own at least 2 music NFTs minted by DJ Krupy", rewardTJ: 50, progress: 100, completed: true },
  { id: "mis-3", title: "Social Promoter", description: "Share 3 of DJ Krupy's tracks on social feed", rewardTJ: 15, progress: 33, completed: false }
];

export const getMockAnalytics = (): ArtistAnalyticsData => {
  return {
    monthlyStreams: [
      { month: "Jan", streams: 120000 },
      { month: "Feb", streams: 135000 },
      { month: "Mar", streams: 150000 },
      { month: "Apr", streams: 165000 },
      { month: "May", streams: 180000 },
      { month: "Jun", streams: 184500 }
    ],
    followersGrowth: [
      { month: "Jan", count: 70000 },
      { month: "Feb", count: 73000 },
      { month: "Mar", count: 76500 },
      { month: "Apr", count: 79000 },
      { month: "May", count: 82000 },
      { month: "Jun", count: 85400 }
    ],
    nftSales: [
      { month: "Jan", sales: 45 },
      { month: "Feb", sales: 52 },
      { month: "Mar", sales: 68 },
      { month: "Apr", sales: 74 },
      { month: "May", sales: 88 },
      { month: "Jun", sales: 95 }
    ],
    revenue: [
      { month: "Jan", ton: 1200, tj: 4500 },
      { month: "Feb", ton: 1450, tj: 5200 },
      { month: "Mar", ton: 1890, tj: 6100 },
      { month: "Apr", ton: 2100, tj: 7300 },
      { month: "May", ton: 2840, tj: 8500 },
      { month: "Jun", ton: 3250, tj: 9200 }
    ],
    listeningCountries: [
      { country: "United States", streams: 1540000, percentage: 31.7, flag: "🇺🇸" },
      { country: "United Kingdom", streams: 850000, percentage: 17.5, flag: "🇬🇧" },
      { country: "Germany", streams: 580000, percentage: 11.9, flag: "🇩🇪" },
      { country: "Japan", streams: 420000, percentage: 8.6, flag: "🇯🇵" },
      { country: "Nigeria", streams: 310000, percentage: 6.4, flag: "🇳🇬" }
    ],
    topCities: [
      { city: "London", streams: 245000 },
      { city: "Berlin", streams: 182000 },
      { city: "New York", streams: 164000 },
      { city: "Tokyo", streams: 115000 },
      { city: "Lagos", streams: 98000 }
    ],
    mostStreamedSongs: [
      { title: "Solar Pulse (Original)", streams: 1850000, coverUrl: "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png" },
      { title: "Crypto Synth Dreams", streams: 1240000, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop" },
      { title: "Quantum Leap", streams: 850000, coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" }
    ],
    mostOwnedNFTs: [
      { title: "Solar Pulse Master #1", owners: 240, coverUrl: "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png" },
      { title: "Cyber Dream Premium Box", owners: 185, coverUrl: "https://i.postimg.cc/LhhtQkF0/drake.jpg" },
      { title: "Crypto Synth Gold #12", owners: 120, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop" }
    ]
  };
};

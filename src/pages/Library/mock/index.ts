import { LibraryTrack, LibraryArtist, LibraryAlbum, LibraryNFT, LibraryPlaylist, HistoryEvent, QueueItem, LibraryAnalytics } from '../types';

export const MOCK_LIBRARY_TRACKS: LibraryTrack[] = [
  {
    id: 'tr-1',
    title: 'Sovereign Nodes',
    artist: 'DJ Krupy',
    artistId: 'art-1',
    album: 'TON Genesis',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&h=300&q=80',
    duration: 198,
    plays: 145020,
    isLiked: true,
    isDownloaded: true,
    downloadSize: '6.2 MB',
    downloadQuality: 'Lossless',
    isOfflineAvailable: true,
    releaseDate: '2026-01-15'
  },
  {
    id: 'tr-2',
    title: 'Blockchain Romance',
    artist: 'Satoshi Sync',
    artistId: 'art-2',
    album: 'Distributed Hearts',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
    duration: 245,
    plays: 89400,
    isLiked: true,
    isDownloaded: true,
    downloadSize: '5.1 MB',
    downloadQuality: 'High',
    isOfflineAvailable: true,
    releaseDate: '2026-02-28'
  },
  {
    id: 'tr-3',
    title: 'Consensus Drift',
    artist: 'Hyperion',
    artistId: 'art-3',
    album: 'Ethereal Orbit',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&h=300&q=80',
    duration: 182,
    plays: 54100,
    isLiked: true,
    isDownloaded: false,
    isOfflineAvailable: false,
    releaseDate: '2025-11-04'
  },
  {
    id: 'tr-4',
    title: 'Liquid Royalty',
    artist: 'DJ Krupy',
    artistId: 'art-1',
    album: 'TON Genesis',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=300&h=300&q=80',
    duration: 211,
    plays: 121800,
    isLiked: true,
    isDownloaded: true,
    downloadSize: '4.8 MB',
    downloadQuality: 'Lossless',
    isOfflineAvailable: true,
    releaseDate: '2026-01-15'
  },
  {
    id: 'tr-5',
    title: 'Smart Contract Love',
    artist: 'Satoshi Sync',
    artistId: 'art-2',
    album: 'Distributed Hearts',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80',
    duration: 228,
    plays: 67300,
    isLiked: false,
    isDownloaded: true,
    downloadSize: '7.1 MB',
    downloadQuality: 'Dolby Atmos',
    isOfflineAvailable: true,
    releaseDate: '2026-02-28'
  },
  {
    id: 'tr-6',
    title: 'Gas Limit Overflow',
    artist: 'EVM Demigod',
    artistId: 'art-4',
    album: 'Mempool Melodies',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&h=300&q=80',
    duration: 164,
    plays: 43200,
    isLiked: false,
    isDownloaded: false,
    isOfflineAvailable: false,
    releaseDate: '2025-08-19'
  },
  {
    id: 'tr-7',
    title: 'Gram Gram Vibing',
    artist: 'Durov Collective',
    artistId: 'art-5',
    album: 'The Telegram Way',
    coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&h=300&q=80',
    duration: 191,
    plays: 289400,
    isLiked: true,
    isDownloaded: true,
    downloadSize: '5.9 MB',
    downloadQuality: 'High',
    isOfflineAvailable: true,
    releaseDate: '2026-03-01'
  }
];

export const MOCK_LIBRARY_ARTISTS: LibraryArtist[] = [
  {
    id: 'art-1',
    name: 'DJ Krupy',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    followersCount: 154200,
    isFollowed: true,
    verified: true,
    genres: ['Electronic', 'Synthwave', 'TON-House']
  },
  {
    id: 'art-2',
    name: 'Satoshi Sync',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    followersCount: 89400,
    isFollowed: true,
    verified: true,
    genres: ['Lo-Fi', 'Ambient', 'Bit-Hop']
  },
  {
    id: 'art-3',
    name: 'Hyperion',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&h=150&q=80',
    followersCount: 22400,
    isFollowed: false,
    verified: false,
    genres: ['Industrial', 'Techno']
  },
  {
    id: 'art-4',
    name: 'EVM Demigod',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    followersCount: 45100,
    isFollowed: true,
    verified: false,
    genres: ['Synthwave', 'Psy-Trance']
  },
  {
    id: 'art-5',
    name: 'Durov Collective',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    followersCount: 452900,
    isFollowed: true,
    verified: true,
    genres: ['Sovereign-Pop', 'Digital-Dance']
  }
];

export const MOCK_LIBRARY_ALBUMS: LibraryAlbum[] = [
  {
    id: 'alb-1',
    title: 'TON Genesis',
    artist: 'DJ Krupy',
    artistId: 'art-1',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&h=300&q=80',
    tracksCount: 12,
    releaseYear: 2026,
    isDownloaded: true,
    isLiked: true,
    downloadSize: '72 MB'
  },
  {
    id: 'alb-2',
    title: 'Distributed Hearts',
    artist: 'Satoshi Sync',
    artistId: 'art-2',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
    tracksCount: 8,
    releaseYear: 2026,
    isDownloaded: true,
    isLiked: true,
    downloadSize: '54 MB'
  },
  {
    id: 'alb-3',
    title: 'The Telegram Way',
    artist: 'Durov Collective',
    artistId: 'art-5',
    coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&h=300&q=80',
    tracksCount: 15,
    releaseYear: 2025,
    isDownloaded: false,
    isLiked: false
  }
];

export const MOCK_LIBRARY_NFTS: LibraryNFT[] = [
  {
    id: 'nft-1',
    tokenId: '#0042',
    title: 'Sovereign Nodes [Sovereign Golden Edition]',
    artist: 'DJ Krupy',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80',
    collectionName: 'TonJam Golden Artifacts',
    floorPriceTon: 145,
    royaltyPercent: 12.5,
    rarity: 'Legendary',
    ownerAddress: 'UQAs9vW_3k7_pP3...',
    musicFileUrl: 'https://tonjam.io/nft-1.mp3'
  },
  {
    id: 'nft-2',
    tokenId: '#1105',
    title: 'Blockchain Romance [Retro Beats Remix]',
    artist: 'Satoshi Sync',
    coverUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=300&h=300&q=80',
    collectionName: 'Satoshi Sync Genesis Artifacts',
    floorPriceTon: 32,
    royaltyPercent: 8,
    rarity: 'Rare',
    ownerAddress: 'UQAs9vW_3k7_pP3...',
    musicFileUrl: 'https://tonjam.io/nft-2.mp3'
  },
  {
    id: 'nft-3',
    tokenId: '#0890',
    title: 'Gram Gram Vibing [Original Artifact]',
    artist: 'Durov Collective',
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=300&h=300&q=80',
    collectionName: 'The Telegram Way Collectibles',
    floorPriceTon: 210,
    royaltyPercent: 15,
    rarity: 'Epic',
    ownerAddress: 'UQAs9vW_3k7_pP3...',
    musicFileUrl: 'https://tonjam.io/nft-3.mp3'
  }
];

export const MOCK_LIBRARY_PLAYLISTS: LibraryPlaylist[] = [
  {
    id: 'pl-1',
    title: 'Midnight Consensus Beats',
    creator: 'You',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=300&h=300&q=80',
    tracksCount: 24,
    isPinned: true,
    isDownloaded: true,
    isCustom: true
  },
  {
    id: 'pl-2',
    title: 'Aura of Durov',
    creator: 'TonJam Curators',
    coverUrl: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=300&h=300&q=80',
    tracksCount: 50,
    isPinned: true,
    isDownloaded: false,
    isCustom: false
  },
  {
    id: 'pl-3',
    title: 'Liquidity Pool Lounge',
    creator: 'You',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300&q=80',
    tracksCount: 14,
    isPinned: false,
    isDownloaded: true,
    isCustom: true
  }
];

export const MOCK_HISTORY_EVENTS: HistoryEvent[] = [
  // Today
  {
    id: 'he-1',
    trackId: 'tr-1',
    title: 'Sovereign Nodes',
    artist: 'DJ Krupy',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&h=100&q=80',
    playedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    duration: 198
  },
  {
    id: 'he-2',
    trackId: 'tr-2',
    title: 'Blockchain Romance',
    artist: 'Satoshi Sync',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=100&h=100&q=80',
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    duration: 245
  },
  // Yesterday
  {
    id: 'he-3',
    trackId: 'tr-7',
    title: 'Gram Gram Vibing',
    artist: 'Durov Collective',
    coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&h=100&q=80',
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
    duration: 191
  },
  {
    id: 'he-4',
    trackId: 'tr-4',
    title: 'Liquid Royalty',
    artist: 'DJ Krupy',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=100&h=100&q=80',
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    duration: 211
  },
  // This Week
  {
    id: 'he-5',
    trackId: 'tr-3',
    title: 'Consensus Drift',
    artist: 'Hyperion',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=100&h=100&q=80',
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    duration: 182
  }
];

export const MOCK_QUEUE: QueueItem[] = [
  {
    id: 'qi-0',
    trackId: 'tr-1',
    title: 'Sovereign Nodes',
    artist: 'DJ Krupy',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&h=100&q=80',
    duration: 198,
    addedBy: 'user'
  },
  {
    id: 'qi-1',
    trackId: 'tr-3',
    title: 'Consensus Drift',
    artist: 'Hyperion',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=100&h=100&q=80',
    duration: 182,
    addedBy: 'user'
  },
  {
    id: 'qi-2',
    trackId: 'tr-5',
    title: 'Smart Contract Love',
    artist: 'Satoshi Sync',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&h=100&q=80',
    duration: 228,
    addedBy: 'autopilot'
  },
  {
    id: 'qi-3',
    trackId: 'tr-7',
    title: 'Gram Gram Vibing',
    artist: 'Durov Collective',
    coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&h=100&q=80',
    duration: 191,
    addedBy: 'next'
  }
];

export const MOCK_LIBRARY_ANALYTICS: LibraryAnalytics = {
  weeklyHours: [
    { day: 'Mon', hours: 2.4 },
    { day: 'Tue', hours: 3.1 },
    { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 4.2 },
    { day: 'Fri', hours: 2.9 },
    { day: 'Sat', hours: 5.6 },
    { day: 'Sun', hours: 4.8 }
  ],
  favoriteGenres: [
    { genre: 'Sovereign House', percentage: 42, count: 28 },
    { genre: 'Lo-Fi Bit-Hop', percentage: 28, count: 19 },
    { genre: 'Psy-Trance', percentage: 18, count: 12 },
    { genre: 'Ambient Sync', percentage: 12, count: 8 }
  ],
  favoriteArtists: [
    { name: 'DJ Krupy', playCount: 84, avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Satoshi Sync', playCount: 52, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Durov Collective', playCount: 41, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' }
  ],
  topSongs: [
    { title: 'Sovereign Nodes', artist: 'DJ Krupy', plays: 32, coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&h=100&q=80' },
    { title: 'Blockchain Romance', artist: 'Satoshi Sync', plays: 24, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=100&h=100&q=80' },
    { title: 'Gram Gram Vibing', artist: 'Durov Collective', plays: 19, coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&h=100&q=80' }
  ],
  listeningStreakDays: 14,
  totalListeningHours: 128.5
};

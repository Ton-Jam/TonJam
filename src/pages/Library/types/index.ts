export interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  plays?: number;
  playCount?: number;
  streams?: number;
  isLiked: boolean;
  isDownloaded: boolean;
  downloadSize?: string; // e.g., "4.5 MB"
  downloadQuality?: 'High' | 'Lossless' | 'Dolby Atmos';
  isOfflineAvailable: boolean;
  releaseDate?: string;
}

export interface LibraryArtist {
  id: string;
  name: string;
  avatarUrl: string;
  followersCount: number;
  isFollowed: boolean;
  verified: boolean;
  genres: string[];
}

export interface LibraryAlbum {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  tracksCount: number;
  releaseYear: number;
  isDownloaded: boolean;
  isLiked: boolean;
  downloadSize?: string;
}

export interface LibraryNFT {
  id: string;
  tokenId: string;
  title: string;
  artist: string;
  coverUrl: string;
  collectionName: string;
  floorPriceTon: number;
  royaltyPercent: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  ownerAddress: string;
  musicFileUrl: string;
}

export interface LibraryPlaylist {
  id: string;
  title: string;
  creator: string;
  coverUrl: string;
  tracksCount: number;
  isPinned: boolean;
  isDownloaded: boolean;
  isCustom?: boolean;
}

export interface HistoryEvent {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  coverUrl: string;
  playedAt: string; // ISO String
  duration: number;
}

export interface QueueItem {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: number;
  addedBy: 'user' | 'autopilot' | 'next';
}

export interface LibraryAnalytics {
  weeklyHours: { day: string; hours: number }[];
  favoriteGenres: { genre: string; percentage: number; count: number }[];
  favoriteArtists: { name: string; playCount: number; avatarUrl: string }[];
  topSongs: { title: string; artist: string; plays: number; coverUrl: string }[];
  listeningStreakDays: number;
  totalListeningHours: number;
}

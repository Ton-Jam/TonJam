import { LibraryTrack, LibraryArtist, LibraryAlbum, LibraryNFT, LibraryPlaylist, HistoryEvent, QueueItem, LibraryAnalytics } from '../types';

export const MOCK_LIBRARY_TRACKS: LibraryTrack[] = [];

export const MOCK_LIBRARY_ARTISTS: LibraryArtist[] = [];

export const MOCK_LIBRARY_ALBUMS: LibraryAlbum[] = [];

export const MOCK_LIBRARY_NFTS: LibraryNFT[] = [];

export const MOCK_LIBRARY_PLAYLISTS: LibraryPlaylist[] = [];

export const MOCK_HISTORY_EVENTS: HistoryEvent[] = [];

export const MOCK_QUEUE: QueueItem[] = [];

export const MOCK_LIBRARY_ANALYTICS: LibraryAnalytics = {
  weeklyHours: [],
  favoriteGenres: [],
  favoriteArtists: [],
  topSongs: [],
  listeningStreakDays: 0,
  totalListeningHours: 0
};

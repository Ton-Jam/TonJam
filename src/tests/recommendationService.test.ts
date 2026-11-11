import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  rankRecommendedTracks,
  rankRecommendedNFTs,
  rankRecommendedArtists,
  getSimilarTracks,
  getCachedRecommendations,
  setCachedRecommendations,
  invalidateRecommendationCache,
} from '@/services/recommendationService';
import { Track, NFTItem, Artist } from '@/types';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-123' } },
  handleFirestoreError: vi.fn(),
  OperationType: { READ: 'READ', WRITE: 'WRITE', LIST: 'LIST' },
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(),
  increment: vi.fn(),
  writeBatch: vi.fn(),
}));

describe('Smart Discovery Recommendation Engine', () => {
  const createMockTrack = (overrides: Partial<Track>): Track => ({
    id: 'track-default',
    songId: 'song-default',
    title: 'Default Track',
    artist: 'Default Artist',
    artistId: 'artist-default',
    genre: 'Electronic',
    bpm: 120,
    mood: 'Chill',
    playCount: 100,
    likes: 10,
    audioUrl: 'https://example.com/audio.mp3',
    coverUrl: 'https://example.com/cover.jpg',
    duration: 180,
    isNFT: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const mockTracks: Track[] = [
    createMockTrack({
      id: 'track-1',
      songId: 'song-1',
      title: 'Solana Sunrise',
      artist: 'DJ Ton',
      artistId: 'artist-1',
      genre: 'Electronic',
      bpm: 128,
      mood: 'Uplifting',
      playCount: 1500,
      likes: 250,
      audioUrl: 'https://example.com/1.mp3',
      duration: 180,
    }),
    createMockTrack({
      id: 'track-2',
      songId: 'song-2',
      title: 'Lagos Night',
      artist: 'Burna Vibe',
      artistId: 'artist-2',
      genre: 'Afrobeats',
      bpm: 105,
      mood: 'Groovy',
      playCount: 3000,
      likes: 600,
      audioUrl: 'https://example.com/2.mp3',
      duration: 210,
    }),
    createMockTrack({
      id: 'track-3',
      songId: 'song-3',
      title: 'Cyber Pulse',
      artist: 'DJ Ton',
      artistId: 'artist-1',
      genre: 'Electronic',
      bpm: 130,
      mood: 'Energetic',
      playCount: 800,
      likes: 120,
      audioUrl: 'https://example.com/3.mp3',
      duration: 195,
    }),
    createMockTrack({
      id: 'track-4',
      songId: 'song-4',
      title: 'Neon Odyssey',
      artist: 'DJ Ton',
      artistId: 'artist-1',
      genre: 'Electronic',
      bpm: 132,
      mood: 'Hypnotic',
      playCount: 400,
      likes: 80,
      audioUrl: 'https://example.com/4.mp3',
      duration: 200,
    }),
    createMockTrack({
      id: 'track-5',
      songId: 'song-5',
      title: 'Grammy Dreams',
      artist: 'Burna Vibe',
      artistId: 'artist-2',
      genre: 'Afrobeats',
      bpm: 104,
      mood: 'Chill',
      playCount: 1200,
      likes: 310,
      audioUrl: 'https://example.com/5.mp3',
      duration: 220,
    }),
    createMockTrack({
      id: 'track-6',
      songId: 'song-6',
      title: 'Desert Echoes',
      artist: 'Sahara Beats',
      artistId: 'artist-3',
      genre: 'World',
      bpm: 110,
      mood: 'Mystic',
      playCount: 950,
      likes: 190,
      audioUrl: 'https://example.com/6.mp3',
      duration: 240,
    }),
  ];

  beforeEach(() => {
    invalidateRecommendationCache();
  });

  describe('Track Recommendations (rankRecommendedTracks)', () => {
    it('ranks tracks based on followed artists and preferred genres', () => {
      const userContext = {
        userId: 'test-user',
        followedArtistIds: ['artist-2'],
        preferredGenres: ['Afrobeats'],
        likedTrackIds: ['track-2'],
      };

      const ranked = rankRecommendedTracks(mockTracks, userContext);
      expect(ranked.length).toBeGreaterThan(0);
      expect(['track-2', 'track-5']).toContain(ranked[0].id);
      expect(ranked[0].artist).toBe('Burna Vibe');
    });

    it('enforces artist diversity constraints (default max 2 tracks per artist)', () => {
      const userContext = {
        userId: 'test-user',
        followedArtistIds: ['artist-1'],
      };

      const ranked = rankRecommendedTracks(mockTracks, userContext, { diversityMaxPerArtist: 2 });
      const djTonTracks = ranked.filter((t) => t.artist === 'DJ Ton');
      expect(djTonTracks.length).toBeLessThanOrEqual(2);
    });

    it('filters out hidden tracks and explicitly excluded IDs', () => {
      const userContext = {
        userId: 'test-user',
        hiddenTrackIds: ['track-2'],
      };

      const ranked = rankRecommendedTracks(mockTracks, userContext, {
        excludeIds: ['track-1'],
      });

      const trackIds = ranked.map((t) => t.id);
      expect(trackIds).not.toContain('track-2');
      expect(trackIds).not.toContain('track-1');
    });

    it('handles cold-start users with trending popularity ranking', () => {
      const ranked = rankRecommendedTracks(mockTracks, {});
      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked[0].playCount).toBeGreaterThanOrEqual(1000);
      expect(ranked[0].recommendationReason).toBeDefined();
    });
  });

  const createMockNFT = (overrides: Partial<NFTItem>): NFTItem => ({
    id: 'nft-default',
    title: 'Default NFT',
    artist: 'Default Artist',
    artistId: 'artist-default',
    artistVerified: true,
    price: '1.0',
    views: 50,
    audioUrl: 'https://example.com/audio.mp3',
    coverUrl: 'https://example.com/cover.jpg',
    imageUrl: 'https://example.com/cover.jpg',
    trackId: 'track-default',
    owner: 'owner-default',
    creator: 'creator-default',
    edition: '1 of 100',
    ...overrides,
  });

  describe('NFT Recommendations (rankRecommendedNFTs)', () => {
    const mockNFTs: NFTItem[] = [
      createMockNFT({
        id: 'nft-1',
        title: 'Genesis Vinyl #1',
        artist: 'DJ Ton',
        artistId: 'artist-1',
        artistVerified: true,
        price: '1.5',
        views: 450,
        edition: '1 of 50',
      }),
      createMockNFT({
        id: 'nft-2',
        title: 'Lagos Gold Record',
        artist: 'Burna Vibe',
        artistId: 'artist-2',
        artistVerified: false,
        price: '150.0',
        views: 90,
        edition: '1 of 5',
      }),
      createMockNFT({
        id: 'nft-3',
        title: 'Cyber Anthem Rare',
        artist: 'DJ Ton',
        artistId: 'artist-1',
        artistVerified: true,
        price: '0.8',
        views: 220,
        edition: '1 of 100',
      }),
    ];

    it('prioritizes verified artists, accessible price points, and followed creators', () => {
      const userContext = {
        userId: 'test-user',
        followedArtistIds: ['artist-1'],
        preferredGenres: ['Electronic'],
      };

      const ranked = rankRecommendedNFTs(mockNFTs, userContext);
      expect(ranked.length).toBe(3);
      expect(ranked[0].artist).toBe('DJ Ton');
      expect(ranked[0].artistVerified).toBe(true);
    });

    it('filters out hidden NFTs', () => {
      const userContext = {
        userId: 'test-user',
        hiddenNftIds: ['nft-1'],
      };

      const ranked = rankRecommendedNFTs(mockNFTs, userContext);
      const ids = ranked.map((n) => n.id);
      expect(ids).not.toContain('nft-1');
    });
  });

  describe('Artist Recommendations (rankRecommendedArtists)', () => {
    const mockArtists: Artist[] = [
      {
        uid: 'artist-1',
        name: 'DJ Ton',
        username: 'djton',
        avatarUrl: 'https://example.com/djton.jpg',
        verified: true,
        genre: 'Electronic',
        followers: 5000,
      },
      {
        uid: 'artist-2',
        name: 'Burna Vibe',
        username: 'burnavibe',
        avatarUrl: 'https://example.com/burnavibe.jpg',
        verified: true,
        genre: 'Afrobeats',
        followers: 12000,
      },
      {
        uid: 'artist-3',
        name: 'Sahara Beats',
        username: 'saharabeats',
        avatarUrl: 'https://example.com/sahara.jpg',
        verified: false,
        genre: 'World',
        followers: 800,
      },
    ];

    it('boosts artists in matching genres that the user has not followed yet', () => {
      const userContext = {
        userId: 'test-user',
        followedArtistIds: ['artist-1'],
        preferredGenres: ['Afrobeats'],
      };

      const ranked = rankRecommendedArtists(mockArtists, userContext);
      expect(ranked[0].uid).toBe('artist-2');
    });

    it('filters out hidden artists', () => {
      const userContext = {
        userId: 'test-user',
        hiddenArtistIds: ['artist-2'],
      };

      const ranked = rankRecommendedArtists(mockArtists, userContext);
      const uids = ranked.map((a) => a.uid);
      expect(uids).not.toContain('artist-2');
    });
  });

  describe('Similar Tracks (getSimilarTracks)', () => {
    it('finds tracks with matching genre, close BPM (±12), or matching mood', () => {
      const targetTrack = mockTracks[0];
      const similar = getSimilarTracks(targetTrack, mockTracks, { limit: 3 });

      expect(similar.length).toBeGreaterThan(0);
      expect(similar.some((t) => t.id === targetTrack.id)).toBe(false);
      expect(similar[0].genre).toBe('Electronic');
    });
  });

  describe('Cache Mechanism', () => {
    it('sets and retrieves cached recommendations within TTL', () => {
      const key = 'test_rec_key';
      const sample = [{ id: '1' }];

      setCachedRecommendations(key, sample, 60000);
      const retrieved = getCachedRecommendations(key);
      expect(retrieved).toEqual(sample);
    });

    it('invalidates cache correctly', () => {
      const key = 'test_rec_key';
      setCachedRecommendations(key, [{ id: '1' }], 60000);
      invalidateRecommendationCache();
      expect(getCachedRecommendations(key)).toBeNull();
    });
  });
});

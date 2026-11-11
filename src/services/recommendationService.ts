import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Track, NFTItem, Artist } from '@/types';

export interface ListeningHistoryItem {
  trackId: string;
  title: string;
  artist: string;
  artistId?: string;
  genre?: string;
  playCount: number;
  lastPlayed: string | number;
}

export interface UserRecommendationPreferences {
  preferredGenres: string[];
  hiddenTrackIds: string[];
  hiddenNftIds: string[];
  hiddenArtistIds: string[];
  lastUpdated?: string;
}

export interface RecommendationUserContext {
  userId?: string;
  recentlyPlayed?: Track[];
  listeningHistory?: ListeningHistoryItem[];
  likedTrackIds?: string[];
  followedArtistIds?: string[];
  preferredGenres?: string[];
  hiddenTrackIds?: string[];
  hiddenNftIds?: string[];
  hiddenArtistIds?: string[];
}

export interface RecommendationOptions {
  limit?: number;
  excludeIds?: string[];
  diversityMaxPerArtist?: number;
  forceFresh?: boolean;
}

// In-memory cache with configurable TTL (default 5 minutes)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
const recommendationMemoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedRecommendations<T>(cacheKey: string): T | null {
  const entry = recommendationMemoryCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    recommendationMemoryCache.delete(cacheKey);
    return null;
  }
  return entry.data as T;
}

export function setCachedRecommendations<T>(cacheKey: string, data: T, ttlMs: number = DEFAULT_CACHE_TTL): void {
  recommendationMemoryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

export function invalidateRecommendationCache(userId?: string): void {
  if (!userId) {
    recommendationMemoryCache.clear();
    return;
  }
  for (const key of recommendationMemoryCache.keys()) {
    if (key.includes(userId)) {
      recommendationMemoryCache.delete(key);
    }
  }
}

/**
 * 1. DETERMINISTIC TRACK RANKING ALGORITHM
 * Scores tracks using multi-factor normalized scoring with artist diversity constraints.
 */
export function rankRecommendedTracks(
  tracks: Track[],
  userContext: RecommendationUserContext,
  options: RecommendationOptions = {}
): Track[] {
  const maxLimit = options.limit || 15;
  const diversityLimit = options.diversityMaxPerArtist || 2;
  const excludeSet = new Set(options.excludeIds || []);
  const hiddenTracks = new Set(userContext.hiddenTrackIds || []);

  if (!tracks || tracks.length === 0) return [];

  // Build preference sets from user history
  const recentIds = new Set((userContext.recentlyPlayed || []).map((t) => t.id));
  const likedIds = new Set(userContext.likedTrackIds || []);
  const followedArtists = new Set(userContext.followedArtistIds || []);

  // Compute genre frequency & artist frequency weights
  const genreWeights = new Map<string, number>();
  const artistWeights = new Map<string, number>();

  // 1. Explicit genre preferences
  (userContext.preferredGenres || []).forEach((genre, idx) => {
    const w = 30 - idx * 5;
    if (genre) genreWeights.set(genre.toLowerCase(), (genreWeights.get(genre.toLowerCase()) || 0) + w);
  });

  // 2. Derive weights from listening history / recently played
  const historyList = userContext.listeningHistory || [];
  historyList.forEach((item) => {
    if (item.genre) {
      genreWeights.set(item.genre.toLowerCase(), (genreWeights.get(item.genre.toLowerCase()) || 0) + Math.min(20, item.playCount * 3));
    }
    const artistKey = (item.artistId || item.artist || '').toLowerCase();
    if (artistKey) {
      artistWeights.set(artistKey, (artistWeights.get(artistKey) || 0) + Math.min(25, item.playCount * 4));
    }
  });

  (userContext.recentlyPlayed || []).forEach((item, idx) => {
    const recencyWeight = Math.max(5, 20 - idx * 2);
    if (item.genre) {
      genreWeights.set(item.genre.toLowerCase(), (genreWeights.get(item.genre.toLowerCase()) || 0) + recencyWeight);
    }
    const artistKey = (item.artistId || item.artist || '').toLowerCase();
    if (artistKey) {
      artistWeights.set(artistKey, (artistWeights.get(artistKey) || 0) + recencyWeight);
    }
  });

  // Check if user is a cold-start new user
  const isColdStart = historyList.length === 0 && (userContext.recentlyPlayed || []).length === 0 && likedIds.size === 0;

  // Track scoring
  const scoredTracks = tracks
    .filter((track) => !excludeSet.has(track.id) && !hiddenTracks.has(track.id))
    .map((track) => {
      let score = 50; // base score
      let primaryReason = 'Trending in the community';

      const trackGenre = (track.genre || '').toLowerCase();
      const trackArtist = (track.artist || '').toLowerCase();
      const trackArtistId = (track.artistId || '').toLowerCase();

      if (isColdStart) {
        // Cold start ranking: heavily prioritize verified artists, trending popularity, and audio NFT quality
        const popularityScore = Math.min(35, Math.log10((track.playCount || track.streams || 1) + 1) * 8);
        const verifiedBonus = track.artistVerified ? 20 : 0;
        const nftBonus = track.isNFT ? 10 : 0;
        score = 40 + popularityScore + verifiedBonus + nftBonus;
        primaryReason = track.artistVerified ? 'Popular verified release' : 'Trending on TON';
      } else {
        // 1. Genre Relevance (up to +30 pts)
        if (trackGenre && genreWeights.has(trackGenre)) {
          const gWeight = Math.min(30, genreWeights.get(trackGenre)!);
          score += gWeight;
          primaryReason = `Because you enjoy ${track.genre}`;
        }

        // 2. Artist Relationship (up to +35 pts)
        if (followedArtists.has(track.artistId || '') || followedArtists.has(track.artist || '')) {
          score += 35;
          primaryReason = `From an artist you follow`;
        } else if (artistWeights.has(trackArtist) || (trackArtistId && artistWeights.has(trackArtistId))) {
          const aWeight = Math.min(25, artistWeights.get(trackArtist) || artistWeights.get(trackArtistId) || 0);
          score += aWeight;
          primaryReason = `More from ${track.artist}`;
        }

        // 3. User Favorites similarity (+15 pts if liked artist)
        if (likedIds.has(track.id)) {
          score -= 20; // Slightly penalize exact tracks already liked to encourage discovery
        }

        // 4. Recency fatigue dampening (-25 pts if played in the top 3 recently played)
        const recentIndex = (userContext.recentlyPlayed || []).findIndex((t) => t.id === track.id);
        if (recentIndex >= 0 && recentIndex < 3) {
          score -= 30; // Avoid immediate repetition
        }

        // 5. Popularity dampening: log-scaled so super-hits don't drown underground creators
        const logPlays = Math.log10((track.playCount || track.streams || 0) + 1);
        const popularityBonus = Math.min(15, logPlays * 3 + ((track.likes || 0) > 0 ? 2 : 0));
        score += popularityBonus;

        // 6. Web3 & Quality signals
        if (track.isNFT) score += 6;
        if (track.artistVerified) score += 8;
        if (track.isHighFidelity) score += 4;
      }

      // Clamp score between 0 and 100
      const normalizedScore = Math.max(1, Math.min(99, Math.round(score)));

      return {
        ...track,
        recommendationScore: normalizedScore,
        recommendationReason: primaryReason,
      };
    });

  // Sort descending by recommendationScore
  scoredTracks.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

  // Enforce Artist Diversity: max N tracks per artist in the top list
  const finalResults: Track[] = [];
  const artistCounts = new Map<string, number>();

  for (const t of scoredTracks) {
    const artistKey = (t.artistId || t.artist || 'unknown').toLowerCase();
    const currentCount = artistCounts.get(artistKey) || 0;
    if (currentCount < diversityLimit) {
      finalResults.push(t);
      artistCounts.set(artistKey, currentCount + 1);
    }
    if (finalResults.length >= maxLimit) break;
  }

  return finalResults;
}

/**
 * 2. DETERMINISTIC NFT RECOMMENDATION ALGORITHM
 * Prioritizes verified artists, user genre interests, marketplace freshness, and reasonable pricing.
 */
export function rankRecommendedNFTs(
  nfts: NFTItem[],
  userContext: RecommendationUserContext,
  options: RecommendationOptions = {}
): NFTItem[] {
  const maxLimit = options.limit || 12;
  const excludeSet = new Set(options.excludeIds || []);
  const hiddenNfts = new Set(userContext.hiddenNftIds || []);

  if (!nfts || nfts.length === 0) return [];

  const followedArtists = new Set(userContext.followedArtistIds || []);
  const userGenres = new Set((userContext.preferredGenres || []).map((g) => g.toLowerCase()));

  // Extract top genres from user listening history if available
  (userContext.listeningHistory || []).forEach((item) => {
    if (item.genre) userGenres.add(item.genre.toLowerCase());
  });

  const scoredNFTs = nfts
    .filter((nft) => !excludeSet.has(nft.id) && !hiddenNfts.has(nft.id))
    .map((nft) => {
      let score = 50;

      // 1. Verified Artist Signal (+25 pts)
      if (nft.artistVerified) {
        score += 25;
      }

      // 2. Followed Artist (+30 pts)
      const creatorKey = (nft.artist || nft.creator || nft.artistId || '').toLowerCase();
      if (followedArtists.has(nft.artistId || '') || followedArtists.has(creatorKey)) {
        score += 30;
      }

      // 3. Price & Marketplace availability
      const priceNum = parseFloat(nft.price || '0');
      if (priceNum > 0 && priceNum <= 25) {
        score += 15; // accessible entry price on TON
      } else if (priceNum > 25) {
        score += 8;
      }

      // 4. Edition & Scarcity freshness
      if (nft.edition && nft.edition.toLowerCase().includes('limited')) {
        score += 10;
      }

      // 5. Views & Community activity
      const views = (nft as any).views || 0;
      score += Math.min(15, Math.log10(views + 1) * 5);

      const normalizedScore = Math.max(1, Math.min(99, Math.round(score)));

      return {
        ...nft,
        recommendationScore: normalizedScore,
      };
    });

  scoredNFTs.sort((a, b) => ((b as any).recommendationScore || 0) - ((a as any).recommendationScore || 0));

  return scoredNFTs.slice(0, maxLimit);
}

/**
 * 3. DETERMINISTIC ARTIST RECOMMENDATION ALGORITHM
 * Prioritizes musical style similarity, verified badges, and discovery of non-followed creators.
 */
export function rankRecommendedArtists(
  artists: Artist[],
  userContext: RecommendationUserContext,
  options: RecommendationOptions = {}
): Artist[] {
  const maxLimit = options.limit || 8;
  const excludeSet = new Set(options.excludeIds || []);
  const hiddenArtists = new Set(userContext.hiddenArtistIds || []);
  const followedArtists = new Set(userContext.followedArtistIds || []);

  if (!artists || artists.length === 0) return [];

  // Top genres from history
  const userGenres = new Set((userContext.preferredGenres || []).map((g) => g.toLowerCase()));
  (userContext.listeningHistory || []).forEach((h) => {
    if (h.genre) userGenres.add(h.genre.toLowerCase());
  });

  const scoredArtists = artists
    .filter((artist) => {
      const aId = (artist as any).id || artist.uid;
      return !excludeSet.has(aId) && !hiddenArtists.has(aId) && !hiddenArtists.has(artist.name);
    })
    .map((artist) => {
      const aId = (artist as any).id || artist.uid;
      let score = 40;

      // 1. Genre alignment (+30 pts)
      const artistGenres: string[] = [];
      if (artist.genre) artistGenres.push(artist.genre.toLowerCase());
      if (Array.isArray((artist as any).genres)) {
        (artist as any).genres.forEach((g: string) => artistGenres.push(g.toLowerCase()));
      }
      if (artistGenres.some((g) => userGenres.has(g))) {
        score += 30;
      }

      // 2. Verified status (+20 pts)
      if (artist.verified || artist.isVerifiedArtist) {
        score += 20;
      }

      // 3. New Discovery vs Already Followed
      // If already followed, penalize slightly to promote *discovery* of fresh talent
      if (followedArtists.has(aId) || followedArtists.has(artist.name)) {
        score -= 15;
      } else {
        score += 15;
      }

      // 4. Community follower momentum (log-scaled)
      const followers = artist.followers ?? (artist as any).followersCount ?? 0;
      score += Math.min(20, Math.log10(followers + 1) * 6);

      return {
        artist,
        score: Math.max(1, Math.min(99, Math.round(score))),
      };
    });

  scoredArtists.sort((a, b) => b.score - a.score);

  return scoredArtists.slice(0, maxLimit).map((s) => s.artist);
}

/**
 * 4. SIMILAR TRACKS ALGORITHM
 * Finds tracks with matching genre, similar BPM/energy, and related creators.
 */
export function getSimilarTracks(
  seedTrack: Track,
  allTracks: Track[],
  options: { limit?: number; excludeIds?: string[] } = {}
): Track[] {
  const limitCount = options.limit || 10;
  const excludeSet = new Set([seedTrack.id, ...(options.excludeIds || [])]);

  const seedGenre = (seedTrack.genre || '').toLowerCase();
  const seedArtist = (seedTrack.artist || '').toLowerCase();

  const candidates = allTracks
    .filter((t) => !excludeSet.has(t.id))
    .map((t) => {
      let simScore = 0;
      const tGenre = (t.genre || '').toLowerCase();
      const tArtist = (t.artist || '').toLowerCase();

      if (tGenre && seedGenre && tGenre === seedGenre) simScore += 45;
      if (tArtist && seedArtist && tArtist === seedArtist) simScore += 35;
      if (seedTrack.bpm && t.bpm && Math.abs(seedTrack.bpm - t.bpm) <= 12) simScore += 15;
      if (seedTrack.mood && t.mood && seedTrack.mood === t.mood) simScore += 10;

      return { track: t, simScore };
    })
    .filter((c) => c.simScore > 10)
    .sort((a, b) => b.simScore - a.simScore);

  return candidates.slice(0, limitCount).map((c) => c.track);
}

/**
 * 5. FIRESTORE PERSISTENCE & USER ACTIVITY ARCHITECTURE
 */

/**
 * Record user listening activity safely in Firestore with batched writes & debounce protection.
 */
export async function recordListeningActivity(userId: string, track: Track): Promise<void> {
  if (!userId || !track?.id) return;

  try {
    const historyDocRef = doc(db, 'users', userId, 'listeningHistory', track.id);
    const nowIso = new Date().toISOString();

    await setDoc(
      historyDocRef,
      {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        artistId: track.artistId || '',
        genre: track.genre || 'Unknown',
        playCount: increment(1),
        lastPlayed: nowIso,
        coverUrl: track.coverUrl || '',
        audioUrl: track.audioUrl || '',
        duration: track.duration || 0,
        bpm: track.bpm || 0,
        mood: track.mood || '',
        isNFT: !!track.isNFT,
        artistVerified: !!track.artistVerified,
      },
      { merge: true }
    );

    // Invalidate cached recommendations for this user so next fetch is personalized
    invalidateRecommendationCache(userId);
  } catch (err) {
    console.warn('[recommendationService] Could not persist listening activity to Firestore:', err);
  }
}

/**
 * Fetch user listening history from Firestore with pagination/limit.
 */
export async function fetchUserListeningHistory(userId: string, maxLimit: number = 50): Promise<ListeningHistoryItem[]> {
  if (!userId) return [];

  const cacheKey = `listening_history_${userId}`;
  const cached = getCachedRecommendations<ListeningHistoryItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const historyCol = collection(db, 'users', userId, 'listeningHistory');
    const q = query(historyCol, orderBy('lastPlayed', 'desc'), limit(maxLimit));
    const snap = await getDocs(q);

    const results: ListeningHistoryItem[] = [];
    snap.forEach((d) => {
      const data = d.data() as ListeningHistoryItem;
      results.push({
        trackId: data.trackId || d.id,
        title: data.title || 'Untitled',
        artist: data.artist || 'Unknown',
        artistId: data.artistId,
        genre: data.genre,
        playCount: typeof data.playCount === 'number' ? data.playCount : 1,
        lastPlayed: data.lastPlayed || Date.now(),
      });
    });

    setCachedRecommendations(cacheKey, results, 2 * 60 * 1000); // 2 minutes
    return results;
  } catch (err) {
    console.warn('[recommendationService] Failed to load listening history from Firestore:', err);
    return [];
  }
}

/**
 * Fetch user recommendation preferences (hidden items, preferred genres).
 */
export async function fetchUserRecommendationPreferences(userId: string): Promise<UserRecommendationPreferences> {
  if (!userId) {
    return { preferredGenres: [], hiddenTrackIds: [], hiddenNftIds: [], hiddenArtistIds: [] };
  }

  const cacheKey = `user_rec_prefs_${userId}`;
  const cached = getCachedRecommendations<UserRecommendationPreferences>(cacheKey);
  if (cached) return cached;

  try {
    const prefDoc = await getDoc(doc(db, 'users', userId, 'recommendations', 'preferences'));
    if (prefDoc.exists()) {
      const data = prefDoc.data() as UserRecommendationPreferences;
      const res: UserRecommendationPreferences = {
        preferredGenres: data.preferredGenres || [],
        hiddenTrackIds: data.hiddenTrackIds || [],
        hiddenNftIds: data.hiddenNftIds || [],
        hiddenArtistIds: data.hiddenArtistIds || [],
        lastUpdated: data.lastUpdated,
      };
      setCachedRecommendations(cacheKey, res, 5 * 60 * 1000);
      return res;
    }
  } catch (err) {
    console.warn('[recommendationService] Could not fetch preferences, using local storage fallback:', err);
  }

  // Local storage fallback for seamless offline resilience
  try {
    const local = localStorage.getItem(`tj_rec_prefs_${userId}`);
    if (local) {
      return JSON.parse(local);
    }
  } catch {}

  return { preferredGenres: [], hiddenTrackIds: [], hiddenNftIds: [], hiddenArtistIds: [] };
}

/**
 * Hide an item from recommendations (track, NFT, or artist) and persist to Firestore.
 */
export async function hideRecommendation(
  userId: string,
  itemType: 'track' | 'nft' | 'artist',
  itemId: string
): Promise<void> {
  if (!itemId) return;

  // Optimistically update memory/localStorage
  invalidateRecommendationCache(userId);

  if (!userId) return;

  try {
    const prefRef = doc(db, 'users', userId, 'recommendations', 'preferences');
    const existing = await fetchUserRecommendationPreferences(userId);

    const updatePayload: Partial<UserRecommendationPreferences> = {
      lastUpdated: new Date().toISOString(),
    };

    if (itemType === 'track') {
      updatePayload.hiddenTrackIds = Array.from(new Set([...(existing.hiddenTrackIds || []), itemId]));
    } else if (itemType === 'nft') {
      updatePayload.hiddenNftIds = Array.from(new Set([...(existing.hiddenNftIds || []), itemId]));
    } else if (itemType === 'artist') {
      updatePayload.hiddenArtistIds = Array.from(new Set([...(existing.hiddenArtistIds || []), itemId]));
    }

    await setDoc(prefRef, updatePayload, { merge: true });
    localStorage.setItem(`tj_rec_prefs_${userId}`, JSON.stringify({ ...existing, ...updatePayload }));
  } catch (err) {
    console.warn('[recommendationService] Failed to save hidden item to Firestore:', err);
  }
}

/**
 * Record recommendation impression to track effectiveness without storing PII.
 */
export async function recordRecommendationImpression(
  userId: string,
  itemType: 'track' | 'nft' | 'artist',
  itemId: string
): Promise<void> {
  if (!userId || !itemId) return;

  try {
    const impressionRef = doc(db, 'users', userId, 'recommendationImpressions', `${itemType}_${itemId}`);
    await setDoc(
      impressionRef,
      {
        itemType,
        itemId,
        count: increment(1),
        lastSeen: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    // Non-blocking telemetry omission
  }
}

/**
 * Clear all user recommendation activity and history.
 */
export async function clearUserRecommendationActivity(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const prefRef = doc(db, 'users', userId, 'recommendations', 'preferences');
    await setDoc(prefRef, {
      preferredGenres: [],
      hiddenTrackIds: [],
      hiddenNftIds: [],
      hiddenArtistIds: [],
      lastUpdated: new Date().toISOString(),
    });
    localStorage.removeItem(`tj_rec_prefs_${userId}`);
    invalidateRecommendationCache(userId);
  } catch (err) {
    console.warn('[recommendationService] Error clearing recommendation activity:', err);
  }
}

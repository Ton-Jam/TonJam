import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useAuth } from '@/contexts/AuthContext';
import { Track, NFTItem, Artist } from '@/types';
import { MOCK_TRACKS, MOCK_NFTS, MOCK_ARTISTS } from '@/constants';
import {
  rankRecommendedTracks,
  rankRecommendedNFTs,
  rankRecommendedArtists,
  fetchUserListeningHistory,
  fetchUserRecommendationPreferences,
  hideRecommendation,
  invalidateRecommendationCache,
  getCachedRecommendations,
  setCachedRecommendations,
  ListeningHistoryItem,
  UserRecommendationPreferences,
  RecommendationUserContext,
} from '@/services/recommendationService';

export interface UseSmartRecommendationsReturn {
  recommendedTracks: Track[];
  recommendedNFTs: NFTItem[];
  recommendedArtists: Artist[];
  isLoading: boolean;
  refreshKey: number;
  refreshRecommendations: () => void;
  hideTrack: (trackId: string) => Promise<void>;
  hideNFT: (nftId: string) => Promise<void>;
  hideArtist: (artistId: string) => Promise<void>;
}

export function useSmartRecommendations(): UseSmartRecommendationsReturn {
  const { allTracks, recentlyPlayed, likedTrackIds, followedUserIds, artists } = useAudio();
  const { nfts } = useNFT();
  const { userProfile, user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<UserRecommendationPreferences>({
    preferredGenres: [],
    hiddenTrackIds: [],
    hiddenNftIds: [],
    hiddenArtistIds: [],
  });

  const userId = user?.uid || userProfile?.uid;

  // Load user listening history and recommendation preferences
  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const [history, prefs] = await Promise.all([
          fetchUserListeningHistory(userId, 30),
          fetchUserRecommendationPreferences(userId),
        ]);
        if (isMounted) {
          setListeningHistory(history);
          setPreferences(prefs);
        }
      } catch (err) {
        console.warn('[useSmartRecommendations] Error loading history:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [userId, refreshKey]);

  // Construct Recommendation User Context
  const userContext: RecommendationUserContext = useMemo(() => {
    return {
      userId,
      recentlyPlayed: recentlyPlayed || [],
      listeningHistory,
      likedTrackIds: likedTrackIds || [],
      followedArtistIds: followedUserIds || [],
      preferredGenres: preferences.preferredGenres?.length ? preferences.preferredGenres : (userProfile?.favoriteGenres || []),
      hiddenTrackIds: preferences.hiddenTrackIds || [],
      hiddenNftIds: preferences.hiddenNftIds || [],
      hiddenArtistIds: preferences.hiddenArtistIds || [],
    };
  }, [userId, recentlyPlayed, listeningHistory, likedTrackIds, followedUserIds, preferences, userProfile?.favoriteGenres]);

  // Compute recommendations with caching
  const recommendedTracks = useMemo<Track[]>(() => {
    const pool = (allTracks && allTracks.length > 0) ? allTracks : MOCK_TRACKS;
    const cacheKey = `rec_tracks_${userId || 'guest'}_${refreshKey}`;
    const cached = getCachedRecommendations<Track[]>(cacheKey);
    if (cached) return cached;

    const ranked = rankRecommendedTracks(pool, userContext, {
      limit: 14,
      diversityMaxPerArtist: 2,
    });
    setCachedRecommendations(cacheKey, ranked);
    return ranked;
  }, [allTracks, userContext, userId, refreshKey]);

  const recommendedNFTs = useMemo<NFTItem[]>(() => {
    const pool = (nfts && nfts.length > 0) ? nfts : MOCK_NFTS;
    const cacheKey = `rec_nfts_${userId || 'guest'}_${refreshKey}`;
    const cached = getCachedRecommendations<NFTItem[]>(cacheKey);
    if (cached) return cached;

    const ranked = rankRecommendedNFTs(pool, userContext, {
      limit: 12,
    });
    setCachedRecommendations(cacheKey, ranked);
    return ranked;
  }, [nfts, userContext, userId, refreshKey]);

  const recommendedArtists = useMemo<Artist[]>(() => {
    const pool = (artists && artists.length > 0) ? artists : MOCK_ARTISTS;
    const cacheKey = `rec_artists_${userId || 'guest'}_${refreshKey}`;
    const cached = getCachedRecommendations<Artist[]>(cacheKey);
    if (cached) return cached;

    const ranked = rankRecommendedArtists(pool, userContext, {
      limit: 8,
    });
    setCachedRecommendations(cacheKey, ranked);
    return ranked;
  }, [artists, userContext, userId, refreshKey]);

  const refreshRecommendations = useCallback(() => {
    invalidateRecommendationCache(userId);
    setRefreshKey((k) => k + 1);
  }, [userId]);

  const hideTrack = useCallback(async (trackId: string) => {
    if (!trackId) return;
    setPreferences((prev) => ({
      ...prev,
      hiddenTrackIds: [...prev.hiddenTrackIds, trackId],
    }));
    if (userId) {
      await hideRecommendation(userId, 'track', trackId);
    }
  }, [userId]);

  const hideNFT = useCallback(async (nftId: string) => {
    if (!nftId) return;
    setPreferences((prev) => ({
      ...prev,
      hiddenNftIds: [...prev.hiddenNftIds, nftId],
    }));
    if (userId) {
      await hideRecommendation(userId, 'nft', nftId);
    }
  }, [userId]);

  const hideArtist = useCallback(async (artistId: string) => {
    if (!artistId) return;
    setPreferences((prev) => ({
      ...prev,
      hiddenArtistIds: [...prev.hiddenArtistIds, artistId],
    }));
    if (userId) {
      await hideRecommendation(userId, 'artist', artistId);
    }
  }, [userId]);

  return {
    recommendedTracks,
    recommendedNFTs,
    recommendedArtists,
    isLoading,
    refreshKey,
    refreshRecommendations,
    hideTrack,
    hideNFT,
    hideArtist,
  };
}

export default useSmartRecommendations;

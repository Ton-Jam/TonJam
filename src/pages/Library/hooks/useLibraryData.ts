import { useState, useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useToast } from '@/components/layout/ToastProvider';
import {
  cacheTrackInServiceWorker,
  removeTrackFromServiceWorker,
  getCachedTrackIdsSet,
  syncInitialOfflineTracks,
} from '@/services/serviceWorkerCacheService';
import { audioCacheService } from '@/services/audioCacheService';
import {
  LibraryTrack,
  LibraryArtist,
  LibraryAlbum,
  LibraryNFT,
  LibraryPlaylist,
  HistoryEvent,
  QueueItem,
  LibraryAnalytics,
} from '../types';

export const useLibraryData = () => {
  const toast = useToast();
  const {
    allTracks,
    artists: audioArtists,
    collections: audioCollections,
    playlists: audioPlaylists,
    recentlyPlayed,
    queue: audioQueue,
    likedTrackIds,
    followedUserIds,
    userProfile,
    playTrack,
    toggleLikeTrack: audioToggleLikeTrack,
    createNewPlaylist: audioCreateNewPlaylist,
    deletePlaylist: audioDeletePlaylist,
    setIsCreatePlaylistModalOpen,
    removeFromQueue: audioRemoveFromQueue,
    clearQueue: audioClearQueue,
    addToQueue: audioAddToQueue,
    clearRecentlyPlayed,
  } = useAudio();
  const { nfts: firestoreNfts } = useNFT();

  const [isLoading, setIsLoading] = useState(false);
  const [activeChip, setActiveChip] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recently-added' | 'alphabetical' | 'artist'>('recently-added');

  const [downloadedTrackIds, setDownloadedTrackIds] = useState<Set<string>>(new Set());

  const [pinnedPlaylistIds, setPinnedPlaylistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tonjam_pinned_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [downloadQuality, setDownloadQuality] = useState<'High' | 'Lossless' | 'Dolby Atmos'>('Lossless');
  const [isOfflineOnly, setIsOfflineOnly] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tonjam_library_offline_only') === 'true';
    } catch {
      return false;
    }
  });
  const [cachedTrackIds, setCachedTrackIds] = useState<Set<string>>(new Set());

  const tracks: LibraryTrack[] = useMemo(() => {
    const ownedSet = new Set(userProfile?.ownedTrackIds || []);
    const likedSet = new Set(likedTrackIds || []);
    return (allTracks || []).map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      artistId: t.artistId || '',
      album: t.album || t.genre || 'Single',
      coverUrl: t.coverUrl || '/placeholders/track-placeholder.webp',
      duration: t.duration || 0,
      plays: Number(t.playCount || t.streams || 0),
      isLiked: likedSet.has(t.id),
      isDownloaded: downloadedTrackIds.has(t.id) || cachedTrackIds.has(t.id),
      isOfflineAvailable: cachedTrackIds.has(t.id) || downloadedTrackIds.has(t.id),
      downloadQuality: cachedTrackIds.has(t.id) ? downloadQuality : undefined,
      releaseDate: t.releaseDate || '',
      audioUrl: t.audioUrl,
      isOwned: ownedSet.has(t.id),
    }));
  }, [allTracks, likedTrackIds, userProfile?.ownedTrackIds, downloadedTrackIds, cachedTrackIds, downloadQuality]);

  const artists: LibraryArtist[] = useMemo(() => {
    const followedSet = new Set(followedUserIds || []);
    return (audioArtists || []).map((a) => ({
      id: a.uid,
      name: a.name,
      avatarUrl: a.avatarUrl || '/placeholders/artist-placeholder.webp',
      followersCount: a.followers || 0,
      isFollowed: followedSet.has(a.uid),
      verified: Boolean(a.verified || a.isVerifiedArtist),
      genres: a.genre ? [a.genre] : ['Electronic'],
    }));
  }, [audioArtists, followedUserIds]);

  const albums: LibraryAlbum[] = useMemo(() => {
    return (audioCollections || []).map((col) => {
      const artistObj = audioArtists.find((a) => a.uid === col.artistId);
      return {
        id: col.id,
        title: col.name,
        artist: artistObj?.name || 'Artist',
        artistId: col.artistId,
        coverUrl: col.coverUrl || '/placeholders/album-placeholder.webp',
        tracksCount: col.nftIds?.length || 0,
        releaseYear: col.createdAt ? new Date(col.createdAt).getFullYear() : new Date().getFullYear(),
        isLiked: false,
        isDownloaded: false,
      };
    });
  }, [audioCollections, audioArtists]);

  const nfts: LibraryNFT[] = useMemo(() => {
    const uid = userProfile?.uid;
    const wallet = userProfile?.walletAddress?.toLowerCase();
    const ownedIds = new Set(userProfile?.ownedNftIds || []);

    const userOwnedNfts = (firestoreNfts || []).filter((n) => {
      if (ownedIds.has(n.id)) return true;
      if (uid && (n.ownerId === uid || n.artistId === uid)) return true;
      if (wallet && (n.owner || '').toLowerCase() === wallet) return true;
      return false;
    });

    const source = userOwnedNfts;
    return source.map((n) => ({
      id: n.id,
      tokenId: n.edition || `#${n.id.slice(0, 4)}`,
      title: n.title,
      artist: n.artist || n.creator || 'Artist',
      coverUrl: n.coverUrl || n.imageUrl || '/placeholders/nft-placeholder.webp',
      collectionName: n.nftCollection || 'TonJam Collectibles',
      floorPriceTon: parseFloat(String(n.price || '0')) || 0,
      royaltyPercent: Number(n.royalty || 10),
      rarity: (n.rarity as any) || 'Common',
      ownerAddress: n.owner || '',
      musicFileUrl: n.audioUrl || '',
    }));
  }, [firestoreNfts, userProfile?.uid, userProfile?.walletAddress, userProfile?.ownedNftIds]);

  const togglePinPlaylist = (id: string) => {
    setPinnedPlaylistIds((prev) => {
      const next = prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id];
      localStorage.setItem('tonjam_pinned_playlists', JSON.stringify(next));
      return next;
    });
  };

  const playlists: LibraryPlaylist[] = useMemo(() => {
    return (audioPlaylists || []).map((pl) => ({
      id: pl.id,
      title: pl.title,
      creator: pl.creator || 'TonJam',
      coverUrl: pl.coverUrl || '/placeholders/playlist-placeholder.webp',
      tracksCount: pl.trackCount ?? (pl.trackIds?.length || 0),
      isPinned: pinnedPlaylistIds.includes(pl.id),
      isDownloaded: false,
      isCustom: true,
    }));
  }, [audioPlaylists, pinnedPlaylistIds]);

  const history: HistoryEvent[] = useMemo(() => {
    return (recentlyPlayed || []).map((t, idx) => ({
      id: `hist-${t.id}-${idx}`,
      trackId: t.id,
      title: t.title,
      artist: t.artist,
      coverUrl: t.coverUrl || '/placeholders/track-placeholder.webp',
      playedAt: t.releaseDate || '',
      duration: t.duration || 0,
    }));
  }, [recentlyPlayed]);

  const queue: QueueItem[] = useMemo(() => {
    return (audioQueue || []).map((t, idx) => ({
      id: `q-${t.id}-${idx}`,
      trackId: t.id,
      title: t.title,
      artist: t.artist,
      coverUrl: t.coverUrl || '/placeholders/track-placeholder.webp',
      duration: t.duration || 0,
      addedBy: 'user',
    }));
  }, [audioQueue]);

  const analytics: LibraryAnalytics = useMemo(() => {
    const genreCounts = new Map<string, number>();
    const artistCounts = new Map<string, { name: string; playCount: number; avatarUrl: string }>();
    const songCounts = new Map<string, { title: string; artist: string; plays: number; coverUrl: string }>();
    let totalSeconds = 0;

    (recentlyPlayed || []).forEach((t) => {
      totalSeconds += Number(t.duration || 0);
      const genre = t.genre || 'Electronic';
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);

      const artistObj = (audioArtists || []).find((a) => a.uid === t.artistId || a.name === t.artist);
      const existingArtist = artistCounts.get(t.artist) || {
        name: t.artist,
        playCount: 0,
        avatarUrl: artistObj?.avatarUrl || t.artistAvatar || t.coverUrl || '/placeholders/artist-placeholder.webp',
      };
      existingArtist.playCount += 1;
      artistCounts.set(t.artist, existingArtist);

      const existingSong = songCounts.get(t.id) || {
        title: t.title,
        artist: t.artist,
        plays: Number(t.playCount || t.streams || 1),
        coverUrl: t.coverUrl || '/placeholders/track-placeholder.webp',
      };
      songCounts.set(t.id, existingSong);
    });

    const totalGenreCount = Array.from(genreCounts.values()).reduce((a, b) => a + b, 0);
    const favoriteGenres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: totalGenreCount > 0 ? Math.round((count / totalGenreCount) * 100) : 0,
      }));

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalListeningHours = Number((totalSeconds / 3600).toFixed(1));
    const weeklyHours = days.map((day) => ({ day, hours: 0 }));

    return {
      weeklyHours,
      favoriteGenres,
      favoriteArtists: Array.from(artistCounts.values())
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 5),
      topSongs: Array.from(songCounts.values())
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 5),
      listeningStreakDays: (recentlyPlayed || []).length > 0 ? 1 : 0,
      totalListeningHours,
    };
  }, [recentlyPlayed, audioArtists]);

  // Synchronize with Service Worker CacheStorage
  useEffect(() => {
    let isMounted = true;
    const syncCache = async () => {
      await syncInitialOfflineTracks(tracks);
      const ids = await getCachedTrackIdsSet();
      if (isMounted) {
        setCachedTrackIds(ids);
      }
    };

    syncCache();

    const handleCacheUpdated = () => {
      getCachedTrackIdsSet().then((ids) => {
        if (isMounted) setCachedTrackIds(ids);
      });
    };

    window.addEventListener('tonjam_sw_cache_updated', handleCacheUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('tonjam_sw_cache_updated', handleCacheUpdated);
    };
  }, [tracks]);

  const toggleOfflineMode = () => {
    setIsOfflineOnly((prev) => {
      const next = !prev;
      localStorage.setItem('tonjam_library_offline_only', String(next));
      if (next) {
        toast.info('Offline Mode Enabled', 'Showing tracks stored in Service Worker Cache.');
      } else {
        toast.info('Offline Mode Disabled', 'Showing full online library.');
      }
      return next;
    });
  };

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase());

      if (isOfflineOnly) {
        const isCached = cachedTrackIds.has(track.id) || track.isDownloaded || track.isOfflineAvailable;
        if (!isCached) return false;
      }

      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Tracks') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && track.isLiked;
      if (activeChip === 'Downloads' || activeChip === 'Offline') {
        return matchesSearch && (track.isDownloaded || cachedTrackIds.has(track.id));
      }
      return false;
    });
  }, [tracks, activeChip, searchQuery, isOfflineOnly, cachedTrackIds]);

  const filteredPlaylists = useMemo(() => {
    return playlists.filter((playlist) => {
      const matchesSearch = playlist.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (isOfflineOnly && !playlist.isDownloaded) return false;
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Playlists') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && playlist.isPinned;
      if (activeChip === 'Downloads' || activeChip === 'Offline') return matchesSearch && playlist.isDownloaded;
      return false;
    });
  }, [playlists, activeChip, searchQuery, isOfflineOnly]);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesSearch =
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase());
      if (isOfflineOnly && !album.isDownloaded) return false;
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Albums') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && album.isLiked;
      if (activeChip === 'Downloads' || activeChip === 'Offline') return matchesSearch && album.isDownloaded;
      return false;
    });
  }, [albums, activeChip, searchQuery, isOfflineOnly]);

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (isOfflineOnly) {
        const hasCachedTrack = tracks.some(
          (t) => t.artistId === artist.id && (cachedTrackIds.has(t.id) || t.isDownloaded)
        );
        if (!hasCachedTrack) return false;
      }
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Artists') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && artist.isFollowed;
      return false;
    });
  }, [artists, activeChip, searchQuery, isOfflineOnly, tracks, cachedTrackIds]);

  const filteredNfts = useMemo(() => {
    return nfts.filter((nft) => {
      const matchesSearch =
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collectionName.toLowerCase().includes(searchQuery.toLowerCase());
      if (isOfflineOnly) {
        const isCached = cachedTrackIds.has(nft.id) || (nft as any).isDownloaded;
        if (!isCached) return false;
      }
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'NFT Music' || activeChip === 'Collections') return matchesSearch;
      return false;
    });
  }, [nfts, activeChip, searchQuery, isOfflineOnly, cachedTrackIds]);

  const toggleLikeTrack = (id: string) => {
    audioToggleLikeTrack(id);
  };

  const toggleDownloadTrack = async (id: string) => {
    const track = allTracks.find((t) => t.id === id);
    if (!track) return;

    const isDownloaded = downloadedTrackIds.has(id) || cachedTrackIds.has(id);
    if (!isDownloaded) {
      if (!track.audioUrl) {
        toast.error('Unavailable', 'No audio URL found for offline caching.');
        return;
      }
      toast.info('Caching audio track...', `Storing "${track.title}" in Service Worker Cache.`);
      await Promise.all([
        cacheTrackInServiceWorker({
          id: track.id,
          title: track.title,
          artist: track.artist,
          audioUrl: track.audioUrl,
          quality: downloadQuality,
        }),
        audioCacheService.cacheTrack(track.id, track.audioUrl),
      ]);
      setDownloadedTrackIds((prev) => new Set(prev).add(id));
      setCachedTrackIds((prev) => new Set(prev).add(id));
      toast.success('Download Cached', `"${track.title}" is available offline.`);
    } else {
      await removeTrackFromServiceWorker(track.id);
      await audioCacheService.removeCachedTrack(track.id);
      setDownloadedTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCachedTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Removed Download', `"${track.title}" deleted from offline cache.`);
    }
  };

  const createPlaylist = (title: string, description?: string, coverUrl?: string) => {
    if (!title.trim()) return;
    audioCreateNewPlaylist(title.trim(), description, undefined, coverUrl);
    toast.success('Playlist Created', `Successfully compiled the "${title.trim()}" playlist.`);
  };

  const deletePlaylist = (id: string) => {
    audioDeletePlaylist(id);
    toast.success('Playlist Deleted', 'Playlist removed from Library.');
  };

  const handlePlayTrack = (track: LibraryTrack) => {
    const matched = allTracks.find((t) => t.id === track.id);
    if (matched) {
      playTrack(matched);
      return;
    }
    if ((track as any).audioUrl) {
      playTrack(track as any);
    }
  };

  const clearHistory = () => {
    clearRecentlyPlayed();
    toast.success('History Cleared', 'Your local listening history has been cleared.');
  };

  const addToQueue = (track: LibraryTrack) => {
    const matched = allTracks.find((t) => t.id === track.id);
    if (matched) {
      audioAddToQueue(matched);
      toast.success('Added to Queue', `"${track.title}" added to queue.`);
    }
  };

  const removeFromQueue = (id: string) => {
    const trackId = id.startsWith('q-') ? id.split('-')[1] : id;
    audioRemoveFromQueue(trackId);
  };

  const clearQueue = () => {
    audioClearQueue();
    toast.success('Queue Cleared', 'All upcoming tracks removed from active queue.');
  };

  const totalDownloadedSize = useMemo(() => {
    const trackSize = tracks.filter((t) => t.isDownloaded).length * 5.8;
    const albumSize = albums.filter((a) => a.isDownloaded).length * 68.0;
    const playlistSize = playlists.filter((p) => p.isDownloaded).length * 135.0;
    return ((trackSize + albumSize + playlistSize) / 1024).toFixed(2);
  }, [tracks, albums, playlists]);

  const totalNftsFloorValue = useMemo(() => {
    return nfts.reduce((acc, nft) => acc + nft.floorPriceTon, 0);
  }, [nfts]);

  return {
    isLoading,
    activeChip,
    setActiveChip,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isOfflineOnly,
    setIsOfflineOnly,
    toggleOfflineMode,
    cachedTrackIds,
    cachedTrackCount: tracks.filter(
      (t) => cachedTrackIds.has(t.id) || t.isDownloaded || t.isOfflineAvailable
    ).length,
    tracks: filteredTracks,
    rawTracks: tracks,
    artists: filteredArtists,
    rawArtists: artists,
    albums: filteredAlbums,
    rawAlbums: albums,
    nfts: filteredNfts,
    playlists: filteredPlaylists,
    history,
    queue,
    analytics,
    downloadQuality,
    setDownloadQuality,
    totalDownloadedSize,
    totalNftsFloorValue,
    likedCount: tracks.filter((t) => t.isLiked).length,
    downloadCount: tracks.filter((t) => t.isDownloaded).length,
    nftCount: nfts.length,
    playlistCount: playlists.length,
    toggleLikeTrack,
    toggleDownloadTrack,
    createPlaylist,
    deletePlaylist,
    togglePinPlaylist,
    openCreatePlaylistModal: () => setIsCreatePlaylistModalOpen(true),
    handlePlayTrack,
    clearHistory,
    addToQueue,
    removeFromQueue,
    clearQueue,
    importTracks: () => {},
    importPlaylistWithTracks: (
      playlistTitle: string,
      _playlistCoverUrl: string,
      tracksList: { title: string; artist: string }[]
    ) => {
      audioCreateNewPlaylist(
        playlistTitle,
        `Imported playlist with ${tracksList.length} tracks`,
        undefined,
        _playlistCoverUrl
      );
    },
  };
};

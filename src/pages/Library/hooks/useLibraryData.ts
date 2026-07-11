import { useState, useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/components/layout/ToastProvider';
import { 
  LibraryTrack, LibraryArtist, LibraryAlbum, LibraryNFT, LibraryPlaylist, 
  HistoryEvent, QueueItem, LibraryAnalytics 
} from '../types';
import { 
  MOCK_LIBRARY_TRACKS, MOCK_LIBRARY_ARTISTS, MOCK_LIBRARY_ALBUMS, 
  MOCK_LIBRARY_NFTS, MOCK_LIBRARY_PLAYLISTS, MOCK_HISTORY_EVENTS, 
  MOCK_QUEUE, MOCK_LIBRARY_ANALYTICS 
} from '../mock';

export const useLibraryData = () => {
  const toast = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  // Loading state for skeletons
  const [isLoading, setIsLoading] = useState(true);

  // Filter Chips and Search
  const [activeChip, setActiveChip] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recently-added' | 'alphabetical' | 'artist'>('recently-added');
  
  // Storage and collections state
  const [tracks, setTracks] = useState<LibraryTrack[]>(() => {
    const local = localStorage.getItem('tonjam_library_tracks');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    } else {
      localStorage.setItem('tonjam_library_tracks', JSON.stringify(MOCK_LIBRARY_TRACKS));
    }
    return MOCK_LIBRARY_TRACKS;
  });
  const [artists, setArtists] = useState<LibraryArtist[]>(MOCK_LIBRARY_ARTISTS);
  const [albums, setAlbums] = useState<LibraryAlbum[]>(MOCK_LIBRARY_ALBUMS);
  const [nfts, setNfts] = useState<LibraryNFT[]>(() => {
    const local = localStorage.getItem('tonjam_library_nfts');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    } else {
      localStorage.setItem('tonjam_library_nfts', JSON.stringify(MOCK_LIBRARY_NFTS));
    }
    return MOCK_LIBRARY_NFTS;
  });
  const [playlists, setPlaylists] = useState<LibraryPlaylist[]>(MOCK_LIBRARY_PLAYLISTS);
  const [history, setHistory] = useState<HistoryEvent[]>(MOCK_HISTORY_EVENTS);
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE);
  const [analytics, setAnalytics] = useState<LibraryAnalytics>(MOCK_LIBRARY_ANALYTICS);
  const [downloadQuality, setDownloadQuality] = useState<'High' | 'Lossless' | 'Dolby Atmos'>('Lossless');

  // Trigger fake initial loading for beautiful skeletons
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tonjam_library_tracks', JSON.stringify(tracks));
    window.dispatchEvent(new Event('tonjam_library_updated'));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem('tonjam_library_nfts', JSON.stringify(nfts));
    window.dispatchEvent(new Event('tonjam_library_updated'));
  }, [nfts]);

  // Synchronize with external changes (e.g. JamSpace bookmarks)
  useEffect(() => {
    const handleSync = () => {
      const localTracksStr = localStorage.getItem('tonjam_library_tracks');
      if (localTracksStr && localTracksStr !== JSON.stringify(tracks)) {
        try {
          setTracks(JSON.parse(localTracksStr));
        } catch (e) {}
      }
      const localNftsStr = localStorage.getItem('tonjam_library_nfts');
      if (localNftsStr && localNftsStr !== JSON.stringify(nfts)) {
        try {
          setNfts(JSON.parse(localNftsStr));
        } catch (e) {}
      }
    };

    window.addEventListener('tonjam_library_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('tonjam_library_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [tracks, nfts]);

  // Filter lists based on the active chip and search query
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const matchesSearch = 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Tracks') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && track.isLiked;
      if (activeChip === 'Downloads' || activeChip === 'Offline') return matchesSearch && track.isDownloaded;
      return false;
    });
  }, [tracks, activeChip, searchQuery]);

  const filteredPlaylists = useMemo(() => {
    return playlists.filter(playlist => {
      const matchesSearch = playlist.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Playlists') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && playlist.isPinned;
      if (activeChip === 'Downloads' || activeChip === 'Offline') return matchesSearch && playlist.isDownloaded;
      return false;
    });
  }, [playlists, activeChip, searchQuery]);

  const filteredAlbums = useMemo(() => {
    return albums.filter(album => {
      const matchesSearch = 
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Albums') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && album.isLiked;
      if (activeChip === 'Downloads' || activeChip === 'Offline') return matchesSearch && album.isDownloaded;
      return false;
    });
  }, [albums, activeChip, searchQuery]);

  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'Artists') return matchesSearch;
      if (activeChip === 'Favorites') return matchesSearch && artist.isFollowed;
      return false;
    });
  }, [artists, activeChip, searchQuery]);

  const filteredNfts = useMemo(() => {
    return nfts.filter(nft => {
      const matchesSearch = 
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collectionName.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeChip === 'All') return matchesSearch;
      if (activeChip === 'NFT Music' || activeChip === 'Collections') return matchesSearch;
      return false;
    });
  }, [nfts, activeChip, searchQuery]);

  // Actions
  const toggleLikeTrack = (id: string) => {
    setTracks(prev => prev.map(track => {
      if (track.id === id) {
        const nextState = !track.isLiked;
        toast.success(
          nextState ? 'Added to Liked Songs' : 'Removed from Liked Songs',
          `"${track.title}" has been ${nextState ? 'saved to' : 'removed from'} your favorites.`
        );
        return { ...track, isLiked: nextState };
      }
      return track;
    }));
  };

  const toggleDownloadTrack = (id: string) => {
    setTracks(prev => prev.map(track => {
      if (track.id === id) {
        const nextState = !track.isDownloaded;
        if (nextState) {
          toast.info(
            'Downloading track...',
            `Downloading "${track.title}" in ${downloadQuality} quality.`
          );
          // Simulate download finished in 1.5s
          setTimeout(() => {
            setTracks(current => current.map(t => t.id === id ? { 
              ...t, 
              isDownloaded: true, 
              downloadSize: '5.4 MB', 
              downloadQuality: downloadQuality,
              isOfflineAvailable: true 
            } : t));
            toast.success(
              'Download Complete',
              `"${track.title}" is now available offline.`
            );
          }, 1500);
          return track;
        } else {
          toast.success('Removed Download', `"${track.title}" has been deleted from your device storage.`);
          return { ...track, isDownloaded: false, downloadSize: undefined, isOfflineAvailable: false };
        }
      }
      return track;
    }));
  };

  const createPlaylist = (title: string) => {
    if (!title.trim()) return;
    const newPlaylist: LibraryPlaylist = {
      id: `pl-${Date.now()}`,
      title,
      creator: 'You',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
      tracksCount: 0,
      isPinned: false,
      isDownloaded: false,
      isCustom: true
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    toast.success('Playlist Created', `Successfully compiled the "${title}" node.`);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    toast.success('Playlist Deleted', 'Custom playlist deleted from Library.');
  };

  const togglePinPlaylist = (id: string) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };

  const handlePlayTrack = (track: LibraryTrack) => {
    // Map LibraryTrack to context Track format
    const contextTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // default test file
      duration: track.duration,
      streams: track.plays || 0,
      playCount: track.plays || 0,
      album: track.album
    };
    
    playTrack(contextTrack as any);
    
    // Add to history
    const newHistoryEvent: HistoryEvent = {
      id: `he-${Date.now()}`,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      playedAt: new Date().toISOString(),
      duration: track.duration
    };
    setHistory(prev => [newHistoryEvent, ...prev.slice(0, 20)]);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('History Cleared', 'Your local listening history has been wiped.');
  };

  const addToQueue = (track: LibraryTrack) => {
    const newItem: QueueItem = {
      id: `qi-${Date.now()}`,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      duration: track.duration,
      addedBy: 'user'
    };
    setQueue(prev => [...prev, newItem]);
    toast.success('Added to Queue', `"${track.title}" added to play next.`);
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
    toast.success('Queue Cleared', 'All upcoming tracks removed from active queue.');
  };

  // Stats calculation
  const totalDownloadedSize = useMemo(() => {
    // Calculate simulated storage based on downloaded tracks and albums
    let trackSize = tracks.filter(t => t.isDownloaded).length * 5.8; // average 5.8 MB
    let albumSize = albums.filter(a => a.isDownloaded).length * 68.0; // average 68 MB
    let playlistSize = playlists.filter(p => p.isDownloaded).length * 135.0; // average 135 MB
    return ((trackSize + albumSize + playlistSize) / 1024).toFixed(2); // in GB
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
    
    // Data lists
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
    
    // Aggregated Stats
    totalDownloadedSize,
    totalNftsFloorValue,
    likedCount: tracks.filter(t => t.isLiked).length,
    downloadCount: tracks.filter(t => t.isDownloaded).length,
    nftCount: nfts.length,
    playlistCount: playlists.length,
    
    // Methods
    toggleLikeTrack,
    toggleDownloadTrack,
    createPlaylist,
    deletePlaylist,
    togglePinPlaylist,
    handlePlayTrack,
    clearHistory,
    addToQueue,
    removeFromQueue,
    clearQueue,
    importTracks: (newTracksToImport: Omit<LibraryTrack, 'isLiked' | 'isDownloaded' | 'isOfflineAvailable'>[]) => {
      setTracks(prev => {
        const updated = [...prev];
        let importedCount = 0;
        newTracksToImport.forEach(newTrack => {
          const existingIdx = updated.findIndex(t => t.title.toLowerCase() === newTrack.title.toLowerCase() && t.artist.toLowerCase() === newTrack.artist.toLowerCase());
          if (existingIdx >= 0) {
            // Mark existing track as liked
            if (!updated[existingIdx].isLiked) {
              updated[existingIdx] = { ...updated[existingIdx], isLiked: true };
              importedCount++;
            }
          } else {
            // Add as new track
            const id = `tr-imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            updated.push({
              id,
              title: newTrack.title,
              artist: newTrack.artist,
              artistId: newTrack.artistId || 'art-imported',
              album: newTrack.album || 'Imported Compilation',
              coverUrl: newTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
              duration: newTrack.duration || 180,
              plays: 0,
              isLiked: true,
              isDownloaded: false,
              isOfflineAvailable: false
            });
            importedCount++;
          }
        });
        if (importedCount > 0) {
          toast.success('Library Sync Complete', `Synced ${importedCount} songs into your TonJam favorites.`);
        } else {
          toast.info('Sync Check', 'All selected songs are already present in your Library.');
        }
        return updated;
      });
    },
    importPlaylistWithTracks: (playlistTitle: string, playlistCoverUrl: string, tracksList: { title: string; artist: string; album?: string; coverUrl?: string; duration?: number }[]) => {
      const playlistId = `pl-imported-${Date.now()}`;
      
      // 1. Create the playlist
      const newPlaylist: LibraryPlaylist = {
        id: playlistId,
        title: playlistTitle,
        creator: 'You (Imported)',
        coverUrl: playlistCoverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
        tracksCount: tracksList.length,
        isPinned: false,
        isDownloaded: false,
        isCustom: true
      };
      
      setPlaylists(prev => [newPlaylist, ...prev]);

      // 2. Add any missing tracks to our master list
      setTracks(prev => {
        const updated = [...prev];
        tracksList.forEach(t => {
          const exists = updated.some(et => et.title.toLowerCase() === t.title.toLowerCase() && et.artist.toLowerCase() === t.artist.toLowerCase());
          if (!exists) {
            const id = `tr-imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            updated.push({
              id,
              title: t.title,
              artist: t.artist,
              artistId: 'art-imported',
              album: t.album || playlistTitle,
              coverUrl: t.coverUrl || playlistCoverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
              duration: t.duration || 180,
              plays: 0,
              isLiked: false,
              isDownloaded: false,
              isOfflineAvailable: false
            });
          }
        });
        return updated;
      });

      toast.success('Playlist Synced', `"${playlistTitle}" was imported with ${tracksList.length} tracks.`);
    }
  };
};

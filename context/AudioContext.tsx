
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track, Playlist, UserProfile, NFTItem } from '../types';
import { MOCK_PLAYLISTS, MOCK_USER, MOCK_TRACKS } from '../constants';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
  duration?: number;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  progress: number;
  isFullPlayerOpen: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  notifications: Notification[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  likedTrackIds: string[];
  followedUserIds: string[];
  trackToAddToPlaylist: Track | null;
  optionsTrack: Track | null;
  activePlaylistId: string | null;
  userProfile: UserProfile;
  genesisContractAddress: string | null;
  volume: number;
  isMuted: boolean;
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  playAll: (tracks: Track[]) => void;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleLikeTrack: (trackId: string) => void;
  toggleFollowUser: (userId: string) => void;
  closePlayer: () => Promise<void>;
  setFullPlayerOpen: (open: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addNotification: (message: string, type?: 'success' | 'info' | 'error' | 'warning', duration?: number) => void;
  setTrackToAddToPlaylist: (track: Track | null) => void;
  setOptionsTrack: (track: Track | null) => void;
  setActivePlaylistId: (id: string | null) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderTrackInPlaylist: (playlistId: string, trackId: string, direction: 'up' | 'down') => void;
  createNewPlaylist: (name: string, description?: string, initialTrack?: Track) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  createRecommendedPlaylist: () => void;
  clearRecentlyPlayed: () => void;
  setUserProfile: (profile: UserProfile) => void;
  setGenesisContractAddress: (address: string | null) => void;
  userTracks: Track[];
  userNFTs: NFTItem[];
  addUserTrack: (track: Track) => void;
  addUserNFT: (nft: NFTItem) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_TRACK: 'tonjam_current_track',
  QUEUE: 'tonjam_queue',
  PROGRESS: 'tonjam_progress',
  SHUFFLE: 'tonjam_shuffle',
  REPEAT: 'tonjam_repeat',
  PLAYLISTS: 'tonjam_user_playlists',
  RECENTLY_PLAYED: 'tonjam_recently_played',
  USER_PROFILE: 'tonjam_user_profile',
  CONTRACT_ADDRESS: 'tonjam_genesis_contract',
  VOLUME: 'tonjam_volume',
  MUTED: 'tonjam_muted',
  LIKED_TRACKS: 'tonjam_liked_tracks',
  FOLLOWED_USERS: 'tonjam_followed_users'
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : MOCK_USER;
  });
  
  const [genesisContractAddress, setGenesisContractAddress] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CONTRACT_ADDRESS);
  });
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK);
    return saved ? JSON.parse(saved) : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUEUE);
    return saved ? JSON.parse(saved) : [];
  });
  const [progress, setProgress] = useState(0);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [isShuffle, setIsShuffle] = useState(() => localStorage.getItem(STORAGE_KEYS.SHUFFLE) === 'true');
  const [isRepeat, setIsRepeat] = useState(() => localStorage.getItem(STORAGE_KEYS.REPEAT) === 'true');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return saved ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MUTED);
    return saved === 'true';
  });
  
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return saved ? JSON.parse(saved) : MOCK_PLAYLISTS;
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
    return saved ? JSON.parse(saved) : [];
  });

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LIKED_TRACKS);
    return saved ? JSON.parse(saved) : [];
  });

  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLLOWED_USERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [userTracks, setUserTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('tonjam_user_tracks');
    return saved ? JSON.parse(saved) : [];
  });

  const [userNFTs, setUserNFTs] = useState<NFTItem[]>(() => {
    const saved = localStorage.getItem('tonjam_user_nfts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tonjam_user_tracks', JSON.stringify(userTracks));
  }, [userTracks]);

  useEffect(() => {
    localStorage.setItem('tonjam_user_nfts', JSON.stringify(userNFTs));
  }, [userNFTs]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(volume + 0.05);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(volume - 0.05);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [volume]);

  const addUserTrack = (track: Track) => {
    setUserTracks(prev => [track, ...prev]);
    addNotification(`Protocol "${track.title}" initialized`, "success");
  };

  const addUserNFT = (nft: NFTItem) => {
    setUserNFTs(prev => [nft, ...prev]);
    addNotification(`Asset "${nft.title}" minted to vault`, "success");
  };

  useEffect(() => {
    if (genesisContractAddress) {
      localStorage.setItem(STORAGE_KEYS.CONTRACT_ADDRESS, genesisContractAddress);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONTRACT_ADDRESS);
    }
  }, [genesisContractAddress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  // Fix: Added effect to persist recently played tracks to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(likedTrackIds));
  }, [likedTrackIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLLOWED_USERS, JSON.stringify(followedUserIds));
  }, [followedUserIds]);

  const resetProtocol = () => {
    setGenesisContractAddress(null);
    localStorage.removeItem(STORAGE_KEYS.CONTRACT_ADDRESS);
    localStorage.removeItem('ton-connect-storage_http-bridge-framework');
    addNotification("Protocol environment reset to Genesis state", "warning");
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') console.error("Playback error:", error);
          });
        }
      } else {
        nextTrack();
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // Sync volume and mute state
    audio.volume = isMuted ? 0 : volume;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, currentTrack, isRepeat, isShuffle]);

  const addNotification = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const playTrack = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 10);
    });
    
    if (audioRef.current) {
      // If there's a pending play promise, we should wait for it or at least catch its interruption
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }
      
      setCurrentTrack(track);
      audioRef.current.src = track.audioUrl;
      playPromiseRef.current = audioRef.current.play();
      
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current.catch(error => {
          if (error.name !== 'AbortError') console.error("Playback error:", error);
        });
      }
      setIsPlaying(true);
    }
    if (!queue.find(t => t.id === track.id)) setQueue(prev => [...prev, track]);
  };

  const playAll = (tracks: Track[]) => {
    if (tracks.length === 0) return;
    setQueue(tracks);
    playTrack(tracks[0]);
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      // Wait for any pending play to finish before pausing to avoid interruption error
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }
      audioRef.current.pause();
    } else {
      playPromiseRef.current = audioRef.current.play();
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current.catch(error => {
          if (error.name !== 'AbortError') console.error("Playback error:", error);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const index = queue.findIndex(t => t.id === currentTrack.id);
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      playTrack(queue[nextIndex]);
    } else if (index !== -1 && index < queue.length - 1) {
      playTrack(queue[index + 1]);
    } else if (isRepeat) {
      playTrack(queue[0]);
    }
  };

  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const index = queue.findIndex(t => t.id === currentTrack.id);
    if (index > 0) playTrack(queue[index - 1]);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    addNotification(`Added "${track.title}" to queue`);
  };

  const seek = (value: number) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
      setProgress(value);
    }
  };

  const setVolume = (value: number) => {
    const newVolume = Math.max(0, Math.min(1, value));
    setVolumeState(newVolume);
    localStorage.setItem(STORAGE_KEYS.VOLUME, newVolume.toString());
    
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }

    // Auto-mute if volume is 0, auto-unmute if volume > 0
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
      localStorage.setItem(STORAGE_KEYS.MUTED, 'true');
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      localStorage.setItem(STORAGE_KEYS.MUTED, 'false');
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem(STORAGE_KEYS.MUTED, nextMuted.toString());
    
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }

    // If unmuting and volume is 0, set it to a default (e.g. 0.5)
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
    }
  };

  const toggleLikeTrack = (trackId: string) => {
    setLikedTrackIds(prev => {
      const isLiked = prev.includes(trackId);
      if (isLiked) {
        addNotification("Frequency removed from vault", "info");
        return prev.filter(id => id !== trackId);
      } else {
        addNotification("Frequency saved to vault", "success");
        return [...prev, trackId];
      }
    });
  };

  const toggleFollowUser = (userId: string) => {
    setFollowedUserIds(prev => {
      const isFollowing = prev.includes(userId);
      if (isFollowing) {
        addNotification("Node synchronization terminated", "info");
        return prev.filter(id => id !== userId);
      } else {
        addNotification("Node synchronization established", "success");
        return [...prev, userId];
      }
    });
  };

  const closePlayer = async () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setFullPlayerOpen(false);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const createNewPlaylist = (name: string, description?: string, initialTrack?: Track) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title: name,
      coverUrl: '', // Leave empty for dynamic collage/placeholder
      trackCount: initialTrack ? 1 : 0,
      creator: 'You',
      description,
      trackIds: initialTrack ? [initialTrack.id] : []
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    if (initialTrack) {
      addNotification(`Created "${name}" and added "${initialTrack.title}"`, 'success');
    } else {
      addNotification(`Created playlist "${name}"`, 'success');
    }
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
    addNotification("Sequence purged from vault", "info");
  };

  const updatePlaylist = (playlistId: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(pl => pl.id === playlistId ? { ...pl, ...updates } : pl));
    addNotification("Sequence protocol updated", "success");
  };

  const createRecommendedPlaylist = () => {
    // Simulate recommendation logic by picking random tracks
    const shuffled = [...MOCK_TRACKS].sort(() => 0.5 - Math.random());
    const recommendedTracks = shuffled.slice(0, 5);
    const name = `Neural Sync ${playlists.length + 1}`;
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title: name,
      coverUrl: '', // Leave empty for dynamic collage
      trackCount: recommendedTracks.length,
      creator: 'TonJam AI',
      description: "Neural-sync sequence generated based on your sonic profile.",
      trackIds: recommendedTracks.map(t => t.id)
    };
    
    setPlaylists(prev => [newPlaylist, ...prev]);
    addNotification(`AI Sequence "${name}" initialized with ${recommendedTracks.length} tracks`, 'success');
  };

  // Fix: Implemented clearRecentlyPlayed function to purge history
  const clearRecentlyPlayed = () => {
    setRecentlyPlayed([]);
    addNotification("Playback history purged", "info");
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.trackIds?.includes(track.id)) return pl;
        const newIds = [...(pl.trackIds || []), track.id];
        return { ...pl, trackIds: newIds, trackCount: newIds.length };
      }
      return pl;
    }));
    addNotification(`Added "${track.title}" to ${playlists.find(p => p.id === playlistId)?.title}`);
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        const newIds = (pl.trackIds || []).filter(id => id !== trackId);
        return { ...pl, trackIds: newIds, trackCount: newIds.length };
      }
      return pl;
    }));
  };

  const reorderTrackInPlaylist = (playlistId: string, trackId: string, direction: 'up' | 'down') => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId && pl.trackIds) {
        const index = pl.trackIds.indexOf(trackId);
        if (index === -1) return pl;
        const newTrackIds = [...pl.trackIds];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newTrackIds.length) {
          const temp = newTrackIds[index];
          newTrackIds[index] = newTrackIds[targetIndex];
          newTrackIds[targetIndex] = temp;
          return { ...pl, trackIds: newTrackIds };
        }
      }
      return pl;
    }));
  };

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, queue, progress, isFullPlayerOpen, isShuffle, isRepeat, notifications, playlists,
      recentlyPlayed, likedTrackIds, followedUserIds, trackToAddToPlaylist, optionsTrack, activePlaylistId, userProfile, genesisContractAddress,
      volume, isMuted,
      playTrack, togglePlay, nextTrack, prevTrack, addToQueue, playAll, seek, setVolume, toggleMute, toggleLikeTrack, toggleFollowUser, closePlayer, setFullPlayerOpen,
      toggleShuffle, toggleRepeat, addNotification, setTrackToAddToPlaylist, setOptionsTrack, setActivePlaylistId, addTrackToPlaylist, removeTrackFromPlaylist,
      reorderTrackInPlaylist, createNewPlaylist, deletePlaylist, updatePlaylist, createRecommendedPlaylist, clearRecentlyPlayed, setUserProfile, setGenesisContractAddress, resetProtocol,
      userTracks, userNFTs, addUserTrack, addUserNFT
    }}>
      {children}
      
      {/* Global Notifications UI */}
      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in slide-in-from-right duration-300 border ${
            n.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 
            n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
            n.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
            'bg-blue-500/10 border-blue-500/50 text-blue-400'}`}>
            {n.message}
          </div>
        ))}
      </div>

      {trackToAddToPlaylist && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setTrackToAddToPlaylist(null)}></div>
          <div className="relative glass w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black uppercase tracking-tighter">Sync to Playlist</h3>
               <button onClick={() => setTrackToAddToPlaylist(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
             </div>
             
             <div className="max-h-80 overflow-y-auto no-scrollbar space-y-3 mb-8">
               {/* Create New Option */}
               <button 
                onClick={() => {
                  const name = prompt("Enter new playlist name:");
                  if (name && name.trim()) {
                    createNewPlaylist(name.trim(), "", trackToAddToPlaylist);
                    setTrackToAddToPlaylist(null);
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-500/40 transition-all text-left group"
               >
                 <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                   <i className="fas fa-plus"></i>
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-black uppercase text-blue-400">Create New Sequence</p>
                   <p className="text-[8px] font-black text-blue-400/40 uppercase tracking-widest">Initialize fresh protocol</p>
                 </div>
               </button>

               <div className="h-px bg-white/5 my-4"></div>

               {playlists.length > 0 ? (
                 playlists.map(pl => (
                   <button 
                    key={pl.id}
                    onClick={() => {
                      addTrackToPlaylist(pl.id, trackToAddToPlaylist);
                      setTrackToAddToPlaylist(null);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-left group"
                   >
                     <img src={pl.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                     <div className="flex-1 min-w-0">
                       <p className="text-xs font-black uppercase truncate group-hover:text-blue-400">{pl.title}</p>
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{pl.trackCount} Syncs</p>
                     </div>
                   </button>
                 ))
               ) : (
                 <p className="text-center py-8 text-[10px] font-black text-white/20 uppercase tracking-widest">No sequences detected</p>
               )}
             </div>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

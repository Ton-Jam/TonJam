import React, { createContext, useContext, useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { Track, Playlist, UserProfile, NFTItem, Artist, Transaction, Post } from '@/types';
import { MOCK_PLAYLISTS, MOCK_USER, MOCK_TRACKS, MOCK_NFTS, MOCK_ARTISTS, MOCK_POSTS, CURATED_PLAYLISTS, JAM_JETTON_MASTER } from '@/constants';
import * as tonService from '@/services/tonService';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDoc,
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  createNewPlaylist: (name: string, description?: string, initialTrack?: Track, coverUrl?: string, isPrivate?: boolean, isCollaborative?: boolean, tags?: string[]) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  generateDiscoverWeekly: () => void;
  createRecommendedPlaylist: () => void;
  clearRecentlyPlayed: () => void;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  setAnthem: (nftId: string | null) => Promise<void>;
  setGenesisContractAddress: (address: string | null) => void;
  userTracks: Track[];
  userNFTs: NFTItem[];
  allTracks: Track[];
  allNFTs: NFTItem[];
  artists: Artist[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
  addUserTrack: (track: Track) => void;
  addUserNFT: (nft: NFTItem, silent?: boolean) => void;
  updateNFT: (nftId: string, updates: Partial<NFTItem>, silent?: boolean) => void;
  recordTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => void;
  purchaseJAM: (amount: string, jamAmount: string) => Promise<void>;
  subscribePremium: (amount: string) => Promise<void>;
  stakeJam: (amount: string) => Promise<void>;
  unstakeJam: (amount: string) => Promise<void>;
  claimJamRewards: () => Promise<void>;
  transactions: Transaction[];
  audioElement: HTMLAudioElement | null;
  analyser: AnalyserNode | null;
  posts: Post[];
  createPost: (post: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  getTrendingTracks: () => Track[];
  getTopNFTTracks: () => Track[];
  getTracksByGenre: (genre: string) => Track[];
  getRecommendations: () => { recommendedTracks: Track[], recommendedNFTs: NFTItem[] };
  jamTrack: (trackId: string) => Promise<void>;
  activeJamRoom: { id: string, name: string, listeners: number, currentTrack: Track | null } | null;
  joinJamRoom: (roomId: string) => void;
  leaveJamRoom: () => void;
  allPlaylists: Playlist[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDiscoverFiltersOpen: boolean;
  setIsDiscoverFiltersOpen: (isOpen: boolean) => void;
  isCreatePlaylistModalOpen: boolean;
  setIsCreatePlaylistModalOpen: (isOpen: boolean) => void;
  updateRoyaltyConfig: (artistId: string, config: Artist['royaltyConfig']) => void;
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
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

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

  const [activeJamRoom, setActiveJamRoom] = useState<{ id: string, name: string, listeners: number, currentTrack: Track | null } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscoverFiltersOpen, setIsDiscoverFiltersOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tonjam_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('tonjam_posts');
    return saved ? JSON.parse(saved) : MOCK_POSTS;
  });

  const allPlaylists = useMemo(() => {
    return [...CURATED_PLAYLISTS, ...playlists];
  }, [playlists]);

  const getTrendingTracks = () => {
    return [...allTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
  };

  const getTopNFTTracks = () => {
    return allTracks.filter(t => t.isNFT).sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0')).slice(0, 10);
  };

  const getTracksByGenre = (genre: string) => {
    return allTracks.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
  };

  const getRecommendations = () => {
    const historyIds = new Set(recentlyPlayed.map(t => t.id));
    const likedIds = new Set(likedTrackIds);
    const nftTrackIds = new Set(userNFTs.map(n => n.trackId));
    
    const preferredGenres = new Map<string, number>();
    const preferredArtists = new Map<string, number>();
    
    if (userProfile.favoriteGenres) {
      userProfile.favoriteGenres.forEach(genre => {
        preferredGenres.set(genre, (preferredGenres.get(genre) || 0) + 5);
      });
    }

    const analyzeTrack = (trackId: string, weight: number) => {
      const track = allTracks.find(t => t.id === trackId);
      if (track) {
        preferredGenres.set(track.genre, (preferredGenres.get(track.genre) || 0) + weight);
        preferredArtists.set(track.artistId || track.artist, (preferredArtists.get(track.artistId || track.artist) || 0) + weight);
      }
    };
    
    recentlyPlayed.forEach(t => analyzeTrack(t.id, 1));
    likedTrackIds.forEach(id => analyzeTrack(id, 2));
    userNFTs.forEach(n => analyzeTrack(n.trackId, 3));
    
    const topGenres = Array.from(preferredGenres.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    const topArtists = Array.from(preferredArtists.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    
    // Social signals: tracks mentioned in posts or from followed artists
    const socialSignalTrackIds = new Set<string>();
    posts.forEach(post => {
      if (post.trackId) socialSignalTrackIds.add(post.trackId);
    });
    
    const followedArtistIds = new Set(followedUserIds);

    const getTrackScore = (track: Track) => {
      let score = 0;
      
      // Genre match
      if (topGenres.includes(track.genre)) {
        score += 5 - Math.min(topGenres.indexOf(track.genre), 4);
      }
      
      // Artist match
      if (topArtists.includes(track.artistId || track.artist)) {
        score += 8 - Math.min(topArtists.indexOf(track.artistId || track.artist), 7);
      }
      
      // Followed artist signal
      if (followedArtistIds.has(track.artistId || '')) {
        score += 10;
      }
      
      // Social signal
      if (socialSignalTrackIds.has(track.id)) {
        score += 4;
      }

      // Up-and-coming signal (new tracks with some traction)
      const isNew = parseInt(track.id) > 10; // Simple heuristic for "new"
      if (isNew && (track.playCount || 0) > 100 && (track.playCount || 0) < 5000) {
        score += 6;
      }

      // Trending signal
      if ((track.playCount || 0) > 10000) {
        score += 3;
      }
      
      return score;
    };

    const recommendedTracks = allTracks.filter(track => {
      if (historyIds.has(track.id) || likedIds.has(track.id) || nftTrackIds.has(track.id)) {
        return false;
      }
      return getTrackScore(track) > 5;
    }).sort((a, b) => getTrackScore(b) - getTrackScore(a)).slice(0, 15);

    if (recommendedTracks.length < 10) {
      const trending = getTrendingTracks().filter(t => 
        !recommendedTracks.find(rt => rt.id === t.id) && 
        !historyIds.has(t.id) && 
        !likedIds.has(t.id) && 
        !nftTrackIds.has(t.id)
      );
      recommendedTracks.push(...trending.slice(0, 15 - recommendedTracks.length));
    }

    const recommendedNFTs = allNFTs.filter(nft => {
      if (userNFTs.find(un => un.id === nft.id)) {
        return false;
      }
      
      const track = allTracks.find(t => t.id === nft.trackId);
      if (!track) return false;

      let score = 0;
      if (topGenres.includes(track.genre)) score += 5;
      if (topArtists.includes(track.artistId || track.artist)) score += 5;
      if (followedArtistIds.has(track.artistId || '')) score += 8;
      
      // Trending NFT signal
      if (parseFloat(nft.price) > 50) score += 3;
      
      return score > 5;
    }).sort((a, b) => parseFloat(b.price) - parseFloat(a.price)).slice(0, 10);

    return { recommendedTracks, recommendedNFTs };
  };

  useEffect(() => {
    localStorage.setItem('tonjam_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('tonjam_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      const streamPaymentTimeout = setTimeout(() => {
        // Simulate a micro-payment for the stream
        const streamPrice = 0.001; // 0.001 TON per stream
        const platformFee = streamPrice * 0.10;
        const artistShare = streamPrice - platformFee;
        
        const artist = artists.find(a => a.id === currentTrack.artistId || a.name === currentTrack.artist);
        
        recordTransaction({
          type: 'stream',
          amount: streamPrice.toString(),
          platformFee: platformFee.toFixed(6),
          artistShare: artistShare.toFixed(6),
          recipientAddress: artist?.walletAddress || 'EQ_ARTIST_FALLBACK_ADDRESS',
          senderAddress: userProfile.walletAddress,
          trackId: currentTrack.id,
          trackTitle: currentTrack.title
        });
        
        addNotification(`Stream royalty distributed: ${artistShare.toFixed(6)} TON to ${currentTrack.artist}`, "info");
      }, 10000); // Trigger after 10 seconds of playback
      
      return () => clearTimeout(streamPaymentTimeout);
    }
  }, [isPlaying, currentTrack?.id]);

  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLLOWED_USERS);
    return saved ? JSON.parse(saved) : (userProfile.followedUserIds || []);
  });

  useEffect(() => {
    setUserProfile(prev => ({ 
      ...prev, 
      followedUserIds,
      followedArtists: followedUserIds, // Assuming all followed users are artists for now or we just sync them
      following: followedUserIds.length
    }));
  }, [followedUserIds]);

  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFTItem[]>([]);
  const [firebaseTracks, setFirebaseTracks] = useState<Track[]>([]);
  const [firebaseNFTs, setFirebaseNFTs] = useState<NFTItem[]>([]);

  // Sync with Firebase
  useEffect(() => {
    const tracksQuery = query(collection(db, 'tracks'), orderBy('id', 'desc'));
    const unsubscribeTracks = onSnapshot(tracksQuery, (snapshot) => {
      const tracks = snapshot.docs.map(doc => doc.data() as Track);
      setFirebaseTracks(tracks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tracks');
    });

    const nftsQuery = query(collection(db, 'nfts'), orderBy('id', 'desc'));
    const unsubscribeNFTs = onSnapshot(nftsQuery, (snapshot) => {
      const nfts = snapshot.docs.map(doc => doc.data() as NFTItem);
      setFirebaseNFTs(nfts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'nfts');
    });

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => {
      unsubscribeTracks();
      unsubscribeNFTs();
    };
  }, []);

  // Auth Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            ...MOCK_USER,
            id: user.uid,
            name: user.displayName || 'Anonymous',
            avatar: user.photoURL || 'https://picsum.photos/seed/user/200/200',
            walletAddress: '', // To be updated by user
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setUserProfile(newProfile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const allTracks = React.useMemo(() => {
    const combined = [...firebaseTracks, ...MOCK_TRACKS];
    // De-duplicate by ID
    const unique = Array.from(new Map(combined.map(t => [t.id, t])).values());
    return unique;
  }, [firebaseTracks]);

  const allNFTs = React.useMemo(() => {
    const combined = [...firebaseNFTs, ...MOCK_NFTS];
    // De-duplicate by ID
    const unique = Array.from(new Map(combined.map(n => [n.id, n])).values());
    return unique;
  }, [firebaseNFTs]);

  useEffect(() => {
    if (userProfile.id) {
      setUserTracks(firebaseTracks.filter(t => t.artistId === userProfile.id));
      setUserNFTs(firebaseNFTs.filter(n => n.artistId === userProfile.id || n.owner === userProfile.walletAddress));
    }
  }, [firebaseTracks, firebaseNFTs, userProfile]);

  const updateNFT = async (nftId: string, updates: Partial<NFTItem>, silent: boolean = false) => {
    try {
      await updateDoc(doc(db, 'nfts', nftId), updates);
      if (!silent) addNotification("Asset protocol updated", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `nfts/${nftId}`);
    }
  };

  const addUserTrack = async (track: Track) => {
    try {
      await setDoc(doc(db, 'tracks', track.id), track);
      addNotification(`Track "${track.title}" uploaded`, "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tracks/${track.id}`);
    }
  };

  const addUserNFT = async (nft: NFTItem, silent: boolean = false) => {
    try {
      await setDoc(doc(db, 'nfts', nft.id), nft);
      if (!silent) addNotification(`NFT "${nft.title}" minted`, "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `nfts/${nft.id}`);
    }
  };

  const setAnthem = async (nftId: string | null) => {
    try {
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        anthemId: nftId || undefined
      }));

      // Update Firebase if user is logged in
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          anthemId: nftId
        });
      }

      if (nftId) {
        const nft = allNFTs.find(n => n.id === nftId);
        addNotification(`"${nft?.title || 'NFT'}" set as your profile anthem!`, 'success');
      } else {
        addNotification("Anthem removed from profile", "info");
      }
    } catch (error) {
      console.error("Error setting anthem:", error);
      addNotification("Failed to update anthem", "error");
    }
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

  /* Fix: Added effect to persist recently played tracks to local storage */
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
    addNotification("App reset to initial state", "warning");
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (userProfile.walletAddress) {
        const balance = await tonService.getJettonBalance(userProfile.walletAddress, JAM_JETTON_MASTER);
        setUserProfile(prev => ({ ...prev, jamBalance: balance }));
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [userProfile.walletAddress]);

  // Staking Reward Accumulation
  useEffect(() => {
    const interval = setInterval(() => {
      const staked = parseFloat(userProfile.stakedJam || '0');
      if (staked > 0) {
        // 15% APR roughly
        // 0.15 / (365 * 24 * 60 * 6) -> rewards per 10 seconds
        const rewardRate = 0.15 / (365 * 24 * 60 * 6); 
        const reward = staked * rewardRate;
        
        setUserProfile(prev => ({
          ...prev,
          pendingJamRewards: (parseFloat(prev.pendingJamRewards || '0') + reward).toString()
        }));
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [userProfile.stakedJam]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          // NOTE: Disabling Web Audio API connection for now to prevent CORS-related muting issues.
          // This ensures playback works reliably even if the mock audio servers don't send correct CORS headers.
          const source = audioContextRef.current.createMediaElementSource(audioRef.current);
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      } catch (err) {
        console.error("Failed to initialize Web Audio API:", err);
      }
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
            if (error.name !== 'AbortError' && !error.message?.includes('interrupted'))
              console.error("Playback error:", error);
          });
        }
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    /* Sync volume and mute state */
    audio.volume = isMuted ? 0 : volume;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, currentTrack, isRepeat, isShuffle]);

  const addNotification = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info', duration: number = 3000) => {
    if (type === 'success') toast.success(message, { duration });
    else if (type === 'error') toast.error(message, { duration });
    else if (type === 'warning') toast.warning(message, { duration });
    else toast.info(message, { duration });
  };

  useEffect(() => {
    if (tonAddress && auth.currentUser && userProfile.walletAddress !== tonAddress) {
      const updateWallet = async () => {
        try {
          const userRef = doc(db, 'users', auth.currentUser!.uid);
          await updateDoc(userRef, {
            walletAddress: tonAddress
          });
          setUserProfile(prev => ({ ...prev, walletAddress: tonAddress }));
          addNotification("Wallet address synced with profile", "success");
        } catch (error) {
          console.error("Error syncing wallet address:", error);
        }
      };
      updateWallet();
    }
  }, [tonAddress, auth.currentUser, userProfile.walletAddress]);

  const recordTransaction = (txData: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substr(2, 40)}`
    };
    
    setTransactions(prev => [newTx, ...prev]);
    
    // Update user/artist earnings based on transaction
    if (txData.type === 'nft_sale' || txData.type === 'stream') {
      const share = parseFloat(txData.artistShare);
      
      // If the recipient is the current user, update their profile earnings
      if (txData.recipientAddress === userProfile.walletAddress) {
        setUserProfile(prev => ({
          ...prev,
          earnings: (parseFloat(prev.earnings || '0') + share).toFixed(4),
          streamingEarnings: txData.type === 'stream' 
            ? (parseFloat(prev.streamingEarnings || '0') + share).toFixed(4)
            : prev.streamingEarnings,
          nftEarnings: txData.type === 'nft_sale'
            ? (parseFloat(prev.nftEarnings || '0') + share).toFixed(4)
            : prev.nftEarnings
        }));
      }
      
      // Update the artist's earnings in the artists list if they exist
      if (txData.trackId || txData.nftId) {
        setArtists(prev => prev.map(artist => {
          if (artist.walletAddress === txData.recipientAddress || artist.id === (txData.trackId ? MOCK_TRACKS.find(t => t.id === txData.trackId)?.artistId : MOCK_NFTS.find(n => n.id === txData.nftId)?.artistId)) {
            const currentStreaming = parseFloat(artist.earnings?.streaming || '0');
            const currentNft = parseFloat(artist.earnings?.nftSales || '0');
            const newStreaming = txData.type === 'stream' ? currentStreaming + share : currentStreaming;
            const newNft = txData.type === 'nft_sale' ? currentNft + share : currentNft;
            
            return {
              ...artist,
              earnings: {
                streaming: newStreaming.toFixed(4),
                nftSales: newNft.toFixed(4),
                total: (newStreaming + newNft).toFixed(4)
              }
            };
          }
          return artist;
        }));
      }
    }
  };

  const purchaseJAM = async (amount: string, jamAmount: string) => {
    try {
      if (!tonConnectUI.connected) {
        addNotification("Please connect your wallet first", "error");
        return;
      }

      const success = await tonService.purchaseJAM(tonConnectUI, amount, jamAmount);
      
      if (success) {
        recordTransaction({
          type: 'jam_purchase',
          amount: amount,
          platformFee: '0',
          artistShare: '0',
          recipientAddress: 'PLATFORM_WALLET',
          senderAddress: userProfile.walletAddress,
          trackTitle: `Purchased ${jamAmount} JAM`
        });
        
        setUserProfile(prev => ({
          ...prev,
          jamBalance: (parseFloat(prev.jamBalance || '0') + parseFloat(jamAmount)).toString()
        }));
        
        addNotification(`Successfully purchased ${jamAmount} JAM!`, 'success');
      }
    } catch (error) {
      addNotification("Transaction failed or cancelled", "error");
    }
  };

  const subscribePremium = async (amount: string) => {
    try {
      if (!tonConnectUI.connected) {
        addNotification("Please connect your wallet first", "error");
        return;
      }

      const success = await tonService.subscribePremium(tonConnectUI, amount);
      
      if (success) {
        recordTransaction({
          type: 'premium_subscription',
          amount: amount,
          platformFee: amount,
          artistShare: '0',
          recipientAddress: 'PLATFORM_WALLET',
          senderAddress: userProfile.walletAddress,
          trackTitle: 'Premium Subscription'
        });
        
        setUserProfile(prev => ({
          ...prev,
          isPremium: true
        }));
        
        addNotification('Welcome to TonJam Premium!', 'success');
      }
    } catch (error) {
      addNotification("Transaction failed or cancelled", "error");
    }
  };

  const stakeJam = async (amount: string) => {
    const currentBalance = parseFloat(userProfile.jamBalance || '0');
    const stakeAmount = parseFloat(amount);

    if (stakeAmount <= 0) {
      addNotification("Invalid stake amount", "error");
      return;
    }

    if (currentBalance < stakeAmount) {
      addNotification("Insufficient JAM balance", "error");
      return;
    }

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setUserProfile(prev => ({
      ...prev,
      jamBalance: (currentBalance - stakeAmount).toString(),
      stakedJam: (parseFloat(prev.stakedJam || '0') + stakeAmount).toString(),
      lastStakingUpdate: new Date().toISOString()
    }));

    recordTransaction({
      type: 'stake',
      amount: '0', // Staking is internal to JAM
      platformFee: '0',
      artistShare: '0',
      recipientAddress: 'STAKING_CONTRACT',
      senderAddress: userProfile.walletAddress,
      trackTitle: `Staked ${amount} JAM`
    });

    addNotification(`Successfully staked ${amount} JAM`, 'success');
  };

  const unstakeJam = async (amount: string) => {
    const currentStaked = parseFloat(userProfile.stakedJam || '0');
    const unstakeAmount = parseFloat(amount);

    if (unstakeAmount <= 0) {
      addNotification("Invalid unstake amount", "error");
      return;
    }

    if (currentStaked < unstakeAmount) {
      addNotification("Insufficient staked JAM", "error");
      return;
    }

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setUserProfile(prev => ({
      ...prev,
      stakedJam: (currentStaked - unstakeAmount).toString(),
      jamBalance: (parseFloat(prev.jamBalance || '0') + unstakeAmount).toString(),
      lastStakingUpdate: new Date().toISOString()
    }));

    recordTransaction({
      type: 'unstake',
      amount: '0',
      platformFee: '0',
      artistShare: '0',
      recipientAddress: userProfile.walletAddress || 'USER_WALLET',
      senderAddress: 'STAKING_CONTRACT',
      trackTitle: `Unstaked ${amount} JAM`
    });

    addNotification(`Successfully unstaked ${amount} JAM`, 'success');
  };

  const claimJamRewards = async () => {
    const pendingRewards = parseFloat(userProfile.pendingJamRewards || '0');

    if (pendingRewards <= 0) {
      addNotification("No rewards to claim", "info");
      return;
    }

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setUserProfile(prev => ({
      ...prev,
      pendingJamRewards: '0',
      jamBalance: (parseFloat(prev.jamBalance || '0') + pendingRewards).toString(),
      lastStakingUpdate: new Date().toISOString()
    }));

    recordTransaction({
      type: 'claim_rewards',
      amount: '0',
      platformFee: '0',
      artistShare: '0',
      recipientAddress: userProfile.walletAddress || 'USER_WALLET',
      senderAddress: 'STAKING_CONTRACT',
      trackTitle: `Claimed ${pendingRewards.toFixed(4)} JAM rewards`
    });

    addNotification(`Successfully claimed ${pendingRewards.toFixed(4)} JAM rewards`, 'success');
  };

  const createPost = (postData: Partial<Post>) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      userHandle: userProfile.handle,
      content: '',
      likes: 0,
      comments: 0,
      reposts: 0,
      timestamp: 'Just now',
      ...postData
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const jamTrack = async (trackId: string) => {
    const jamCost = 1; // 1 JAM to boost
    const currentBalance = parseFloat(userProfile.jamBalance || '0');

    if (currentBalance < jamCost) {
      addNotification("Insufficient JAM balance to boost track", "error");
      return;
    }

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setUserProfile(prev => ({
      ...prev,
      jamBalance: (currentBalance - jamCost).toString()
    }));

    setPosts(prev => prev.map(p => {
      if (p.trackId === trackId) {
        return { ...p, likes: p.likes + 10 }; // Jamming boosts likes significantly in the feed
      }
      return p;
    }));

    addNotification("Track Jammed! Signal boosted across the network.", "success");
    
    recordTransaction({
      type: 'jam_purchase',
      amount: '0',
      platformFee: '0',
      artistShare: '0.9', // 90% goes to artist
      recipientAddress: MOCK_TRACKS.find(t => t.id === trackId)?.artistId || 'ARTIST',
      senderAddress: userProfile.walletAddress,
      trackTitle: `Jammed Track: ${MOCK_TRACKS.find(t => t.id === trackId)?.title}`
    });
  };

  const joinJamRoom = (roomId: string) => {
    const room = {
      id: roomId,
      name: roomId === 'genesis' ? 'Genesis Node' : 'Cyber Drift Room',
      listeners: Math.floor(Math.random() * 50) + 10,
      currentTrack: MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)]
    };
    setActiveJamRoom(room);
    addNotification(`Joined Jam Room: ${room.name}`, "success");
    if (room.currentTrack) playTrack(room.currentTrack);
  };

  const leaveJamRoom = () => {
    setActiveJamRoom(null);
    addNotification("Disconnected from Jam Room", "info");
  };

  const updateRoyaltyConfig = (artistId: string, config: Artist['royaltyConfig']) => {
    setArtists(prev => prev.map(artist => 
      artist.id === artistId ? { ...artist, royaltyConfig: config } : artist
    ));
    addNotification("Royalty protocol updated", "success");
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
      // Ensure AudioContext is running
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(err => console.warn("Failed to resume AudioContext:", err));
      }

      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => { });
      }

      setCurrentTrack(track);
      const sourceUrl = track.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

      try {
        // Reset crossOrigin to anonymous for each new track to allow visualizer
        audioRef.current.crossOrigin = "anonymous"; 
        audioRef.current.src = sourceUrl;
        
        playPromiseRef.current = audioRef.current.play();
        if (playPromiseRef.current !== undefined) {
          playPromiseRef.current.catch(error => {
            // Check for common playback errors
            // We'll try fallback for almost any error except user interruption
            const isInterrupted = error.name === 'AbortError' || error.message?.includes('interrupted');
            
            if (!isInterrupted) {
              console.warn("Primary source failed (CORS, Format, or Network), attempting fallback...", error);
              if (audioRef.current) {
                // First try: Same URL but without crossOrigin (fixes CORS issues)
                // We need to reset the src to trigger a reload with the new crossOrigin setting
                audioRef.current.removeAttribute('crossorigin');
                audioRef.current.src = sourceUrl; 
                
                const fallbackPromise = audioRef.current.play();
                if (fallbackPromise !== undefined) {
                  fallbackPromise.catch(e => {
                    // Second try: Fallback URL
                    console.warn("Same URL without CORS failed, trying SoundHelix fallback...", e);
                    if (audioRef.current) {
                      audioRef.current.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                      audioRef.current.play().catch(err => {
                        if (err.name !== 'AbortError' && !err.message?.includes('interrupted')) {
                          console.error("Fallback failed:", err);
                          addNotification("Playback failed. Please check your connection.", "error");
                          setIsPlaying(false);
                        }
                      });
                    }
                  });
                }
              }
            }
          });
        }
        setIsPlaying(true);
      } catch (err) {
        console.error("Audio initialization error:", err);
        addNotification("Failed to initialize audio protocol", "error");
      }
    }

    if (!queue.find(t => t.id === track.id))
      setQueue(prev => [...prev, track]);
  };

  const playAll = (tracks: Track[]) => {
    if (tracks.length === 0) return;
    setQueue(tracks);
    playTrack(tracks[0]);
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      /* Wait for any pending play to finish before pausing to avoid interruption error */
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => { });
      }
      audioRef.current.pause();
    } else {
      try {
        // Ensure AudioContext is running
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume().catch(err => console.warn("Failed to resume AudioContext:", err));
        }
        
        playPromiseRef.current = audioRef.current.play();
        if (playPromiseRef.current !== undefined) {
          playPromiseRef.current.catch(error => {
            if (error.name !== 'AbortError' && !error.message?.includes('interrupted')) {
              console.error("Playback error during toggle:", error);
              /* If it failed because of source issues, try to reload */
              if (error.message.includes('supported source') && currentTrack) {
                audioRef.current!.src = currentTrack.audioUrl;
                audioRef.current!.load();
                playPromiseRef.current = audioRef.current!.play();
                playPromiseRef.current.catch(e => {
                  if (e.name !== 'AbortError' && !e.message?.includes('interrupted')) {
                    console.error("Reload play failed:", e);
                  }
                });
              }
            }
          });
        }
      } catch (err) {
        console.error("Toggle play error:", err);
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
    /* Auto-mute if volume is 0, auto-unmute if volume > 0 */
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
    /* If unmuting and volume is 0, set it to a default (e.g. 0.5) */
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
    }
  };

  const toggleLikeTrack = (trackId: string) => {
    setLikedTrackIds(prev => {
      const isLiked = prev.includes(trackId);
      if (isLiked) {
        addNotification("Track removed from favorites", "info");
        return prev.filter(id => id !== trackId);
      } else {
        addNotification("Track added to favorites", "success");
        return [...prev, trackId];
      }
    });
  };

  const [artists, setArtists] = useState<Artist[]>(MOCK_ARTISTS);

  const toggleFollowUser = (userId: string) => {
    setFollowedUserIds(prev => {
      const isFollowing = prev.includes(userId);
      
      // Update artist follower count
      setArtists(currentArtists => 
        currentArtists.map(artist => {
          if (artist.id === userId) {
            return {
              ...artist,
              followers: isFollowing ? Math.max(0, artist.followers - 1) : artist.followers + 1
            };
          }
          return artist;
        })
      );

      // Update userProfile following count and followedUserIds
      setUserProfile(prevProfile => ({
        ...prevProfile,
        following: isFollowing ? Math.max(0, prevProfile.following - 1) : prevProfile.following + 1,
        followedUserIds: isFollowing 
          ? (prevProfile.followedUserIds || []).filter(id => id !== userId)
          : [...(prevProfile.followedUserIds || []), userId],
        followedArtists: isFollowing
          ? (prevProfile.followedArtists || []).filter(id => id !== userId)
          : [...(prevProfile.followedArtists || []), userId]
      }));

      if (isFollowing) {
        addNotification("Unfollowed user", "info");
        return prev.filter(id => id !== userId);
      } else {
        addNotification("Followed user", "success");
        return [...prev, userId];
      }
    });
  };

  const closePlayer = async () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => { });
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

  const createNewPlaylist = (name: string, description?: string, initialTrack?: Track, coverUrl?: string, isPrivate?: boolean, isCollaborative?: boolean, tags?: string[]) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title: name,
      coverUrl: coverUrl || '', /* Leave empty for dynamic collage/placeholder */
      trackCount: initialTrack ? 1 : 0,
      creator: 'You',
      description,
      trackIds: initialTrack ? [initialTrack.id] : [],
      isPrivate,
      isCollaborative,
      tags
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
    addNotification("Playlist deleted", "info");
  };

  const updatePlaylist = (playlistId: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(pl => pl.id === playlistId ? { ...pl, ...updates } : pl));
    addNotification("Playlist updated", "success");
  };

  const generateDiscoverWeekly = () => {
    // Check if Discover Weekly already exists and was updated this week
    const existingIndex = playlists.findIndex(p => p.title === 'Discover Weekly');
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    if (existingIndex !== -1) {
      const existing = playlists[existingIndex];
      // If we have a timestamp and it's less than a week old, don't regenerate
      if (existing.updatedAt && new Date(existing.updatedAt) > oneWeekAgo) {
        return;
      }
    }

    // Analyze user data
    const historyIds = new Set(recentlyPlayed.map(t => t.id));
    const likedIds = new Set(likedTrackIds);
    const nftTrackIds = new Set(userNFTs.map(n => n.trackId));
    
    // Find preferred genres and artists
    const preferredGenres = new Map<string, number>();
    const preferredArtists = new Map<string, number>();
    
    const analyzeTrack = (trackId: string, weight: number) => {
      const track = allTracks.find(t => t.id === trackId);
      if (track) {
        preferredGenres.set(track.genre, (preferredGenres.get(track.genre) || 0) + weight);
        preferredArtists.set(track.artistId || track.artist, (preferredArtists.get(track.artistId || track.artist) || 0) + weight);
      }
    };
    
    recentlyPlayed.forEach(t => analyzeTrack(t.id, 1));
    likedTrackIds.forEach(id => analyzeTrack(id, 2));
    userNFTs.forEach(n => analyzeTrack(n.trackId, 3));
    
    // Sort preferences
    const topGenres = Array.from(preferredGenres.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    const topArtists = Array.from(preferredArtists.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    
    // Generate recommendations
    const recommendations = allTracks.filter(track => {
      // Don't recommend tracks they already know well (liked or own NFT)
      if (likedIds.has(track.id) || nftTrackIds.has(track.id)) return false;
      
      // Recommend based on genre or artist
      const matchesGenre = topGenres.slice(0, 3).includes(track.genre);
      const matchesArtist = topArtists.slice(0, 3).includes(track.artistId || track.artist);
      
      return matchesGenre || matchesArtist;
    });
    
    // If we don't have enough recommendations, add some trending tracks
    let finalTracks = recommendations.sort(() => 0.5 - Math.random()).slice(0, 10);
    if (finalTracks.length < 10) {
      const trending = getTrendingTracks().filter(t => !finalTracks.find(ft => ft.id === t.id));
      finalTracks = [...finalTracks, ...trending].slice(0, 10);
    }
    
    const newPlaylist: Playlist = {
      id: existingIndex !== -1 ? playlists[existingIndex].id : `dw-${Date.now()}`,
      title: 'Discover Weekly',
      coverUrl: 'https://picsum.photos/seed/discover/400/400',
      trackCount: finalTracks.length,
      creator: 'TonJam AI',
      description: "Your weekly dose of fresh music, personalized based on your listening history, likes, and NFT collection.",
      trackIds: finalTracks.map(t => t.id),
      updatedAt: now.toISOString()
    };
    
    setPlaylists(prev => {
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newPlaylist;
        return updated;
      }
      return [newPlaylist, ...prev];
    });
    
    addNotification('Your Discover Weekly playlist has been updated!', 'success');
  };

  const createRecommendedPlaylist = () => {
    /* Simulate recommendation logic by picking random tracks */
    const shuffled = [...MOCK_TRACKS].sort(() => 0.5 - Math.random());
    const recommendedTracks = shuffled.slice(0, 5);
    const name = `AI Playlist ${playlists.length + 1}`;
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title: name,
      coverUrl: '', /* Leave empty for dynamic collage */
      trackCount: recommendedTracks.length,
      creator: 'TonJam AI',
      description: "AI playlist generated based on your listening history.",
      trackIds: recommendedTracks.map(t => t.id)
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    addNotification(`AI Playlist "${name}" created with ${recommendedTracks.length} tracks`, 'success');
  };

  /* Fix: Implemented clearRecentlyPlayed function to purge history */
  const clearRecentlyPlayed = () => {
    setRecentlyPlayed([]);
    addNotification("Playback history cleared", "info");
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
      currentTrack, isPlaying, queue, progress, isFullPlayerOpen, isShuffle, isRepeat,
      notifications, playlists, recentlyPlayed, likedTrackIds, followedUserIds, trackToAddToPlaylist,
      optionsTrack, activePlaylistId, userProfile, genesisContractAddress, volume, isMuted,
      playTrack, togglePlay, nextTrack, prevTrack, addToQueue, playAll, seek, setVolume, toggleMute,
      toggleLikeTrack, toggleFollowUser, closePlayer, setFullPlayerOpen, toggleShuffle, toggleRepeat,
      addNotification, setTrackToAddToPlaylist, setOptionsTrack, setActivePlaylistId, addTrackToPlaylist,
      removeTrackFromPlaylist, reorderTrackInPlaylist, createNewPlaylist, deletePlaylist, updatePlaylist,
      generateDiscoverWeekly, createRecommendedPlaylist, clearRecentlyPlayed, setUserProfile, setAnthem, setGenesisContractAddress, userTracks, userNFTs,
      allTracks, allNFTs, artists, setArtists, addUserTrack, addUserNFT, updateNFT, recordTransaction, purchaseJAM, subscribePremium, stakeJam, unstakeJam, claimJamRewards, transactions, audioElement: audioRef.current, analyser: analyserRef.current,
      posts, createPost, deletePost, getTrendingTracks, getTopNFTTracks, getTracksByGenre, getRecommendations, jamTrack, activeJamRoom, joinJamRoom, leaveJamRoom, allPlaylists,
      searchQuery, setSearchQuery, isDiscoverFiltersOpen, setIsDiscoverFiltersOpen, isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen,
      updateRoyaltyConfig
    }}>
      {children}
      {trackToAddToPlaylist && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setTrackToAddToPlaylist(null)}></div>
          <div className="relative bg-[#0a0a0a] border border-border/50 w-full max-w-sm rounded-[5px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold uppercase tracking-tighter">Add to Playlist</h3>
              <button onClick={() => setTrackToAddToPlaylist(null)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto no-scrollbar space-y-3 mb-8">
              {/* Create New Option */}
              <div className="p-4 rounded-[5px] bg-neutral-600/10 border border-neutral-500/20 transition-all">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-[5px] bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase text-blue-400">Create New Playlist</p>
                  </div>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('playlistName') as HTMLInputElement;
                  const name = input.value.trim();
                  if (name) {
                    createNewPlaylist(name, "", trackToAddToPlaylist);
                    setTrackToAddToPlaylist(null);
                  }
                }} className="flex gap-2">
                  <input name="playlistName" type="text" placeholder="Playlist Name" className="flex-1 bg-background/50 rounded-[5px] px-3 py-2 text-xs text-foreground outline-none focus:border-neutral-500 border border-transparent transition-all" autoFocus />
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-all">Create</button>
                </form>
              </div>
              <div className="h-px bg-muted/50 my-4"></div>
              {playlists.length > 0 ? (
                playlists.map(pl => (
                  <button key={pl.id} onClick={() => { addTrackToPlaylist(pl.id, trackToAddToPlaylist); setTrackToAddToPlaylist(null); }} className="w-full flex items-center gap-4 p-4 rounded-[5px] bg-muted/50 hover:bg-muted transition-all text-left group">
                    <div className="w-10 h-10 rounded-[5px] bg-[#111] overflow-hidden flex-shrink-0">
                      {pl.coverUrl ? (
                        <img src={pl.coverUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                          <i className="fas fa-music text-xs"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase truncate group-hover:text-blue-400 transition-colors">{pl.title}</p>
                      <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">{pl.trackCount} Tracks</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-plus text-[10px] text-muted-foreground/80"></i>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center py-8 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No playlists found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Classic Track Option Screen */}
      {optionsTrack && (
        <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setOptionsTrack(null)}></div>
          <div className="relative bg-[#111] border-t sm:border border-border w-full max-w-md rounded-t-[20px] sm:rounded-[5px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex items-center gap-4 bg-[#111]">
              <img src={optionsTrack.coverUrl} className="w-16 h-16 rounded-[5px] object-cover shadow-lg" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold uppercase tracking-tight truncate text-foreground">{optionsTrack.title}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">{optionsTrack.artist}</p>
              </div>
              <button onClick={() => setOptionsTrack(null)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Actions List */}
            <div className="p-2 bg-[#111]">
              <OptionItem 
                icon="fas fa-play" 
                label="Play Now" 
                onClick={() => { playTrack(optionsTrack); setOptionsTrack(null); }} 
              />
              <OptionItem 
                icon="fas fa-list-ul" 
                label="Add to Queue" 
                onClick={() => { addToQueue(optionsTrack); setOptionsTrack(null); addNotification("Added to queue", "success"); }} 
              />
              <OptionItem 
                icon="fas fa-plus-square" 
                label="Add to Playlist" 
                onClick={() => { setTrackToAddToPlaylist(optionsTrack); setOptionsTrack(null); }} 
              />
              <div className="h-px bg-muted/50 my-2 mx-4"></div>
              <OptionItem 
                icon="fas fa-heart" 
                label={likedTrackIds.includes(optionsTrack.id) ? "Remove from Liked" : "Add to Liked"} 
                onClick={() => { toggleLikeTrack(optionsTrack.id); setOptionsTrack(null); }} 
              />
              <OptionItem 
                icon="fas fa-user" 
                label="Go to Artist" 
                onClick={() => { /* Navigation logic would go here, need navigate from router */ setOptionsTrack(null); }} 
              />
              <OptionItem 
                icon="fas fa-share-alt" 
                label="Share Signal" 
                onClick={() => { 
                  const shareUrl = `${window.location.origin}/#/track/${optionsTrack.id}`;
                  const shareData = {
                    title: optionsTrack.title,
                    text: `Check out ${optionsTrack.title} by ${optionsTrack.artist} on TonJam!`,
                    url: shareUrl
                  };

                  if (navigator.share) {
                    navigator.share(shareData).catch((err) => {
                      if (err.name !== 'AbortError') {
                        console.error('Error sharing:', err);
                      }
                    });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    addNotification("Link copied to clipboard", "success");
                  }
                  setOptionsTrack(null); 
                }} 
              />
              {optionsTrack.isNFT && (
                <OptionItem 
                  icon="fas fa-gem" 
                  label="View NFT Details" 
                  onClick={() => { setOptionsTrack(null); }} 
                  highlight
                />
              )}
            </div>

            {/* Close Button Mobile */}
            <div className="p-4 sm:hidden">
              <button 
                onClick={() => setOptionsTrack(null)}
                className="w-full py-4 bg-muted/50 rounded-[5px] text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
};

const OptionItem = ({ icon, label, onClick, highlight }: { icon: string; label: string; onClick: () => void; highlight?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-[5px] transition-all hover:bg-muted/50 group text-left ${highlight ? 'text-blue-500' : 'text-muted-foreground/80 hover:text-foreground'}`}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${highlight ? 'bg-blue-500/10' : 'bg-muted/50 group-hover:bg-muted'}`}>
      <i className={`${icon} text-xs`}></i>
    </div>
    <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
  </button>
);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

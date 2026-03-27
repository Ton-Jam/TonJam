import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Track, Playlist, UserProfile, NFTItem, Artist, Transaction, Post, ExclusiveContent, Task } from '@/types';
import { MOCK_PLAYLISTS, MOCK_USER, MOCK_TRACKS, MOCK_NFTS, MOCK_ARTISTS, MOCK_POSTS, CURATED_PLAYLISTS, JAM_JETTON_MASTER } from '@/constants';
import * as tonService from '@/services/tonService';
import { supabase } from '@/lib/supabase';
import { getPlaceholderImage } from '@/lib/utils';

// Helper for Supabase errors
const handleSupabaseError = (error: any, operation: string, path: string) => {
  console.error(`Supabase Error [${operation}] at ${path}:`, error);
  toast.error(`Database error: ${error.message || 'Unknown error'}`);
};

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
  isLoading: boolean;
  isHighFidelity: boolean;
  exclusiveContent: ExclusiveContent[] | null;
  communityPosts: Post[];
  addCommunityPost: (post: Post) => void;
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
  updatePost: (postId: string, updates: Partial<Post>) => void;
  sponsoredPosts: Post[];
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'claimed' | 'progress'>) => Promise<void>;
  updateTaskProgress: (id: string, progress: number) => Promise<void>;
  claimTaskReward: (id: string) => Promise<void>;
  getTrendingTracks: () => Track[];
  getTopNFTTracks: () => Track[];
  getTracksByGenre: (genre: string) => Track[];
  getRecommendations: () => { recommendedTracks: Track[], recommendedNFTs: NFTItem[] };
  jamTrack: (trackId: string) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
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
  marketplaceFilters: {
    genre: string;
    artist: string;
    rarity: string;
    priceRange: [number, number];
    sortBy: string;
  };
  setMarketplaceFilters: React.Dispatch<React.SetStateAction<{
    genre: string;
    artist: string;
    rarity: string;
    priceRange: [number, number];
    sortBy: string;
  }>>;
  jamspaceFilters: {
    sortOrder: 'Newest' | 'Oldest';
    viewMode: 'list' | 'grid';
  };
  setJamspaceFilters: React.Dispatch<React.SetStateAction<{
    sortOrder: 'Newest' | 'Oldest';
    viewMode: 'list' | 'grid';
  }>>;
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
  const [marketplaceFilters, setMarketplaceFilters] = useState<{
    genre: string;
    artist: string;
    rarity: string;
    priceRange: [number, number];
    sortBy: string;
  }>({
    genre: 'All',
    artist: 'All',
    rarity: 'All',
    priceRange: [0, 1000],
    sortBy: 'Newest'
  });

  const [jamspaceFilters, setJamspaceFilters] = useState<{
    sortOrder: 'Newest' | 'Oldest';
    viewMode: 'list' | 'grid';
  }>({
    sortOrder: 'Newest',
    viewMode: 'list'
  });

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

  const [isLoading, setIsLoading] = useState(false);
  const [isHighFidelity, setIsHighFidelity] = useState(false);
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[] | null>(null);

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
  const [sponsoredPosts, setSponsoredPosts] = useState<Post[]>([]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tonjam_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Daily Sync', description: 'Stream 5 tracks today', reward: '5 TJ', points: 50, completed: true, claimed: true, type: 'daily', progress: 5, total: 5, rarity: 'common', priority: 'medium' },
      { id: '2', title: 'Network Supporter', description: 'Follow 3 new artists', reward: '10 TJ', points: 100, completed: false, claimed: false, type: 'daily', progress: 1, total: 3, rarity: 'common', priority: 'low' },
      { id: '3', title: 'Collector Genesis', description: 'Purchase your first NFT', reward: '50 TJ', points: 500, completed: false, claimed: false, type: 'achievement', progress: 0, total: 1, rarity: 'rare', priority: 'high' },
      { id: '4', title: 'Signal Broadcaster', description: 'Share a track to JamSpace', reward: '5 TJ', points: 25, completed: false, claimed: false, type: 'daily', progress: 0, total: 1, rarity: 'common', priority: 'low' },
      { id: '5', title: 'High Fidelity', description: 'Listen for 10 hours total', reward: '100 TJ', points: 1000, completed: true, claimed: false, type: 'milestone', progress: 10, total: 10, rarity: 'epic', priority: 'medium' },
      { id: '6', title: 'Legend of TON', description: 'Stake 10,000 JAM for 30 days', reward: '500 TJ', points: 5000, completed: false, claimed: false, type: 'milestone', progress: 12, total: 30, rarity: 'legendary', priority: 'high' },
      { id: '7', title: 'TON Ecosystem', description: 'Follow TON on X', reward: '20 TJ', points: 200, completed: false, claimed: false, type: 'achievement', progress: 0, total: 1, rarity: 'rare', priority: 'high' },
      { id: '8', title: 'Join the Jam', description: 'Follow TonJam on X', reward: '20 TJ', points: 200, completed: false, claimed: false, type: 'achievement', progress: 0, total: 1, rarity: 'rare', priority: 'high' },
      { id: '9', title: 'Network Expansion', description: 'Invite 3 friends to TonJam', reward: '100 TJ', points: 1000, completed: false, claimed: false, type: 'milestone', progress: 0, total: 3, rarity: 'epic', priority: 'medium' },
    ];
  });

  const addTask = async (taskData: Omit<Task, 'id' | 'completed' | 'claimed' | 'progress'>) => {
    setIsLoading(true);
    try {
      const newTask: Task = {
        ...taskData,
        id: Math.random().toString(36).substr(2, 9),
        completed: false,
        claimed: false,
        progress: 0
      };
      setTasks(prev => [newTask, ...prev]);
      addNotification(`New protocol registered: ${newTask.title}`, "success");
    } catch (error) {
      console.error("Failed to add task:", error);
      addNotification("Failed to register new protocol", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskProgress = async (id: string, progress: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newProgress = Math.min(t.total, progress);
        const isNowCompleted = newProgress >= t.total;
        return { 
          ...t, 
          progress: newProgress,
          completed: isNowCompleted
        };
      }
      return t;
    }));
  };

  const claimTaskReward = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, claimed: true } : t));
    addNotification("Reward claimed successfully!", "success");
  };

  const allPlaylists = useMemo(() => {
    return [...CURATED_PLAYLISTS, ...playlists];
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('tonjam_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('tonjam_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tonjam_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isPlaying && currentTrack && user) {
        const streamPaymentTimeout = setTimeout(() => {
          // Simulate a micro-payment for the stream
          const streamPrice = 0.001; // 0.001 TON per stream
          const platformFee = streamPrice * 0.10;
          const artistShare = streamPrice - platformFee;
          
          const artist = artists.find(a => a.id === currentTrack.artistId || a.name === currentTrack.artist);
          
          recordTransaction({
            type: 'stream',
            amount: streamPrice,
            platformFee: platformFee,
            artistShare: artistShare,
            recipientAddress: artist?.walletAddress || 'EQ_ARTIST_FALLBACK_ADDRESS',
            senderAddress: userProfile.walletAddress,
            trackId: currentTrack.id,
            trackTitle: currentTrack.title
          });
          
          addNotification(`Stream royalty distributed: ${artistShare.toFixed(6)} TON to ${currentTrack.artist}`, "info");
        }, 10000); // Trigger after 10 seconds of playback
        
        return () => clearTimeout(streamPaymentTimeout);
      }
    };
    checkAuth();
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
  const [supabasePlaylists, setSupabasePlaylists] = useState<Playlist[]>([]);
  const [supabaseTransactions, setSupabaseTransactions] = useState<Transaction[]>([]);
  const [supabasePosts, setSupabasePosts] = useState<Post[]>([]);
  const [supabaseUsers, setSupabaseUsers] = useState<UserProfile[]>([]);
  const [supabaseTracks, setSupabaseTracks] = useState<Track[]>([]);
  const [supabaseNFTs, setSupabaseNFTs] = useState<NFTItem[]>([]);

  // Sync with Supabase
  useEffect(() => {
    // Public listeners
    const tracksSubscription = supabase
      .channel('tracks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracks' }, (payload) => {
        // Handle changes
      })
      .subscribe();

    const nftsSubscription = supabase
      .channel('nfts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nfts' }, (payload) => {
        // Handle changes
      })
      .subscribe();

    const playlistsSubscription = supabase
      .channel('playlists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, (payload) => {
        // Handle changes
      })
      .subscribe();

    const postsSubscription = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        // Handle changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tracksSubscription);
      supabase.removeChannel(nftsSubscription);
      supabase.removeChannel(playlistsSubscription);
      supabase.removeChannel(postsSubscription);
    };
  }, []);

  // Auth-dependent listeners
  useEffect(() => {
    let usersSubscription: any = null;
    let transactionsSubscription: any = null;
    let userDocSubscription: any = null;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        // 1. Start protected collection listeners
        usersSubscription = supabase
          .channel('users-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
            // Fetch all users again or update local state based on payload
            supabase.from('users').select('*').then(({ data }) => setSupabaseUsers(data || []));
          })
          .subscribe();

        transactionsSubscription = supabase
          .channel('transactions-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
            // Fetch all transactions again or update local state based on payload
            supabase.from('transactions').select('*').order('timestamp', { ascending: false }).then(({ data }) => setSupabaseTransactions(data || []));
          })
          .subscribe();

        // 2. Initial fetch and setup listener for current user profile
        try {
          const { data: userProfile, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError && userError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const newProfile: UserProfile = {
              ...MOCK_USER,
              id: user.id,
              name: user.user_metadata.full_name || 'Anonymous',
              avatar: user.user_metadata.avatar_url || getPlaceholderImage(`user-${user.id}`, 200, 200),
              walletAddress: '',
              handle: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
              followers: 0,
              following: 0,
              earnings: 0,
              streamingEarnings: 0,
              nftEarnings: 0,
              jamBalance: 100, // Welcome bonus
              stakedJam: 0,
              pendingJamRewards: 0,
              likedTrackIds: [],
              followedUserIds: [],
              createdAt: new Date().toISOString()
            };
            await supabase.from('users').upsert(newProfile);
            setUserProfile(newProfile);
          } else if (userProfile) {
            setUserProfile(userProfile as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }

        // Real-time listener for current user profile
        userDocSubscription = supabase
          .channel('user-profile-channel')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` }, (payload) => {
            setUserProfile(payload.new as UserProfile);
          })
          .subscribe();
      } else {
        setSupabaseUsers([]);
        setSupabaseTransactions([]);
        setUserProfile(MOCK_USER);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initAuth();
    });

    return () => {
      subscription.unsubscribe();
      if (usersSubscription) supabase.removeChannel(usersSubscription);
      if (transactionsSubscription) supabase.removeChannel(transactionsSubscription);
      if (userDocSubscription) supabase.removeChannel(userDocSubscription);
    };
  }, []);

  // Update local state when supabase data changes
  useEffect(() => {
    if (supabasePlaylists.length > 0) {
      setPlaylists(supabasePlaylists);
    }
  }, [supabasePlaylists]);

  useEffect(() => {
    if (supabaseTransactions.length > 0) {
      setTransactions(supabaseTransactions);
    }
  }, [supabaseTransactions]);

  useEffect(() => {
    if (supabasePosts.length > 0) {
      setPosts(supabasePosts);
    }
  }, [supabasePosts]);

  useEffect(() => {
    if (supabaseUsers.length > 0) {
      // Sync artists with supabaseUsers who are verified artists
      const supabaseArtists = supabaseUsers
        .filter(u => u.isVerifiedArtist)
        .map(u => ({
          id: u.id,
          name: u.name,
          walletAddress: u.walletAddress,
          avatarUrl: u.avatar,
          followers: u.followers || 0,
          verified: u.isVerifiedArtist || false,
          isVerifiedArtist: u.isVerifiedArtist || false,
          bio: u.bio,
          bannerUrl: u.bannerUrl,
          socials: u.socials,
          royaltyConfig: (u as any).royaltyConfig,
          earnings: {
            streaming: Number((u as any).streamingEarnings || 0),
            nftSales: Number((u as any).nftEarnings || 0),
            total: Number((u as any).earnings || 0)
          }
        } as Artist));
      
      if (supabaseArtists.length > 0) {
        setArtists(supabaseArtists);
      }
    }
  }, [supabaseUsers]);

  const allTracks = React.useMemo(() => {
    const combined = [...supabaseTracks, ...MOCK_TRACKS];
    // De-duplicate by ID
    const unique = Array.from(new Map(combined.map(t => [t.id, t])).values());
    return unique;
  }, [supabaseTracks]);

  const allNFTs = React.useMemo(() => {
    const combined = [...supabaseNFTs, ...MOCK_NFTS];
    // De-duplicate by ID
    const unique = Array.from(new Map(combined.map(n => [n.id, n])).values());
    return unique;
  }, [supabaseNFTs]);

  const getTrendingTracks = useCallback(() => {
    return [...allTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
  }, [allTracks]);

  const getTopNFTTracks = useCallback(() => {
    return allTracks.filter(t => t.isNFT).sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0')).slice(0, 10);
  }, [allTracks]);

  const getTracksByGenre = useCallback((genre: string) => {
    return allTracks.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
  }, [allTracks]);

  const getRecommendations = useCallback(() => {
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
    
    const sortedGenres = Array.from(preferredGenres.entries()).sort((a, b) => b[1] - a[1]);
    const sortedArtists = Array.from(preferredArtists.entries()).sort((a, b) => b[1] - a[1]);
    
    const topGenres = sortedGenres.map(e => e[0]);
    const topArtists = sortedArtists.map(e => e[0]);
    
    // Social signals: tracks mentioned in posts or from followed artists
    const socialSignalTrackIds = new Set<string>();
    posts.forEach(post => {
      if (post.trackId) socialSignalTrackIds.add(post.trackId);
    });
    
    const followedArtistIds = new Set(followedUserIds);

    const getTrackRecommendation = (track: Track) => {
      let score = 0;
      let reason = "";
      
      // Artist match (highest priority)
      if (topArtists.includes(track.artistId || track.artist)) {
        const artistIndex = topArtists.indexOf(track.artistId || track.artist);
        score += 15 - Math.min(artistIndex, 10);
        reason = `Because you like ${track.artist}`;
      }
      
      // Genre match
      if (topGenres.includes(track.genre)) {
        const genreIndex = topGenres.indexOf(track.genre);
        const genreScore = 8 - Math.min(genreIndex, 5);
        if (genreScore > score) {
          score = genreScore;
          reason = `Similar to your favorite ${track.genre} tracks`;
        } else {
          score += genreScore / 2;
        }
      }
      
      // Followed artist signal
      if (followedArtistIds.has(track.artistId || '')) {
        score += 12;
        if (!reason) reason = `From an artist you follow`;
      }
      
      // Social signal
      if (socialSignalTrackIds.has(track.id)) {
        score += 5;
        if (!reason) reason = `Trending in your community`;
      }

      // Up-and-coming signal
      const isNew = parseInt(track.id) > 10;
      if (isNew && (track.playCount || 0) > 100 && (track.playCount || 0) < 5000) {
        score += 7;
        if (!reason) reason = `New discovery for you`;
      }

      // Trending signal
      if ((track.playCount || 0) > 10000) {
        score += 4;
        if (!reason) reason = `Global hit you might like`;
      }
      
      return { score, reason };
    };

    const recommendedTracks = allTracks
      .filter(track => !historyIds.has(track.id) && !likedIds.has(track.id) && !nftTrackIds.has(track.id))
      .map(track => {
        const { score, reason } = getTrackRecommendation(track);
        return { ...track, recommendationReason: reason, recommendationScore: score };
      })
      .filter(t => t.recommendationScore > 5)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 20);

    // Fallback if not enough recommendations
    if (recommendedTracks.length < 10) {
      const trending = getTrendingTracks().filter(t => 
        !recommendedTracks.find(rt => rt.id === t.id) && 
        !historyIds.has(t.id) && 
        !likedIds.has(t.id) && 
        !nftTrackIds.has(t.id)
      );
      recommendedTracks.push(...trending.slice(0, 15 - recommendedTracks.length).map(t => ({
        ...t,
        recommendationReason: "Trending globally",
        recommendationScore: 3
      })));
    }

    const recommendedNFTs = allNFTs.filter(nft => {
      if (userNFTs.find(un => un.id === nft.id)) return false;
      
      const track = allTracks.find(t => t.id === nft.trackId);
      if (!track) return false;

      let score = 0;
      if (topGenres.includes(track.genre)) score += 5;
      if (topArtists.includes(track.artistId || track.artist)) score += 5;
      if (followedArtistIds.has(track.artistId || '')) score += 8;
      if (parseFloat(nft.price) > 50) score += 3;
      
      return score > 5;
    }).sort((a, b) => parseFloat(b.price) - parseFloat(a.price)).slice(0, 10);

    return { recommendedTracks, recommendedNFTs };
  }, [recentlyPlayed, likedTrackIds, userNFTs, userProfile.favoriteGenres, allTracks, allNFTs, posts, followedUserIds, getTrendingTracks]);

  useEffect(() => {
    if (userProfile.id) {
      setUserTracks(supabaseTracks.filter(t => t.artistId === userProfile.id));
      setUserNFTs(supabaseNFTs.filter(n => n.artistId === userProfile.id || n.owner === userProfile.walletAddress));
    }
  }, [supabaseTracks, supabaseNFTs, userProfile]);

  const updateNFT = async (nftId: string, updates: Partial<NFTItem>, silent: boolean = false) => {
    setIsLoading(true);
    try {
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      const { error } = await supabase
        .from('nfts')
        .update(cleanUpdates)
        .eq('id', nftId);
      if (error) throw error;
      if (!silent) addNotification("Asset protocol updated", "success");
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `nfts/${nftId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserTrack = async (track: Track) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tracks')
        .insert(track);
      if (error) throw error;
      addNotification(`Track "${track.title}" uploaded`, "success");
    } catch (error) {
      handleSupabaseError(error, 'INSERT', `tracks/${track.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrack = async (trackId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);
      if (error) throw error;
      addNotification("Track deleted successfully", "success");
    } catch (error) {
      handleSupabaseError(error, 'DELETE', `tracks/${trackId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserNFT = async (nft: NFTItem, silent: boolean = false) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('nfts')
        .insert(nft);
      if (error) throw error;
      if (!silent) addNotification(`NFT "${nft.title}" minted`, "success");
    } catch (error) {
      handleSupabaseError(error, 'INSERT', `nfts/${nft.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setAnthem = async (nftId: string | null) => {
    setIsLoading(true);
    try {
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        anthemId: nftId || undefined
      }));

      // Update Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ anthemId: nftId })
          .eq('id', user.id);
        if (error) throw error;
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
    } finally {
      setIsLoading(false);
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
    const syncWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (tonAddress && user && userProfile.walletAddress !== tonAddress) {
        try {
          await supabase
            .from('users')
            .update({ walletAddress: tonAddress })
            .eq('id', user.id);
          setUserProfile(prev => ({ ...prev, walletAddress: tonAddress }));
          addNotification("Wallet address synced with profile", "success");
        } catch (error) {
          console.error("Error syncing wallet address:", error);
        }
      }
    };
    syncWallet();
  }, [tonAddress, userProfile.walletAddress]);

  const recordTransaction = async (txData: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => {
    setIsLoading(true);
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTx: Transaction = {
      ...txData,
      id: txId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substr(2, 40)}`
    };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('transactions').insert(newTx);
      }
      setTransactions(prev => [newTx, ...prev]);
      
      // Update user/artist earnings based on transaction
      if (txData.type === 'nft_sale' || txData.type === 'stream') {
        const share = Number(txData.artistShare);
        
        // If the recipient is the current user, update their profile earnings
        if (txData.recipientAddress === userProfile.walletAddress && user) {
          const { data: currentUser } = await supabase.from('users').select('earnings, streamingEarnings, nftEarnings').eq('id', userProfile.id).single();
          if (currentUser) {
            const updateFields: any = {
              earnings: currentUser.earnings + share
            };
            if (txData.type === 'stream') {
              updateFields.streamingEarnings = currentUser.streamingEarnings + share;
            } else if (txData.type === 'nft_sale') {
              updateFields.nftEarnings = currentUser.nftEarnings + share;
            }
            await supabase.from('users').update(updateFields).eq('id', userProfile.id);
          }
        }
        
        // Update the artist's earnings in Supabase if they are a registered user
        const artistId = txData.trackId 
          ? allTracks.find(t => t.id === txData.trackId)?.artistId 
          : txData.nftId 
            ? allNFTs.find(n => n.id === txData.nftId)?.artistId 
            : null;

        if (artistId && user) {
          const { data: artistUser } = await supabase.from('users').select('earnings, streamingEarnings, nftEarnings').eq('id', artistId).single();
          if (artistUser) {
            const updateFields: any = {
              earnings: artistUser.earnings + share
            };
            if (txData.type === 'stream') {
              updateFields.streamingEarnings = artistUser.streamingEarnings + share;
            } else if (txData.type === 'nft_sale') {
              updateFields.nftEarnings = artistUser.nftEarnings + share;
            }
            await supabase.from('users').update(updateFields).eq('id', artistId);
          }
        }
      }
    } catch (error) {
      handleSupabaseError(error, 'CREATE', `transactions/${txId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseJAM = async (amount: string, jamAmount: string) => {
    setIsLoading(true);
    try {
      if (!tonConnectUI.connected) {
        addNotification("Please connect your wallet first", "error");
        return;
      }

      const success = await tonService.purchaseJAM(tonConnectUI, amount, jamAmount);
      
      if (success) {
        recordTransaction({
          type: 'jam_purchase',
          amount: Number(amount),
          platformFee: 0,
          artistShare: 0,
          recipientAddress: 'PLATFORM_WALLET',
          senderAddress: userProfile.walletAddress,
          trackTitle: `Purchased ${jamAmount} JAM`
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: currentUser } = await supabase.from('users').select('jamBalance').eq('id', user.id).single();
          if (currentUser) {
            await supabase.from('users').update({ jamBalance: currentUser.jamBalance + Number(jamAmount) }).eq('id', user.id);
          }
        }
        
        addNotification(`Successfully purchased ${jamAmount} JAM!`, 'success');
      }
    } catch (error) {
      addNotification("Transaction failed or cancelled", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribePremium = async (amount: string) => {
    setIsLoading(true);
    try {
      if (!tonConnectUI.connected) {
        addNotification("Please connect your wallet first", "error");
        return;
      }

      const success = await tonService.subscribePremium(tonConnectUI, amount);
      
      if (success) {
        recordTransaction({
          type: 'premium_subscription',
          amount: Number(amount),
          platformFee: Number(amount),
          artistShare: 0,
          recipientAddress: 'PLATFORM_WALLET',
          senderAddress: userProfile.walletAddress,
          trackTitle: 'Premium Subscription'
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('users')
            .update({ isPremium: true })
            .eq('id', user.id);
        }
        
        addNotification('Welcome to TonJam Premium!', 'success');
      }
    } catch (error) {
      addNotification("Transaction failed or cancelled", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const stakeJam = async (amount: string) => {
    setIsLoading(true);
    try {
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({
            jamBalance: supabase.rpc('increment', { amount: -stakeAmount }),
            stakedJam: supabase.rpc('increment', { amount: stakeAmount }),
            lastStakingUpdate: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      recordTransaction({
        type: 'stake',
        amount: 0, // Staking is internal to JAM
        platformFee: 0,
        artistShare: 0,
        recipientAddress: 'STAKING_CONTRACT',
        senderAddress: userProfile.walletAddress,
        trackTitle: `Staked ${amount} JAM`
      });

      addNotification(`Successfully staked ${amount} JAM`, 'success');
    } catch (error) {
      addNotification("Staking failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const unstakeJam = async (amount: string) => {
    setIsLoading(true);
    try {
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({
            stakedJam: supabase.rpc('increment', { amount: -unstakeAmount }),
            jamBalance: supabase.rpc('increment', { amount: unstakeAmount }),
            lastStakingUpdate: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      recordTransaction({
        type: 'unstake',
        amount: 0,
        platformFee: 0,
        artistShare: 0,
        recipientAddress: userProfile.walletAddress || 'USER_WALLET',
        senderAddress: 'STAKING_CONTRACT',
        trackTitle: `Unstaked ${amount} JAM`
      });

      addNotification(`Successfully unstaked ${amount} JAM`, 'success');
    } catch (error) {
      addNotification("Unstaking failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const claimJamRewards = async () => {
    setIsLoading(true);
    try {
      const pendingRewards = parseFloat(userProfile.pendingJamRewards || '0');

      if (pendingRewards <= 0) {
        addNotification("No rewards to claim", "info");
        return;
      }

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({
            pendingJamRewards: 0,
            jamBalance: supabase.rpc('increment', { amount: pendingRewards }),
            lastStakingUpdate: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      recordTransaction({
        type: 'claim_rewards',
        amount: 0,
        platformFee: 0,
        artistShare: 0,
        recipientAddress: userProfile.walletAddress || 'USER_WALLET',
        senderAddress: 'STAKING_CONTRACT',
        trackTitle: `Claimed ${pendingRewards.toFixed(4)} JAM rewards`
      });

      addNotification(`Successfully claimed ${pendingRewards.toFixed(4)} JAM rewards`, 'success');
    } catch (error) {
      addNotification("Claiming rewards failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (postData: Partial<Post>) => {
    setIsLoading(true);
    const postId = `post-${Date.now()}`;
    const newPost: Post = {
      id: postId,
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      userHandle: userProfile.handle,
      content: '',
      likes: 0,
      comments: 0,
      reposts: 0,
      timestamp: new Date().toISOString(),
      ...postData
    };
    
    try {
      await supabase.from('posts').insert(newPost);
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      handleSupabaseError(error, 'CREATE', `posts/${postId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    setIsLoading(true);
    try {
      if (postId.startsWith('post-')) {
        await supabase.from('posts').delete().eq('id', postId);
      }
      setPosts(prev => prev.filter(p => p.id !== postId));
      addNotification("Post deleted", "success");
    } catch (error) {
      handleSupabaseError(error, 'DELETE', `posts/${postId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addNotification("Please log in to perform this action", "error");
      return;
    }
    try {
      if (postId.startsWith('post-')) {
        await supabase.from('posts').update(updates).eq('id', postId);
      }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `posts/${postId}`);
    }
  };

  const jamTrack = async (trackId: string) => {
    setIsLoading(true);
    try {
      const jamCost = 1; // 1 JAM to boost
      const currentBalance = userProfile.jamBalance || 0;

      if (currentBalance < jamCost) {
        addNotification("Insufficient JAM balance to boost track", "error");
        return;
      }

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ jamBalance: supabase.rpc('increment', { amount: -jamCost }) })
          .eq('id', user.id);
      }

      setPosts(prev => prev.map(p => {
        if (p.trackId === trackId) {
          return { ...p, likes: p.likes + 10 }; // Jamming boosts likes significantly in the feed
        }
        return p;
      }));

      addNotification("Track Jammed! Signal boosted across the network.", "success");
      
      await recordTransaction({
        type: 'jam_purchase',
        amount: 0,
        platformFee: 0,
        artistShare: 0.9, // 90% goes to artist
        recipientAddress: MOCK_TRACKS.find(t => t.id === trackId)?.artistId || 'ARTIST',
        senderAddress: userProfile.walletAddress,
        trackTitle: `Jammed Track: ${MOCK_TRACKS.find(t => t.id === trackId)?.title}`
      });
    } finally {
      setIsLoading(false);
    }
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

  const updateRoyaltyConfig = async (artistId: string, config: Artist['royaltyConfig']) => {
    setIsLoading(true);
    try {
      setArtists(prev => prev.map(artist => 
        artist.id === artistId ? { ...artist, royaltyConfig: config } : artist
      ));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ royaltyConfig: config })
          .eq('id', artistId);
      }

      addNotification("Royalty protocol updated", "success");
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `users/${artistId}`);
    } finally {
      setIsLoading(false);
    }
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
      
      let sourceUrl = track.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      let highFidelity = false;
      let exclusive = null;

      if (track.isNFT) {
        const ownedNFT = userNFTs.find(n => n.trackId === track.id) || 
                         (userProfile.ownedNftIds?.includes(track.id) ? allNFTs.find(n => n.trackId === track.id) : null);
        
        if (ownedNFT) {
          highFidelity = true;
          exclusive = ownedNFT.exclusiveContent || null;
          if (track.audioIpfsUrl) {
            sourceUrl = track.audioIpfsUrl;
          }
          addNotification("NFT Verified: Playing high-fidelity version", "success");
        } else {
          addNotification("Standard streaming. Own the NFT for high-fidelity audio.", "info");
        }
      }

      setIsHighFidelity(highFidelity);
      setExclusiveContent(exclusive);

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
        
        // Record stream transaction
        recordTransaction({
          type: 'stream',
          amount: 0.001,
          platformFee: 0.0001,
          artistShare: 0.0009,
          recipientAddress: track.artistId || 'ARTIST',
          senderAddress: userProfile.walletAddress,
          trackId: track.id,
          trackTitle: track.title
        });
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

  const toggleLikeTrack = async (trackId: string) => {
    setIsLoading(true);
    try {
      const isLiked = likedTrackIds.includes(trackId);
      const newLikedTrackIds = isLiked 
        ? likedTrackIds.filter(id => id !== trackId)
        : [...likedTrackIds, trackId];
      
      setLikedTrackIds(newLikedTrackIds);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ likedTrackIds: newLikedTrackIds })
          .eq('id', user.id);

        await supabase
          .from('tracks')
          .update({ likes: supabase.rpc('increment', { amount: isLiked ? -1 : 1 }) })
          .eq('id', trackId);
      }
      
      if (isLiked) {
        addNotification("Track removed from favorites", "info");
      } else {
        addNotification("Track added to favorites", "success");
      }
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `tracks/${trackId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const [artists, setArtists] = useState<Artist[]>(MOCK_ARTISTS);

  const toggleFollowUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const isFollowing = followedUserIds.includes(userId);
      const newFollowedUserIds = isFollowing
        ? followedUserIds.filter(id => id !== userId)
        : [...followedUserIds, userId];
      
      setFollowedUserIds(newFollowedUserIds);
      
      // Update artist follower count locally
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

      // Update userProfile following count and followedUserIds locally
      setUserProfile(prevProfile => ({
        ...prevProfile,
        following: isFollowing ? Math.max(0, prevProfile.following - 1) : prevProfile.following + 1,
        followedUserIds: newFollowedUserIds,
        followedArtists: newFollowedUserIds,
        followingCount: newFollowedUserIds.length
      }));

      // Update Firebase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({
            followedUserIds: newFollowedUserIds,
            following: newFollowedUserIds.length
          })
          .eq('id', user.id);

        await supabase
          .from('users')
          .update({ followers: supabase.rpc('increment', { amount: isFollowing ? -1 : 1 }) })
          .eq('id', userId);
      }

      if (isFollowing) {
        addNotification("Unfollowed user", "info");
      } else {
        addNotification("Followed user", "success");
      }
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `users/${userId}`);
    } finally {
      setIsLoading(false);
    }
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

  const createNewPlaylist = async (name: string, description?: string, initialTrack?: Track, coverUrl?: string, isPrivate?: boolean, isCollaborative?: boolean, tags?: string[]) => {
    setIsLoading(true);
    const playlistId = Date.now().toString();
    const newPlaylist: Playlist = {
      id: playlistId,
      title: name,
      coverUrl: coverUrl || '', /* Leave empty for dynamic collage/placeholder */
      trackCount: initialTrack ? 1 : 0,
      creator: userProfile.name,
      description,
      trackIds: initialTrack ? [initialTrack.id] : [],
      isPrivate,
      isCollaborative,
      tags,
      updatedAt: new Date().toISOString()
    };

    try {
      await supabase.from('playlists').insert(newPlaylist);
      setPlaylists(prev => [newPlaylist, ...prev]);
      if (initialTrack) {
        addNotification(`Created "${name}" and added "${initialTrack.title}"`, 'success');
      } else {
        addNotification(`Created playlist "${name}"`, 'success');
      }
    } catch (error) {
      handleSupabaseError(error, 'CREATE', `playlists/${playlistId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    setIsLoading(true);
    try {
      await supabase.from('playlists').delete().eq('id', playlistId);
      setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
      addNotification("Playlist deleted", "info");
    } catch (error) {
      handleSupabaseError(error, 'DELETE', `playlists/${playlistId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlaylist = async (playlistId: string, updates: Partial<Playlist>) => {
    setIsLoading(true);
    try {
      const updated = { ...updates, updatedAt: new Date().toISOString() };
      await supabase.from('playlists').update(updated).eq('id', playlistId);
      setPlaylists(prev => prev.map(pl => pl.id === playlistId ? { ...pl, ...updated } : pl));
      addNotification("Playlist updated", "success");
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `playlists/${playlistId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDiscoverWeekly = async () => {
    setIsLoading(true);
    try {
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
      
      const playlistId = existingIndex !== -1 ? playlists[existingIndex].id : `dw-${Date.now()}`;
      const newPlaylist: Playlist = {
        id: playlistId,
        title: 'Discover Weekly',
        coverUrl: getPlaceholderImage('discover', 400, 400),
        trackCount: finalTracks.length,
        creator: 'TonJam AI',
        description: "Your weekly dose of fresh music, personalized based on your listening history, likes, and NFT collection.",
        trackIds: finalTracks.map(t => t.id),
        updatedAt: now.toISOString()
      };
      
      // Update Firebase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('playlists').upsert(newPlaylist);
      }
      
      setPlaylists(prev => {
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newPlaylist;
          return updated;
        }
        return [newPlaylist, ...prev];
      });
      
      addNotification('Your Discover Weekly playlist has been updated!', 'success');
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', 'playlists/discover-weekly');
    } finally {
      setIsLoading(false);
    }
  };

  const createRecommendedPlaylist = async () => {
    setIsLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback to basic recommendation if no API key
        const { recommendedTracks } = getRecommendations();
        const tracksToUse = recommendedTracks.slice(0, 10);
        
        if (tracksToUse.length === 0) {
          addNotification("Not enough data to generate recommendations yet", "info");
          setIsLoading(false);
          return;
        }

        const name = `AI Playlist ${playlists.length + 1}`;
        const playlistId = Date.now().toString();
        const newPlaylist: Playlist = {
          id: playlistId,
          title: name,
          coverUrl: '',
          trackCount: tracksToUse.length,
          creator: 'TonJam AI',
          description: "AI playlist generated based on your listening history.",
          trackIds: tracksToUse.map(t => t.id),
          updatedAt: new Date().toISOString()
        };

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('playlists').insert(newPlaylist);
        }

        setPlaylists(prev => [newPlaylist, ...prev]);
        addNotification(`AI Playlist "${name}" created with ${tracksToUse.length} tracks`, 'success');
        setIsLoading(false);
        return;
      }

      // Use Gemini to generate a smart playlist
      const ai = new GoogleGenAI({ apiKey });
      
      const recentTrackNames = recentlyPlayed.slice(0, 5).map(t => `${t.title} by ${t.artist}`).join(', ');
      const likedTrackNames = allTracks.filter(t => likedTrackIds.includes(t.id)).slice(0, 5).map(t => `${t.title} by ${t.artist}`).join(', ');
      const availableTracks = allTracks.map(t => `ID: ${t.id} | Title: ${t.title} | Artist: ${t.artist} | Genre: ${t.genre}`).join('\n');

      const prompt = `
You are an expert AI DJ. Based on the user's recent listening history and liked tracks, create a new personalized playlist from the available catalog.
Recent listens: ${recentTrackNames || 'None'}
Liked tracks: ${likedTrackNames || 'None'}

Available Catalog:
${availableTracks}

Create a cohesive playlist of 5 to 10 tracks.
Return a JSON object with the following structure:
{
  "title": "A creative, catchy name for the playlist",
  "description": "A short, engaging description of the vibe",
  "trackIds": ["id1", "id2", ...]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              trackIds: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['title', 'description', 'trackIds']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (!result.trackIds || result.trackIds.length === 0) {
        throw new Error("AI didn't return any tracks");
      }

      // Filter out invalid IDs just in case
      const validTrackIds = result.trackIds.filter((id: string) => allTracks.some(t => t.id === id));

      if (validTrackIds.length === 0) {
        throw new Error("AI returned invalid track IDs");
      }

      const playlistId = Date.now().toString();
      const newPlaylist: Playlist = {
        id: playlistId,
        title: result.title || `AI Playlist ${playlists.length + 1}`,
        coverUrl: '', 
        trackCount: validTrackIds.length,
        creator: 'TonJam AI',
        description: result.description || "AI generated playlist.",
        trackIds: validTrackIds,
        updatedAt: new Date().toISOString()
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('playlists').insert(newPlaylist);
      }

      setPlaylists(prev => [newPlaylist, ...prev]);
      addNotification(`AI Playlist "${newPlaylist.title}" created!`, 'success');
      
    } catch (error) {
      console.error("AI Playlist Generation Error:", error);
      // Fallback
      addNotification("Failed to generate AI playlist. Try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* Fix: Implemented clearRecentlyPlayed function to purge history */
  const clearRecentlyPlayed = () => {
    setRecentlyPlayed([]);
    addNotification("Playback history cleared", "info");
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (playlist.trackIds?.includes(track.id)) {
      addNotification(`"${track.title}" is already in this playlist`, "info");
      return;
    }

    setIsLoading(true);
    const newIds = [...(playlist.trackIds || []), track.id];
    const updates = { 
      trackIds: newIds, 
      trackCount: newIds.length,
      updatedAt: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', playlistId);
      if (error) throw error;
      setPlaylists(prev => prev.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, ...updates };
        }
        return pl;
      }));
      addNotification(`Added "${track.title}" to ${playlist.title}`);
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `playlists/${playlistId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    setIsLoading(true);
    const newIds = (playlist.trackIds || []).filter(id => id !== trackId);
    const updates = { 
      trackIds: newIds, 
      trackCount: newIds.length,
      updatedAt: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', playlistId);
      if (error) throw error;
      setPlaylists(prev => prev.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, ...updates };
        }
        return pl;
      }));
      addNotification("Track removed from playlist", "info");
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `playlists/${playlistId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const reorderTrackInPlaylist = async (playlistId: string, trackId: string, direction: 'up' | 'down') => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || !playlist.trackIds) return;

    const index = playlist.trackIds.indexOf(trackId);
    if (index === -1) return;

    const newTrackIds = [...playlist.trackIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newTrackIds.length) {
      setIsLoading(true);
      const temp = newTrackIds[index];
      newTrackIds[index] = newTrackIds[targetIndex];
      newTrackIds[targetIndex] = temp;

      const updates = { 
        trackIds: newTrackIds,
        updatedAt: new Date().toISOString()
      };

      try {
        const { error } = await supabase
          .from('playlists')
          .update(updates)
          .eq('id', playlistId);
        if (error) throw error;
        setPlaylists(prev => prev.map(pl => {
          if (pl.id === playlistId) {
            return { ...pl, ...updates };
          }
          return pl;
        }));
      } catch (error) {
        handleSupabaseError(error, 'UPDATE', `playlists/${playlistId}`);
      } finally {
        setIsLoading(false);
      }
    }
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
      posts, createPost, deletePost, updatePost, sponsoredPosts, tasks, addTask, updateTaskProgress, claimTaskReward, getTrendingTracks, getTopNFTTracks, getTracksByGenre, getRecommendations, jamTrack, activeJamRoom, joinJamRoom, leaveJamRoom, allPlaylists,
      searchQuery, setSearchQuery, isDiscoverFiltersOpen, setIsDiscoverFiltersOpen, isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen,
      updateRoyaltyConfig, marketplaceFilters, setMarketplaceFilters, jamspaceFilters, setJamspaceFilters,
      isLoading, deleteTrack, isHighFidelity, exclusiveContent
    }}>
      {children}
      {isLoading && (
        <div className="fixed top-4 right-4 z-[500] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Syncing...
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

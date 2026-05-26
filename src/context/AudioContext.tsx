import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { GoogleGenAI, Type } from "@google/genai";
import {
  Track,
  Playlist,
  PlaylistFolder,
  UserProfile,
  NFTItem,
  Artist,
  Transaction,
  Post,
  PostComment,
  ExclusiveContent,
  Task,
  SponsoredContent,
} from "@/types";
import {
  MOCK_PLAYLISTS,
  MOCK_USER,
  MOCK_TRACKS,
  MOCK_NFTS,
  MOCK_ARTISTS,
  MOCK_POSTS,
  CURATED_PLAYLISTS,
  JAM_JETTON_MASTER,
} from "@/constants";
import * as tonService from "@/services/tonService";
import * as royaltyService from "@/services/royaltyService";
import { audioCacheService } from "@/services/audioCacheService";
import { indexedDbService } from "@/services/indexedDbService";
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
  cleanUpdateData,
} from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  increment,
  serverTimestamp,
  writeBatch,
  or,
  arrayUnion,
  deleteField,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getPlaceholderImage } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { useUserStore } from "@/store/userStore";

// Helper for Firestore errors (already imported from firebase.ts)

interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "error" | "warning";
  duration?: number;
}

export type RepeatMode = "off" | "all" | "one";

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  progress: number;
  isFullPlayerOpen: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  notifications: Notification[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  likedTrackIds: string[];
  followedUserIds: string[];
  trackToAddToPlaylist: Track | null;
  optionsTrack: Track | null;
  optionsCallbacks: {
    onRemove?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
  } | null;
  activePlaylistId: string | null;
  userProfile: UserProfile;
  genesisContractAddress: string | null;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  isHighFidelity: boolean;
  exclusiveContent: ExclusiveContent[] | null;
  communityPosts: Post[];
  addCommunityPost: (post: Partial<Post>) => Promise<void>;
  resetProtocol: () => void;
  submitSponsorship: (data: Partial<SponsoredContent>) => Promise<void>;
  approveSponsorship: (id: string) => Promise<void>;
  rejectSponsorship: (id: string) => Promise<void>;
  userAddress: string | null;
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
  addNotification: (
    message: string,
    type?: "success" | "info" | "error" | "warning",
    duration?: number,
  ) => void;
  setTrackToAddToPlaylist: (track: Track | null) => void;
  setOptionsTrack: (
    track: Track | null,
    callbacks?: { onRemove?: () => void },
  ) => void;
  setActivePlaylistId: (id: string | null) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderTrackInPlaylist: (
    playlistId: string,
    trackId: string,
    direction: "up" | "down",
  ) => void;
  searchTracks: (query: string) => Promise<Track[]>;
  searchArtists: (query: string) => Promise<Artist[]>;
  searchNFTs: (query: string) => Promise<NFTItem[]>;
  createNewPlaylist: (
    name: string,
    description?: string,
    initialTrack?: Track,
    coverUrl?: string,
    isPrivate?: boolean,
    isCollaborative?: boolean,
    tags?: string[],
  ) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  generateDiscoverWeekly: () => void;
  createRecommendedPlaylist: () => void;
  clearRecentlyPlayed: () => void;
  discoverWeekly: Playlist | null;
  setUserProfile: (
    profile: UserProfile | ((prev: UserProfile) => UserProfile),
  ) => void;
  setAnthem: (nftId: string | null) => Promise<void>;
  setGenesisContractAddress: (address: string | null) => void;
  userTracks: Track[];
  userNFTs: NFTItem[];
  userBids: NFTItem[];
  allTracks: Track[];
  allNFTs: NFTItem[];
  artists: Artist[];
  firestoreUsers: UserProfile[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
  addUserTrack: (track: Track) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => Promise<void>;
  addUserNFT: (nft: NFTItem, silent?: boolean) => void;
  updateNFT: (
    nftId: string,
    updates: Partial<NFTItem>,
    silent?: boolean,
  ) => void;
  recordTransaction: (
    transaction: Omit<Transaction, "id" | "timestamp" | "status">,
  ) => void;
  depositTON: (amount: string) => Promise<void>;
  withdrawTON: (amount: string, address: string) => Promise<void>;
  purchaseJAM: (amount: string, jamAmount: string) => Promise<void>;
  subscribePremium: (amount: string) => Promise<void>;
  stakeJam: (amount: string) => Promise<void>;
  unstakeJam: (amount: string) => Promise<void>;
  claimJamRewards: () => Promise<void>;
  toggleAutoCompound: () => Promise<void>;
  transactions: Transaction[];
  audioElement: HTMLAudioElement | null;
  analyser: AnalyserNode | null;
  posts: Post[];
  createPost: (post: Partial<Post>) => void;
  addCommentToPost: (
    postId: string,
    comment: Partial<PostComment>,
  ) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  sponsoredPosts: SponsoredContent[];
  tasks: Task[];
  addTask: (
    task: Omit<Task, "id" | "completed" | "claimed" | "progress">,
  ) => Promise<void>;
  updateTaskProgress: (id: string, progress: number) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  claimTaskReward: (id: string) => Promise<void>;
  updateUserRole: (
    userId: string,
    role: "artist" | "collector" | "admin",
  ) => Promise<void>;
  getTrendingTracks: () => Track[];
  getTopNFTTracks: () => Track[];
  getTracksByGenre: (genre: string) => Track[];
  getRecommendations: () => {
    recommendedTracks: Track[];
    recommendedNFTs: NFTItem[];
  };
  jamTrack: (trackId: string) => Promise<void>;
  purchaseTrack: (trackId: string) => Promise<void>;
  getEarnings: (userId: string) => Promise<number>;
  mintNFT: (
    trackId: string,
    tonConnectUI: any,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTrack: (trackId: string) => Promise<void>;
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
  activeJamRoom: {
    id: string;
    name: string;
    listeners: number;
    currentTrack: Track | null;
  } | null;
  isOffline: boolean;
  toggleOfflineMode: () => void;
  downloadTrackForOffline: (track: Track) => Promise<void>;
  isTrackCached: (trackId: string) => Promise<boolean>;
  deleteCachedTrack: (trackId: string) => Promise<void>;
  joinJamRoom: (roomId: string) => void;
  leaveJamRoom: () => void;
  allPlaylists: Playlist[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isHeaderSearchOpen: boolean;
  setIsHeaderSearchOpen: (isOpen: boolean) => void;
  isDiscoverFiltersOpen: boolean;
  setIsDiscoverFiltersOpen: (isOpen: boolean) => void;
  isCreatePlaylistModalOpen: boolean;
  setIsCreatePlaylistModalOpen: (isOpen: boolean) => void;
  featuredPlaylist: Playlist;
  playlistFolders: PlaylistFolder[];
  createFolder: (title: string) => Promise<void>;
  renameFolder: (folderId: string, newTitle: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  movePlaylistToFolder: (
    playlistId: string,
    folderId: string | null,
  ) => Promise<void>;
  updateRoyaltyConfig: (
    artistId: string,
    config: Artist["royaltyConfig"],
  ) => void;
  marketplaceFilters: {
    genre: string;
    artist: string;
    rarity: string;
    priceRange: [number, number];
    sortBy: string;
    status: string;
  };
  setMarketplaceFilters: React.Dispatch<
    React.SetStateAction<{
      genre: string;
      artist: string;
      rarity: string;
      priceRange: [number, number];
      sortBy: string;
      status: string;
    }>
  >;
  jamspaceFilters: {
    sortOrder: "Newest" | "Oldest";
    viewMode: "list" | "grid";
  };
  setJamspaceFilters: React.Dispatch<
    React.SetStateAction<{
      sortOrder: "Newest" | "Oldest";
      viewMode: "list" | "grid";
    }>
  >;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_TRACK: "tonjam_current_track",
  QUEUE: "tonjam_queue",
  PROGRESS: "tonjam_progress",
  SHUFFLE: "tonjam_shuffle",
  REPEAT: "tonjam_repeat",
  PLAYLISTS: "tonjam_user_playlists",
  RECENTLY_PLAYED: "tonjam_recently_played",
  USER_PROFILE: "tonjam_user_profile",
  CONTRACT_ADDRESS: "tonjam_genesis_contract",
  VOLUME: "tonjam_volume",
  MUTED: "tonjam_muted",
  LIKED_TRACKS: "tonjam_liked_tracks",
  FOLLOWED_USERS: "tonjam_followed_users",
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  // Zustand State Integration
  const {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    queue,
    setQueue,
    progress,
    setProgress,
    isFullPlayerOpen,
    setIsFullPlayerOpen: setFullPlayerOpen,
    isShuffle,
    setIsShuffle,
    repeatMode,
    setRepeatMode,
    volume,
    setVolume: setVolumeState,
    isMuted,
    setIsMuted,
  } = useAudioStore();

  const {
    userProfile,
    setUserProfile,
    followedUserIds,
    setFollowedUserIds,
    likedTrackIds,
    setLikedTrackIds,
  } = useUserStore();

  const [genesisContractAddress, setGenesisContractAddress] = useState<
    string | null
  >(() => {
    return localStorage.getItem(STORAGE_KEYS.CONTRACT_ADDRESS);
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] =
    useState<Track | null>(null);
  const [optionsTrack, setOptionsTrackState] = useState<Track | null>(null);
  const [optionsCallbacks, setOptionsCallbacks] = useState<{
    onRemove?: () => void;
  } | null>(null);

  const setOptionsTrack = useCallback(
    (track: Track | null, callbacks?: { onRemove?: () => void }) => {
      setOptionsTrackState(track);
      setOptionsCallbacks(callbacks || null);
    },
    [],
  );

  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const [activeJamRoom, setActiveJamRoom] = useState<{
    id: string;
    name: string;
    listeners: number;
    currentTrack: Track | null;
  } | null>(null);

  const [isOffline, setIsOffline] = useState(false);
  const toggleOfflineMode = useCallback(() => {
    setIsOffline((prev) => {
      addNotification(
        !prev ? "Offline mode enabled" : "Offline mode disabled",
        "info",
      );
      return !prev;
    });
  }, []);

  const downloadTrackForOffline = useCallback(async (track: Track) => {
    try {
      addNotification(`Downloading ${track.title} for offline...`, "info");
      await audioCacheService.cacheTrack(track.id, track.audioUrl);
      addNotification(
        `${track.title} is ready for offline listening!`,
        "success",
      );
    } catch (err) {
      console.error(err);
      addNotification("Failed to download track", "error");
    }
  }, []);

  const isTrackCached = useCallback(async (trackId: string) => {
    return await audioCacheService.isTrackCached(trackId);
  }, []);

  const deleteCachedTrack = useCallback(async (trackId: string) => {
    await audioCacheService.removeCachedTrack(trackId);
    addNotification("Track removed from offline cache", "info");
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [isDiscoverFiltersOpen, setIsDiscoverFiltersOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] =
    useState(false);
  const [marketplaceFilters, setMarketplaceFilters] = useState<{
    genre: string;
    artist: string;
    rarity: string;
    priceRange: [number, number];
    sortBy: string;
    status: string;
  }>({
    genre: "All",
    artist: "All",
    rarity: "All",
    priceRange: [0, 1000],
    sortBy: "Newest",
    status: "All",
  });

  const [jamspaceFilters, setJamspaceFilters] = useState<{
    sortOrder: "Newest" | "Oldest";
    viewMode: "list" | "grid";
  }>({
    sortOrder: "Newest",
    viewMode: "list",
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("");
  const [isHighFidelity, setIsHighFidelity] = useState(false);
  const [exclusiveContent, setExclusiveContent] = useState<
    ExclusiveContent[] | null
  >(null);

  const [playlistFolders, setPlaylistFolders] = useState<PlaylistFolder[]>([]);
  const [firestorePlaylistFolders, setFirestorePlaylistFolders] = useState<
    PlaylistFolder[]
  >([]);

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return saved ? JSON.parse(saved) : MOCK_PLAYLISTS;
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("tonjam_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("tonjam_posts");
    return saved ? JSON.parse(saved) : MOCK_POSTS;
  });
  const [sponsoredPosts, setSponsoredPosts] = useState<SponsoredContent[]>([]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tonjam_tasks");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "1",
            title: "Daily Sync",
            description: "Stream 5 tracks today",
            reward: "5 TJ",
            points: 50,
            completed: false,
            claimed: false,
            type: "daily",
            progress: 0,
            total: 5,
            rarity: "common",
            priority: "medium",
          },
          {
            id: "2",
            title: "Network Supporter",
            description: "Follow 3 new artists",
            reward: "10 TJ",
            points: 100,
            completed: false,
            claimed: false,
            type: "daily",
            progress: 0,
            total: 3,
            rarity: "common",
            priority: "low",
          },
          {
            id: "3",
            title: "Collector Genesis",
            description: "Purchase your first NFT",
            reward: "50 TJ",
            points: 500,
            completed: false,
            claimed: false,
            type: "achievement",
            progress: 0,
            total: 1,
            rarity: "rare",
            priority: "high",
          },
          {
            id: "4",
            title: "Signal Broadcaster",
            description: "Share a track to JamSpace",
            reward: "5 TJ",
            points: 25,
            completed: false,
            claimed: false,
            type: "daily",
            progress: 0,
            total: 1,
            rarity: "common",
            priority: "low",
          },
          {
            id: "5",
            title: "High Fidelity",
            description: "Listen for 10 hours total",
            reward: "100 TJ",
            points: 1000,
            completed: false,
            claimed: false,
            type: "milestone",
            progress: 0,
            total: 10,
            rarity: "epic",
            priority: "medium",
          },
          {
            id: "6",
            title: "Legend of TON",
            description: "Stake 10,000 JAM for 30 days",
            reward: "500 TJ",
            points: 5000,
            completed: false,
            claimed: false,
            type: "milestone",
            progress: 0,
            total: 30,
            rarity: "legendary",
            priority: "high",
          },
          {
            id: "7",
            title: "TON Ecosystem",
            description: "Follow TON on X",
            reward: "20 TJ",
            points: 200,
            completed: false,
            claimed: false,
            type: "achievement",
            progress: 0,
            total: 1,
            rarity: "rare",
            priority: "high",
            link: "https://x.com/ton_blockchain",
          },
          {
            id: "8",
            title: "Join the Jam",
            description: "Follow TonJam on X",
            reward: "20 TJ",
            points: 200,
            completed: false,
            claimed: false,
            type: "achievement",
            progress: 0,
            total: 1,
            rarity: "rare",
            priority: "high",
            link: "https://x.com/tonjam",
          },
          {
            id: "9",
            title: "Network Expansion",
            description: "Invite 3 friends to TonJam",
            reward: "100 TJ",
            points: 1000,
            completed: false,
            claimed: false,
            type: "milestone",
            progress: 0,
            total: 3,
            rarity: "epic",
            priority: "medium",
          },
          {
            id: "10",
            title: "Spread the Word",
            description: "Share TonJam on your feed",
            reward: "50 TJ",
            points: 500,
            completed: false,
            claimed: false,
            type: "social",
            progress: 0,
            total: 1,
            rarity: "common",
            priority: "medium",
          },
        ];
  });

  const addTask = async (
    taskData: Omit<Task, "id" | "completed" | "claimed" | "progress">,
  ) => {
    setIsLoading(true);
    try {
      const newTask: Task = {
        ...taskData,
        id: Math.random().toString(36).substr(2, 9),
        completed: false,
        claimed: false,
        progress: 0,
      };
      setTasks((prev) => [newTask, ...prev]);
      addNotification(`New protocol registered: ${newTask.title}`, "success");
    } catch (error) {
      console.error("Failed to add task:", error);
      addNotification("Failed to register new protocol", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskProgress = async (id: string, progress: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newProgress = Math.min(t.total, progress);
          const isNowCompleted = newProgress >= t.total;
          return {
            ...t,
            progress: newProgress,
            completed: isNowCompleted,
          };
        }
        return t;
      }),
    );
  };

  const completeTask = async (taskId: string) => {
    // Just mark as completed locally (so UI shows "Claim" button)
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, completed: true, progress: t.total };
        }
        return t;
      }),
    );
  };

  const claimTaskReward = async (taskId: string) => {
    if (!auth.currentUser) {
      addNotification("Please log in to claim rewards", "error");
      return;
    }

    setIsLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");
      if (task.claimed) {
        addNotification("Task already claimed", "info");
        return;
      }

      const rewardAmount = parseFloat(task.reward);
      const batch = writeBatch(db);

      // 1. Record task claim
      const completionRef = doc(collection(db, "taskCompletions"));
      batch.set(completionRef, {
        userId,
        taskId,
        completed: true,
        claimedAt: serverTimestamp(),
      });

      // 2. Update user balance atomically
      const userRef = doc(db, "users", userId);
      batch.update(userRef, {
        tjBalance: increment(rewardAmount),
        jamBalance: increment(rewardAmount),
        updatedAt: serverTimestamp(),
      });

      // 3. Record the reward transaction
      const txRef = doc(collection(db, "transactions"));
      batch.set(txRef, {
        type: "claim_rewards",
        amount: rewardAmount,
        userId: userId,
        status: "completed",
        timestamp: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
        participants: [userId],
        trackTitle: `Task Reward: ${task.title}`,
      });

      await batch.commit();

      // Update local state after successful atomic commit
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, claimed: true, completed: true, progress: t.total }
            : t,
        ),
      );
      setUserProfile((prev) => ({
        ...prev,
        tjBalance: (prev.tjBalance || 0) + rewardAmount,
        jamBalance: (prev.jamBalance || 0) + rewardAmount,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${taskId}/claim`);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanObject = <T extends object>(obj: T): T => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined),
    ) as T;
  };

  const updateUserRole = async (
    userId: string,
    role: "artist" | "collector" | "admin",
  ) => {
    if (userProfile.role !== "admin") {
      addNotification("Only admins can update user roles", "error");
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role });
      addNotification(`User role updated to ${role}`, "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/role`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("tonjam_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("tonjam_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("tonjam_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (isPlaying && currentTrack && user) {
        const streamPaymentTimeout = setTimeout(async () => {
          // Process real royalty distribution
          try {
            await royaltyService.processStreamRoyalty(currentTrack);
            addNotification(
              `Stream royalty processed for "${currentTrack.title}"`,
              "info",
            );
          } catch (error) {
            console.error("Failed to process stream royalty:", error);
          }
        }, 10000); // Trigger after 10 seconds of playback

        return () => clearTimeout(streamPaymentTimeout);
      }
    };
    checkAuth();
  }, [isPlaying, currentTrack?.id]);

  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      followedUserIds,
      followedArtists: followedUserIds, // Assuming all followed users are artists for now or we just sync them
      following: followedUserIds.length,
    }));
  }, [followedUserIds, setUserProfile]);

  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFTItem[]>([]);
  const [firestorePlaylists, setFirestorePlaylists] = useState<Playlist[]>([]);
  const [firestoreTransactions, setFirestoreTransactions] = useState<
    Transaction[]
  >([]);
  const [firestorePosts, setFirestorePosts] = useState<Post[]>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<UserProfile[]>([]);
  const [firestoreTracks, setFirestoreTracks] = useState<Track[]>([]);
  const [firestoreNFTs, setFirestoreNFTs] = useState<NFTItem[]>([]);

  const [userBids, setUserBids] = useState<NFTItem[]>([]);

  // Sync with Firebase
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    let isMounted = true;

    // Add a mapping for user bids from MOCK data or local storage
    const savedBids = localStorage.getItem("tonjam_user_bids");
    if (savedBids) {
      setUserBids(JSON.parse(savedBids));
    } else {
      // Mock some initial bids for demonstration
      const initialBids = MOCK_NFTS.filter(
        (n) => n.listingType === "auction",
      ).slice(0, 2);
      setUserBids(initialBids);
    }

    // Load initial track metadata from IndexedDB to ensure robust offline startup
    indexedDbService
      .getTracks()
      .then((cachedTracks) => {
        if (isMounted && cachedTracks && cachedTracks.length > 0) {
          setFirestoreTracks((prev) =>
            prev.length === 0 ? cachedTracks : prev,
          );
        }
      })
      .catch((err) =>
        console.warn("Could not load offline tracks from IDB on launch:", err),
      );

    // Add a strict mode rapid mount/unmount delay for Firestore
    const timer = setTimeout(() => {
      if (!isMounted) return;

      const tracksUnsubscribe = onSnapshot(
        collection(db, "tracks"),
        (snapshot) => {
          const tracks = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Track,
          );
          setFirestoreTracks(tracks);
          // Persist to IndexedDB offline cache
          indexedDbService
            .saveTracks(tracks)
            .catch((err) =>
              console.warn("Could not save tracks to IDB Cache:", err),
            );
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "tracks");
          // Handle offline scenario explicitly by loading from cache if error
          indexedDbService
            .getTracks()
            .then((cachedTracks) => {
              if (isMounted && cachedTracks && cachedTracks.length > 0) {
                setFirestoreTracks(cachedTracks);
              }
            })
            .catch(console.error);
        },
      );

      const nftsUnsubscribe = onSnapshot(
        collection(db, "nfts"),
        (snapshot) => {
          const nfts = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as NFTItem,
          );
          setFirestoreNFTs(nfts);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "nfts"),
      );

      const postsUnsubscribe = onSnapshot(
        collection(db, "posts"),
        (snapshot) => {
          const posts = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Post,
          );
          setFirestorePosts(posts);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "posts"),
      );

      const sponsoredUnsubscribe = onSnapshot(
        collection(db, "sponsoredContent"),
        (snapshot) => {
          const sponsored = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as SponsoredContent,
          );
          setSponsoredPosts(sponsored);
        },
        (error) =>
          handleFirestoreError(error, OperationType.LIST, "sponsoredContent"),
      );

      unsubs = [
        tracksUnsubscribe,
        nftsUnsubscribe,
        postsUnsubscribe,
        sponsoredUnsubscribe,
      ];
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Auth-dependent listeners
  useEffect(() => {
    let usersUnsubscribe: any = null;
    let transactionsUnsubscribe: any = null;
    let playlistsUnsubscribe: any = null;
    let userDocUnsubscribe: any = null;
    let playlistFoldersUnsubscribe: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Cleanup previous listeners
      if (usersUnsubscribe) usersUnsubscribe();
      if (transactionsUnsubscribe) transactionsUnsubscribe();
      if (playlistsUnsubscribe) playlistsUnsubscribe();
      if (userDocUnsubscribe) userDocUnsubscribe();
      if (playlistFoldersUnsubscribe) playlistFoldersUnsubscribe();

      if (user) {
        // 1. Start protected collection listeners
        usersUnsubscribe = onSnapshot(
          query(collection(db, "users"), where("isVerifiedArtist", "==", true)),
          (snapshot) => {
            const users = snapshot.docs.map(
              (doc) => ({ uid: doc.id, ...doc.data() }) as UserProfile,
            );
            setFirestoreUsers(users);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, "users"),
        );

        playlistFoldersUnsubscribe = onSnapshot(
          query(
            collection(db, "playlistFolders"),
            where("creator", "==", user.uid),
          ),
          (snapshot) => {
            const folders = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as PlaylistFolder,
            );
            setFirestorePlaylistFolders(folders);
          },
          (error) =>
            handleFirestoreError(error, OperationType.LIST, "playlistFolders"),
        );

        const transactionsQuery = query(
          collection(db, "transactions"),
          where("participants", "array-contains", user.uid),
        );
        transactionsUnsubscribe = onSnapshot(
          transactionsQuery,
          (snapshot) => {
            const txs = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as Transaction,
            );
            // Sort locally to avoid needing a composite index for participants array-contains + timestamp orderBy
            const sortedTxs = [...txs].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            );
            setFirestoreTransactions(sortedTxs);
          },
          (error) =>
            handleFirestoreError(error, OperationType.LIST, "transactions"),
        );

        const playlistsQuery = query(
          collection(db, "playlists"),
          or(where("isPrivate", "==", false), where("creator", "==", user.uid)),
        );
        playlistsUnsubscribe = onSnapshot(
          playlistsQuery,
          (snapshot) => {
            const playlists = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as Playlist,
            );
            setFirestorePlaylists(playlists);
          },
          (error) =>
            handleFirestoreError(error, OperationType.LIST, "playlists"),
        );

        // 2. Initial fetch and setup listener for current user profile
        const fetchUserProfile = async (retries = 3): Promise<void> => {
          try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              // Profile doesn't exist, create it
              const newProfile: UserProfile = {
                ...MOCK_USER,
                uid: user.uid,
                name: user.displayName || "Anonymous",
                avatar:
                  user.photoURL ||
                  getPlaceholderImage(`user-${user.uid}`, 200, 200),
                walletAddress: "",
                username:
                  user.email?.split("@")[0] || `user_${user.uid.slice(0, 5)}`,
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
                role: "collector",
                createdAt: new Date().toISOString(),
              };
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            } else {
              setUserProfile(userSnap.data() as UserProfile);
            }

            // Real-time listener for current user profile
            userDocUnsubscribe = onSnapshot(
              userRef,
              (snapshot) => {
                if (snapshot.exists()) {
                  setUserProfile(snapshot.data() as UserProfile);
                }
              },
              (error) =>
                handleFirestoreError(
                  error,
                  OperationType.GET,
                  `users/${user.uid}`,
                ),
            );
          } catch (error) {
            if (
              retries > 0 &&
              error instanceof Error &&
              error.message.includes("offline")
            ) {
              console.warn(
                `Retrying user profile fetch... (${retries} retries left)`,
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
              return fetchUserProfile(retries - 1);
            }
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
        };
        await fetchUserProfile();
      } else {
        setFirestoreUsers([]);
        setFirestoreTransactions([]);
        setUserProfile(MOCK_USER);
        if (usersUnsubscribe) usersUnsubscribe();
        if (transactionsUnsubscribe) transactionsUnsubscribe();
        if (userDocUnsubscribe) userDocUnsubscribe();
        if (playlistsUnsubscribe) playlistsUnsubscribe();

        // Public playlists for unauthenticated users
        const playlistsQuery = query(
          collection(db, "playlists"),
          where("isPrivate", "==", false),
        );
        playlistsUnsubscribe = onSnapshot(
          playlistsQuery,
          (snapshot) => {
            const playlists = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as Playlist,
            );
            setFirestorePlaylists(playlists);
          },
          (error) =>
            handleFirestoreError(error, OperationType.LIST, "playlists"),
        );
      }
    });

    return () => {
      unsubscribeAuth();
      if (usersUnsubscribe) usersUnsubscribe();
      if (transactionsUnsubscribe) transactionsUnsubscribe();
      if (playlistsUnsubscribe) playlistsUnsubscribe();
      if (userDocUnsubscribe) userDocUnsubscribe();
    };
  }, []);

  // Update local state when firestore data changes
  useEffect(() => {
    if (firestorePlaylists.length > 0) {
      setPlaylists(firestorePlaylists);
    }
  }, [firestorePlaylists]);

  useEffect(() => {
    if (firestorePlaylistFolders.length > 0) {
      setPlaylistFolders(firestorePlaylistFolders);
    }
  }, [firestorePlaylistFolders]);

  useEffect(() => {
    if (firestoreTransactions.length > 0) {
      setTransactions(firestoreTransactions);
    }
  }, [firestoreTransactions]);

  useEffect(() => {
    if (firestorePosts.length > 0) {
      setPosts(firestorePosts);
    }
  }, [firestorePosts]);

  useEffect(() => {
    if (firestoreUsers.length > 0) {
      // Sync artists with firestoreUsers who are verified artists
      const firestoreArtists = firestoreUsers
        .filter((u) => u.isVerifiedArtist)
        .map(
          (u) =>
            ({
              uid: u.uid,
              name: u.name,
              walletAddress: u.walletAddress,
              avatarUrl: u.avatar,
              followers: u.followers || 0,
              verified: u.isVerifiedArtist || u.isVerified || false,
              isVerifiedArtist: u.isVerifiedArtist || false,
              verificationStatus:
                u.verificationStatus ||
                (u.isVerifiedArtist || u.isVerified
                  ? "verified"
                  : "unverified"),
              bio: u.bio,
              bannerUrl: u.bannerUrl,
              socials: u.socials,
              royaltyConfig: (u as any).royaltyConfig,
              earnings: {
                streaming: Number((u as any).streamingEarnings || 0),
                nftSales: Number((u as any).nftEarnings || 0),
                total: Number((u as any).earnings || 0),
              },
            }) as Artist,
        );

      if (firestoreArtists.length > 0) {
        setArtists(firestoreArtists);
      }
    }
  }, [firestoreUsers]);

  const allTracks = React.useMemo(() => {
    const combined = [...MOCK_TRACKS, ...firestoreTracks];
    // De-duplicate by ID, later entries (Firestore) overwrite earlier ones (Mock)
    const unique = Array.from(new Map(combined.map((t) => [t.id, t])).values());
    return unique;
  }, [firestoreTracks]);

  const featuredPlaylist = useMemo(() => {
    // Logic to get featured tracks: mix of popular and newest
    const popular = [...allTracks]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 6);
    const newest = [...allTracks]
      .sort(
        (a, b) =>
          new Date(b.releaseDate || 0).getTime() -
          new Date(a.releaseDate || 0).getTime(),
      )
      .slice(0, 6);

    // Combine and de-duplicate, ensuring variety of artists
    const combined = [...popular, ...newest];
    const uniqueTrackIds = new Set<string>();
    const artistCount = new Map<string, number>();

    const featuredTracks: string[] = [];

    combined.forEach((track) => {
      if (!uniqueTrackIds.has(track.id)) {
        const count = artistCount.get(track.artist) || 0;
        if (count < 2) {
          // Max 2 tracks per artist in featured
          featuredTracks.push(track.id);
          uniqueTrackIds.add(track.id);
          artistCount.set(track.artist, count + 1);
        }
      }
    });

    return {
      id: "featured-tracks",
      title: "Featured Tracks",
      coverUrl:
        "https://image.pollinations.ai/prompt/playlist%20cover%20Featured%20Tracks%20dynamic%20music%20vibrant?width=600&height=600&nologo=true",
      trackCount: featuredTracks.length,
      creator: "TonJam AI",
      description:
        "Dynamically updated with popular hits and fresh releases from across the TON ecosystem.",
      trackIds: featuredTracks,
    };
  }, [allTracks]);

  const allPlaylists = useMemo(() => {
    return [featuredPlaylist, ...CURATED_PLAYLISTS, ...playlists];
  }, [playlists, featuredPlaylist]);

  const discoverWeekly = useMemo(
    () =>
      allPlaylists.find((p) =>
        p.title.toLowerCase().includes("discover weekly"),
      ),
    [allPlaylists],
  );

  const allNFTs = React.useMemo(() => {
    const combined = [...MOCK_NFTS, ...firestoreNFTs];
    // De-duplicate by ID, later entries (Firestore) overwrite earlier ones (Mock)
    const unique = Array.from(new Map(combined.map((n) => [n.id, n])).values());
    return unique;
  }, [firestoreNFTs]);

  const getTrendingTracks = useCallback(() => {
    return [...allTracks]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 10);
  }, [allTracks]);

  const getTopNFTTracks = useCallback(() => {
    return allTracks
      .filter((t) => t.isNFT)
      .sort((a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"))
      .slice(0, 10);
  }, [allTracks]);

  const getTracksByGenre = useCallback(
    (genre: string) => {
      return allTracks.filter(
        (t) => (t.genre || "").toLowerCase() === (genre || "").toLowerCase(),
      );
    },
    [allTracks],
  );

  const getRecommendations = useCallback(() => {
    const historyIds = new Set(recentlyPlayed.map((t) => t.id));
    const likedIds = new Set(likedTrackIds);
    const nftTrackIds = new Set(userNFTs.map((n) => n.trackId));

    const preferredGenres = new Map<string, number>();
    const preferredArtists = new Map<string, number>();

    if (userProfile.favoriteGenres) {
      userProfile.favoriteGenres.forEach((genre) => {
        preferredGenres.set(genre, (preferredGenres.get(genre) || 0) + 5);
      });
    }

    const analyzeTrack = (trackId: string, weight: number) => {
      const track = allTracks.find((t) => t.id === trackId);
      if (track) {
        preferredGenres.set(
          track.genre,
          (preferredGenres.get(track.genre) || 0) + weight,
        );
        preferredArtists.set(
          track.artistId || track.artist,
          (preferredArtists.get(track.artistId || track.artist) || 0) + weight,
        );
      }
    };

    recentlyPlayed.forEach((t) => analyzeTrack(t.id, 1));
    likedTrackIds.forEach((id) => analyzeTrack(id, 2));
    userNFTs.forEach((n) => analyzeTrack(n.trackId, 3));

    const sortedGenres = Array.from(preferredGenres.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    const sortedArtists = Array.from(preferredArtists.entries()).sort(
      (a, b) => b[1] - a[1],
    );

    const topGenres = sortedGenres.map((e) => e[0]);
    const topArtists = sortedArtists.map((e) => e[0]);

    // Social signals: tracks mentioned in posts or from followed artists
    const socialSignalTrackIds = new Set<string>();
    posts.forEach((post) => {
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
      if (followedArtistIds.has(track.artistId || "")) {
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
      if (
        isNew &&
        (track.playCount || 0) > 100 &&
        (track.playCount || 0) < 5000
      ) {
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
      .filter(
        (track) =>
          !historyIds.has(track.id) &&
          !likedIds.has(track.id) &&
          !nftTrackIds.has(track.id),
      )
      .map((track) => {
        const { score, reason } = getTrackRecommendation(track);
        return {
          ...track,
          recommendationReason: reason,
          recommendationScore: score,
        };
      })
      .filter((t) => t.recommendationScore > 5)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 20);

    // Fallback if not enough recommendations
    if (recommendedTracks.length < 10) {
      const trending = getTrendingTracks().filter(
        (t) =>
          !recommendedTracks.find((rt) => rt.id === t.id) &&
          !historyIds.has(t.id) &&
          !likedIds.has(t.id) &&
          !nftTrackIds.has(t.id),
      );
      recommendedTracks.push(
        ...trending.slice(0, 15 - recommendedTracks.length).map((t) => ({
          ...t,
          recommendationReason: "Trending globally",
          recommendationScore: 3,
        })),
      );
    }

    const recommendedNFTs = allNFTs
      .filter((nft) => {
        if (userNFTs.find((un) => un.id === nft.id)) return false;

        const track = allTracks.find((t) => t.id === nft.trackId);
        if (!track) return false;

        let score = 0;
        if (topGenres.includes(track.genre)) score += 5;
        if (topArtists.includes(track.artistId || track.artist)) score += 5;
        if (followedArtistIds.has(track.artistId || "")) score += 8;
        if (parseFloat(nft.price) > 50) score += 3;

        return score > 5;
      })
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 10);

    return { recommendedTracks, recommendedNFTs };
  }, [
    recentlyPlayed,
    likedTrackIds,
    userNFTs,
    userProfile.favoriteGenres,
    allTracks,
    allNFTs,
    posts,
    followedUserIds,
    getTrendingTracks,
  ]);

  useEffect(() => {
    if (userProfile.uid) {
      setUserTracks(
        firestoreTracks.filter((t) => t.artistId === userProfile.uid),
      );
      setUserNFTs(
        firestoreNFTs.filter(
          (n) =>
            n.artistId === userProfile.uid ||
            n.owner === userProfile.walletAddress,
        ),
      );
    }
  }, [firestoreTracks, firestoreNFTs, userProfile]);

  const updateNFT = async (
    nftId: string,
    updates: Partial<NFTItem>,
    silent: boolean = false,
  ) => {
    if (!nftId) {
      console.warn("Attempted to update undefined nftId");
      return;
    }
    setIsLoading(true);
    try {
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined),
      );

      const nftRef = doc(db, "nfts", nftId);
      const nftSnap = await getDoc(nftRef);

      if (!nftSnap.exists()) {
        // If it doesn't exist in Firestore, it must be a mock NFT
        // We find the full mock object and merge with updates using setDoc(merge: true)
        // because merge: true correctly handles deleteField()
        const fullNft = allNFTs.find((n) => n.id === nftId);
        if (fullNft) {
          await setDoc(
            nftRef,
            { ...fullNft, ...cleanUpdates },
            { merge: true },
          );
        } else {
          await setDoc(nftRef, cleanUpdates, { merge: true });
        }
      } else {
        await updateDoc(nftRef, cleanUpdates);
      }

      if (!silent) addNotification("Asset protocol updated", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `nfts/${nftId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserTrack = async (track: Track) => {
    setIsLoading(true);
    try {
      // Ensure songId is present
      const trackWithId = {
        ...track,
        songId:
          track.songId ||
          `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Optimistic update
      setFirestoreTracks((prev) => {
        if (prev.find((t) => t.id === trackWithId.id)) return prev;
        return [...prev, trackWithId];
      });

      const cleanTrack = cleanObject(trackWithId);
      await setDoc(doc(db, "tracks", track.id), cleanTrack);
      addNotification(`Track "${track.title}" uploaded`, "success");
    } catch (error) {
      console.warn("Firestore error saving track:", error);
      // Even if remote save fails in preview mode, keep track in local session
      addNotification(
        `Track "${track.title}" uploaded locally (Preview Mode)`,
        "success",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrack = async (trackId: string, updates: Partial<Track>) => {
    setIsLoading(true);
    try {
      const cleanUpdates = cleanObject(updates);
      await updateDoc(doc(db, "tracks", trackId), cleanUpdates);
      if (currentTrack?.id === trackId) {
        setCurrentTrack((prev) => (prev ? { ...prev, ...updates } : null));
      }
      addNotification("Track updated successfully", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tracks/${trackId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrack = async (trackId: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "tracks", trackId));
      addNotification("Track deleted successfully", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tracks/${trackId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserNFT = async (nft: NFTItem, silent: boolean = false) => {
    setIsLoading(true);
    try {
      const cleanNFT = cleanObject(nft);
      await setDoc(doc(db, "nfts", nft.id), cleanNFT);
      if (!silent) addNotification(`NFT "${nft.title}" minted`, "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `nfts/${nft.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const mintNFT = async (trackId: string, tonConnectUI: any) => {
    setIsLoading(true);
    try {
      if (!userProfile.uid) throw new Error("User must be logged in");

      const trackRef = doc(db, "tracks", trackId);
      const trackSnap = await getDoc(trackRef);

      if (!trackSnap.exists()) {
        throw new Error("Track not found");
      }

      const track = trackSnap.data() as Track;
      const mintedCount = track.minted || 0;
      const editionsCount = parseInt(track.editions || "0");

      if (mintedCount >= editionsCount && editionsCount > 0) {
        throw new Error("Sold out");
      }

      // 🔗 Call TON Blockchain here
      if (userProfile.walletAddress) {
        addNotification("Initiating TON transaction...", "info");
        // In a real app, we'd upload metadata to IPFS/Storage first
        // For this implementation, we'll use the existing track's coverUrl as the image
        const success = await tonService.mintTonJamNFT(
          tonConnectUI,
          userProfile.walletAddress,
          track.coverUrl, // Simplified for prototype
        );

        if (!success) throw new Error("TON transaction failed");
      }

      const nftId = `nft-${Date.now()}`;
      const newNFT: NFTItem = {
        id: nftId,
        trackId: trackId,
        title: track.title,
        owner: userProfile.walletAddress || userProfile.uid,
        creator: track.artist,
        artist: track.artist,
        artistId: track.artistId,
        imageUrl: track.coverUrl,
        price: track.price || "0",
        edition: `${mintedCount + 1}`,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "nfts", nftId), cleanObject(newNFT));

      await updateDoc(trackRef, {
        minted: mintedCount + 1,
      });

      // Increment Collector Genesis task
      const genesisTask = tasks.find((t) => t.id === "3");
      if (genesisTask && !genesisTask.completed) {
        updateTaskProgress("3", genesisTask.progress + 1);
      }

      addNotification(
        `Successfully minted edition #${mintedCount + 1} of ${track.title}`,
        "success",
      );
      return { success: true };
    } catch (error: any) {
      console.error("Minting error:", error);
      addNotification(error.message || "Minting failed", "error");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const setAnthem = async (nftId: string | null) => {
    setIsLoading(true);
    try {
      // Update local state
      setUserProfile((prev) => ({
        ...prev,
        anthemId: nftId || undefined,
      }));

      // Update Firestore if user is logged in
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          anthemId: nftId,
        });
      }

      if (nftId) {
        const nft = allNFTs.find((n) => n.id === nftId);
        addNotification(
          `"${nft?.title || "NFT"}" set as your profile anthem!`,
          "success",
        );
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
      localStorage.setItem(
        STORAGE_KEYS.CONTRACT_ADDRESS,
        genesisContractAddress,
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONTRACT_ADDRESS);
    }
  }, [genesisContractAddress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  /* Fix: Added effect to persist recently played tracks to local storage */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.RECENTLY_PLAYED,
      JSON.stringify(recentlyPlayed),
    );
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.LIKED_TRACKS,
      JSON.stringify(likedTrackIds),
    );
  }, [likedTrackIds]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.FOLLOWED_USERS,
      JSON.stringify(followedUserIds),
    );
  }, [followedUserIds]);

  const resetProtocol = () => {
    setGenesisContractAddress(null);
    localStorage.removeItem(STORAGE_KEYS.CONTRACT_ADDRESS);
    localStorage.removeItem("ton-connect-storage_http-bridge-framework");
    addNotification("App reset to initial state", "warning");
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (userProfile.walletAddress) {
        const balance = await tonService.getJettonBalance(
          userProfile.walletAddress,
          JAM_JETTON_MASTER,
        );
        setUserProfile((prev) => ({ ...prev, jamBalance: balance }));
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [userProfile.walletAddress]);

  const syncStakingRewards = useCallback(async () => {
    if (
      !auth.currentUser ||
      !userProfile.stakedJam ||
      userProfile.stakedJam <= 0
    )
      return;

    const lastUpdate = userProfile.lastStakingUpdate
      ? new Date(userProfile.lastStakingUpdate).getTime()
      : Date.now();
    const now = Date.now();
    const secondsPassed = (now - lastUpdate) / 1000;

    if (secondsPassed < 5) return; // Only sync if at least 5 seconds passed

    const staked = Number(userProfile.stakedJam);
    const apr = 0.15; // 15%
    const rewardRatePerSecond = apr / (365 * 24 * 60 * 60);
    const reward = staked * rewardRatePerSecond * secondsPassed;

    if (reward > 0.000001) {
      // Only sync if reward is meaningful
      try {
        const isAuto = userProfile.autoCompound || false;
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          [isAuto ? "stakedJam" : "pendingJamRewards"]: increment(reward),
          lastStakingUpdate: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error syncing staking rewards:", error);
      }
    }
  }, [userProfile.stakedJam, userProfile.lastStakingUpdate, userProfile.autoCompound]);

  // Staking Reward Accumulation (Local UI updates)
  useEffect(() => {
    if (!userProfile.stakedJam || userProfile.stakedJam <= 0) return;

    const interval = setInterval(() => {
      const staked = Number(userProfile.stakedJam || 0);
      if (staked > 0) {
        const rewardRate = 0.15 / (365 * 24 * 60 * 6);
        const reward = staked * rewardRate;

        setUserProfile((prev) => {
          const isAuto = prev.autoCompound || false;
          if (isAuto) {
            return {
              ...prev,
              stakedJam: (prev.stakedJam || 0) + reward,
            };
          } else {
            return {
              ...prev,
              pendingJamRewards: (prev.pendingJamRewards || 0) + reward,
            };
          }
        });
      }
    }, 10000);

    // Periodic sync to Firestore (every 2 minutes)
    const syncInterval = setInterval(syncStakingRewards, 120000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [userProfile.stakedJam, syncStakingRewards]);

  // Handle expired auctions without bids
  useEffect(() => {
    const checkExpiredAuctions = async () => {
      // Find NFTs that are auctions, have ended, and have no bids
      const expiredEmptyAuctions = allNFTs.filter(
        (nft) =>
          nft.listingType === "auction" &&
          nft.auctionEndTime &&
          new Date(nft.auctionEndTime).getTime() <= Date.now() &&
          (!nft.offers || nft.offers.length === 0),
      );

      if (expiredEmptyAuctions.length === 0) return;

      for (const nft of expiredEmptyAuctions) {
        console.log(
          `Auto-returning NFT ${nft.id} because auction ended without bids.`,
        );

        // Remove listingType to "return" the NFT to the owner's vault
        // We use silent=true to avoid multiple notifications if many expire,
        // but we'll show one specific notification if the current user is the owner
        await updateNFT(
          nft.id,
          {
            // Use deleteField() for Firestore or null for Local
            listingType: deleteField() as any,
            // Clear auction metadata
            auctionStartTime: deleteField() as any,
            auctionEndTime: deleteField() as any,
            auctionEndDate: deleteField() as any,
            startingBid: deleteField() as any,
          },
          true,
        );

        // Add a notification if the current user is the owner
        const currentWallet = tonAddress || userProfile.walletAddress;
        if (nft.owner === currentWallet || nft.owner === userProfile.uid) {
          addNotification(
            `Auction for "${nft.title}" ended without bids. Asset returned to your vault.`,
            "info",
          );
        }
      }
    };

    // Check periodically
    const interval = setInterval(checkExpiredAuctions, 15000); // Check every 15 seconds

    // Also check on mount
    checkExpiredAuctions();

    return () => clearInterval(interval);
  }, [
    allNFTs,
    userProfile.walletAddress,
    userProfile.uid,
    tonAddress,
    updateNFT,
  ]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;

          // NOTE: Disabling Web Audio API connection for now to prevent CORS-related muting issues.
          // This ensures playback works reliably even if the mock audio servers don't send correct CORS headers.
          const source = audioContextRef.current.createMediaElementSource(
            audioRef.current,
          );
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      } catch (err) {
        console.error("Failed to initialize Web Audio API:", err);
      }
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (
              error.name !== "AbortError" &&
              !error.message?.includes("interrupted")
            )
              console.error("Playback error:", error);
          });
        }
      } else {
        nextTrack();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    /* Sync volume and mute state */
    audio.volume = isMuted ? 0 : volume;

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [queue, currentTrack, repeatMode, isShuffle]);

  const addNotification = (
    message: string,
    type: "success" | "info" | "error" | "warning" = "info",
    duration: number = 3000,
  ) => {
    if (type === "success") toast.success(message, { duration });
    else if (type === "error") toast.error(message, { duration });
    else if (type === "warning") toast.warning(message, { duration });
    else toast.info(message, { duration });
  };

  useEffect(() => {
    const syncWallet = async () => {
      if (
        tonAddress &&
        auth.currentUser &&
        userProfile.walletAddress !== tonAddress
      ) {
        try {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            walletAddress: tonAddress,
          });
          setUserProfile((prev) => ({ ...prev, walletAddress: tonAddress }));
          addNotification("Wallet address synced with profile", "success");
        } catch (error) {
          console.error("Error syncing wallet address:", error);
        }
      }
    };
    syncWallet();
  }, [tonAddress, userProfile.walletAddress]);

  const recordTransaction = async (
    txData: Omit<Transaction, "id" | "timestamp" | "status">,
  ) => {
    setIsLoading(true);
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const participants = [auth.currentUser?.uid].filter(Boolean) as string[];
    const newTx: Transaction & { participants: string[] } = {
      ...txData,
      id: txId,
      userId: auth.currentUser?.uid,
      participants,
      timestamp: new Date().toISOString(),
      status: "completed",
      txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
    };

    try {
      const cleanTx = cleanObject(newTx);
      if (auth.currentUser) {
        await setDoc(doc(db, "transactions", txId), cleanTx);
      }
      setTransactions((prev) => [newTx, ...prev]);

      // Update user/artist earnings based on transaction
      if (txData.type === "nft_sale" || txData.type === "stream") {
        const share = Number(txData.artistShare);

        // If the recipient is the current user, update their profile earnings
        if (
          txData.recipientAddress === userProfile.walletAddress &&
          auth.currentUser
        ) {
          const userRef = doc(db, "users", userProfile.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentUser = userSnap.data() as UserProfile;
            const updateFields: any = {
              earnings: increment(share),
            };
            if (txData.type === "stream") {
              updateFields.streamingEarnings = increment(share);
            } else if (txData.type === "nft_sale") {
              updateFields.nftEarnings = increment(share);
            }
            await updateDoc(userRef, updateFields);
          }
        }

        // Update the artist's earnings in Firestore if they are a registered user
        const artistId = txData.trackId
          ? allTracks.find((t) => t.id === txData.trackId)?.artistId
          : txData.nftId
            ? allNFTs.find((n) => n.id === txData.nftId)?.artistId
            : null;

        if (artistId && auth.currentUser) {
          const artistRef = doc(db, "users", artistId);
          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            const updateFields: any = {
              earnings: increment(share),
            };
            if (txData.type === "stream") {
              updateFields.streamingEarnings = increment(share);
            } else if (txData.type === "nft_sale") {
              updateFields.nftEarnings = increment(share);
            }
            await updateDoc(artistRef, updateFields);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `transactions/${txId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const depositTON = async (amount: string) => {
    setIsLoading(true);
    try {
      if (!tonConnectUI.connected) {
        addNotification("Please connect your wallet first", "error");
        return;
      }

      // Simulate a deposit transaction
      // In a real app, this would call a smart contract to deposit TON
      const success = await tonService.depositTON(tonConnectUI, amount);

      if (success) {
        recordTransaction({
          type: "deposit",
          amount: Number(amount),
          platformFee: 0,
          artistShare: 0,
          recipientAddress: "PLATFORM_WALLET",
          senderAddress: userProfile.walletAddress,
          txHash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });

        setUserProfile((prev) => ({
          ...prev,
          tonBalance: (prev.tonBalance || 0) + Number(amount),
        }));

        addNotification(`Successfully deposited ${amount} TON`, "success");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      addNotification("Failed to deposit TON", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawTON = async (amount: string, address: string) => {
    setIsLoading(true);
    try {
      if (!tonConnectUI.connected) {
        addNotification("Please connect your wallet first", "error");
        return;
      }

      if ((userProfile.tonBalance || 0) < Number(amount)) {
        addNotification("Insufficient TON balance", "error");
        return;
      }

      // Simulate a withdrawal transaction
      // In a real app, this would call a backend service to send TON from the platform wallet to the user
      // We'll simulate success here
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const success = true;

      if (success) {
        recordTransaction({
          type: "withdrawal",
          amount: Number(amount),
          platformFee: 0,
          artistShare: 0,
          recipientAddress: address,
          senderAddress: "PLATFORM_WALLET",
          txHash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });

        setUserProfile((prev) => ({
          ...prev,
          tonBalance: Math.max(0, (prev.tonBalance || 0) - Number(amount)),
        }));

        addNotification(`Successfully withdrew ${amount} TON`, "success");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      addNotification("Failed to withdraw TON", "error");
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

      const success = await tonService.purchaseJAM(
        tonConnectUI,
        amount,
        jamAmount,
      );

      if (success) {
        recordTransaction({
          type: "jam_purchase",
          amount: Number(amount),
          platformFee: 0,
          artistShare: 0,
          recipientAddress: "PLATFORM_WALLET",
          senderAddress: userProfile.walletAddress,
          trackTitle: `Purchased ${jamAmount} JAM`,
        });

        if (auth.currentUser) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            jamBalance: increment(Number(jamAmount)),
          });
        }

        addNotification(`Successfully purchased ${jamAmount} JAM!`, "success");
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
          type: "premium_subscription",
          amount: Number(amount),
          platformFee: Number(amount),
          artistShare: 0,
          recipientAddress: "PLATFORM_WALLET",
          senderAddress: userProfile.walletAddress,
          trackTitle: "Premium Subscription",
        });

        if (auth.currentUser) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            isPremium: true,
          });
        }

        addNotification("Welcome to TonJam Premium!", "success");
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
      await syncStakingRewards(); // Sync rewards before changing stake amount
      const currentBalance = Number(userProfile.jamBalance || 0);
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          jamBalance: increment(-stakeAmount),
          stakedJam: increment(stakeAmount),
          lastStakingUpdate: new Date().toISOString(),
        });
      }

      recordTransaction({
        type: "stake",
        amount: 0, // Staking is internal to JAM
        platformFee: 0,
        artistShare: 0,
        recipientAddress: "STAKING_CONTRACT",
        senderAddress: userProfile.walletAddress,
        trackTitle: `Staked ${amount} JAM`,
      });

      addNotification(`Successfully staked ${amount} JAM`, "success");
    } catch (error) {
      addNotification("Staking failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const unstakeJam = async (amount: string) => {
    setIsLoading(true);
    try {
      await syncStakingRewards(); // Sync rewards before changing stake amount
      const currentStaked = Number(userProfile.stakedJam || 0);
      const unstakeAmount = parseFloat(amount);

      if (unstakeAmount <= 0) {
        addNotification("Invalid unstake amount", "error");
        return;
      }

      if (currentStaked < unstakeAmount) {
        addNotification("Insufficient staked JAM", "error");
        return;
      }

      // 24-hour cooldown after staking validation
      const lastStake = (transactions || [])
        .filter((tx: any) => tx.type === "stake")
        .sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )[0];
      if (lastStake) {
        const lastStakeTime = new Date(lastStake.timestamp).getTime();
        const diff = Date.now() - lastStakeTime;
        const cooldownMs = 24 * 60 * 60 * 1000;
        if (diff < cooldownMs) {
          const hoursLeft = Math.ceil((cooldownMs - diff) / (60 * 60 * 1000));
          addNotification(
            `Unstaking locked due to 24-hour cooldown after staking. ${hoursLeft} hour(s) remaining.`,
            "error",
          );
          return;
        }
      }

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          stakedJam: increment(-unstakeAmount),
          jamBalance: increment(unstakeAmount),
          lastStakingUpdate: new Date().toISOString(),
        });
      }

      recordTransaction({
        type: "unstake",
        amount: 0,
        platformFee: 0,
        artistShare: 0,
        recipientAddress: userProfile.walletAddress || "USER_WALLET",
        senderAddress: "STAKING_CONTRACT",
        trackTitle: `Unstaked ${amount} JAM`,
      });

      addNotification(`Successfully unstaked ${amount} JAM`, "success");
    } catch (error) {
      addNotification("Unstaking failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const claimJamRewards = async () => {
    setIsLoading(true);
    try {
      await syncStakingRewards(); // Sync rewards before claiming
      const pendingRewards = Number(userProfile.pendingJamRewards || 0);

      if (pendingRewards <= 0) {
        addNotification("No rewards to claim", "info");
        return;
      }

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          pendingJamRewards: 0,
          jamBalance: increment(pendingRewards),
          lastStakingUpdate: new Date().toISOString(),
        });
      }

      recordTransaction({
        type: "claim_rewards",
        amount: 0,
        platformFee: 0,
        artistShare: 0,
        recipientAddress: userProfile.walletAddress || "USER_WALLET",
        senderAddress: "STAKING_CONTRACT",
        trackTitle: `Claimed ${pendingRewards.toFixed(4)} JAM rewards`,
      });

      addNotification(
        `Successfully claimed ${pendingRewards.toFixed(4)} JAM rewards`,
        "success",
      );
    } catch (error) {
      addNotification("Claiming rewards failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoCompound = async () => {
    setIsLoading(true);
    try {
      if (!auth.currentUser) {
        addNotification("Connect wallet or sign in as user first.", "warning");
        return;
      }
      await syncStakingRewards(); // Sync first so we don't lose any accrued timing
      const currentAuto = userProfile.autoCompound || false;
      const nextAuto = !currentAuto;

      if (nextAuto) {
        // If enabling auto-compound, instantly reinvest any existing pending rewards!
        const pendingRewards = Number(userProfile.pendingJamRewards || 0);
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          autoCompound: true,
          stakedJam: increment(pendingRewards),
          pendingJamRewards: 0,
          lastStakingUpdate: new Date().toISOString(),
        });
        
        if (pendingRewards > 0) {
          recordTransaction({
            type: "stake",
            amount: 0,
            platformFee: 0,
            artistShare: 0,
            recipientAddress: "STAKING_CONTRACT",
            senderAddress: userProfile.walletAddress,
            trackTitle: `Auto-Compounded ${pendingRewards.toFixed(4)} JAM rewards`,
          });
          addNotification(
            `Auto-Compound enabled! Reinvested ${pendingRewards.toFixed(4)} JAM into staked balance.`,
            "success"
          );
        } else {
          addNotification("Auto-Compound enabled successfully!", "success");
        }
      } else {
        // Just disable auto-compound
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          autoCompound: false,
          lastStakingUpdate: new Date().toISOString(),
        });
        addNotification("Auto-Compound disabled.", "info");
      }
    } catch (error) {
      console.error("Error toggling auto-compound:", error);
      addNotification("Failed to update Auto-Compound status.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (postData: Partial<Post>) => {
    setIsLoading(true);
    const postId = `post-${Date.now()}`;
    const newPost: Post = {
      id: postId,
      userId: userProfile.uid,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      username: userProfile.username,
      content: "",
      likes: 0,
      comments: 0,
      reposts: 0,
      timestamp: new Date().toISOString(),
      ...postData,
    };

    try {
      // Filter out undefined values to prevent Firestore errors
      const cleanPost = Object.fromEntries(
        Object.entries(newPost).filter(([_, v]) => v !== undefined),
      ) as Post;

      await setDoc(doc(db, "posts", postId), cleanPost);
      setPosts((prev) => [newPost, ...prev]);

      // Increment Signal Broadcaster task
      const postTask = tasks.find((t) => t.id === "4");
      if (postTask && !postTask.completed) {
        updateTaskProgress("4", postTask.progress + 1);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `posts/${postId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addCommentToPost = async (
    postId: string,
    commentData: Partial<PostComment>,
  ) => {
    if (!postId) {
      console.warn("Attempted to comment on undefined postId");
      return;
    }
    if (!auth.currentUser) {
      addNotification("Please log in to comment", "error");
      return;
    }

    try {
      const commentId = `comment-${Date.now()}`;
      const newComment: PostComment = {
        id: commentId,
        postId: postId,
        userId: auth.currentUser.uid,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
        content: commentData.content || "",
        timestamp: commentData.timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        likes: commentData.likes || 0,
        reactions: {},
        userReactions: [],
        ...commentData,
      };

      const cleanComment = cleanObject(newComment);
      await setDoc(
        doc(db, "posts", postId, "comments", commentId),
        cleanComment,
      );

      // Also update the comment count on the post
      await updateDoc(doc(db, "posts", postId), {
        commentsCount: increment(1),
      });

      addNotification("Comment posted", "success");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `posts/${postId}/comments`,
      );
    }
  };

  const toggleLikePost = async (postId: string) => {
    if (!postId) {
      console.warn("Attempted to like undefined postId");
      return;
    }
    if (!auth.currentUser) {
      addNotification("Please log in to like", "error");
      return;
    }

    const userId = auth.currentUser.uid;
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const postRef = doc(db, "posts", postId);

    try {
      const likeSnap = await getDoc(likeRef);
      if (likeSnap.exists()) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1),
        });
      } else {
        // Like
        await setDoc(likeRef, {
          id: userId,
          postId: postId,
          userId: userId,
          createdAt: new Date().toISOString(),
        });
        await updateDoc(postRef, {
          likes: increment(1),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `posts/${postId}/likes/${userId}`,
      );
    }
  };

  const deletePost = async (postId: string) => {
    if (!postId) {
      console.warn("Attempted to delete undefined postId");
      return;
    }
    setIsLoading(true);
    try {
      if (postId.startsWith("post-")) {
        await deleteDoc(doc(db, "posts", postId));
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      addNotification("Post deleted", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    if (!postId) {
      console.warn("Attempted to update undefined postId");
      return;
    }
    if (!auth.currentUser) {
      addNotification("Please log in to perform this action", "error");
      return;
    }
    try {
      if (postId.startsWith("post-")) {
        // Filter out undefined values to prevent Firestore errors
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, v]) => v !== undefined),
        );
        await updateDoc(doc(db, "posts", postId), cleanUpdates);
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
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
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          jamBalance: increment(-jamCost),
        });
      }

      setPosts((prev) =>
        prev.map((p) => {
          if (p.trackId === trackId) {
            return { ...p, likes: p.likes + 10 }; // Jamming boosts likes significantly in the feed
          }
          return p;
        }),
      );

      addNotification(
        "Track Jammed! Signal boosted across the network.",
        "success",
      );

      await recordTransaction({
        type: "jam_purchase",
        amount: 0,
        platformFee: 0,
        artistShare: 0.9, // 90% goes to artist
        recipientAddress:
          MOCK_TRACKS.find((t) => t.id === trackId)?.artistId || "ARTIST",
        senderAddress: userProfile.walletAddress,
        trackTitle: `Jammed Track: ${MOCK_TRACKS.find((t) => t.id === trackId)?.title}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseTrack = async (trackId: string) => {
    if (!auth.currentUser) {
      addNotification("Please log in to purchase tracks", "warning");
      return;
    }

    const track = allTracks.find((t) => t.id === trackId);
    if (!track) {
      addNotification("Track artifact not found", "error");
      return;
    }

    if (!track.price || parseFloat(track.price) <= 0) {
      addNotification("This artifact is available for free", "info");
      return;
    }

    const price = parseFloat(track.price);
    if (userProfile.tonBalance && userProfile.tonBalance < price) {
      addNotification("Insufficient TON balance in your neural link", "error");
      return;
    }

    setIsLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const artistId = track.artistId;

      // 1. Distribute Royalties (handles platform fee and splits)
      await royaltyService.distributeRoyalties(
        price,
        artistId,
        track.royaltySplits || [],
        "nft_sale", // Reusing nft_sale type for simplicity
        { trackId: track.id, trackTitle: track.title },
      );

      // 2. Update Buyer Balance and Inventory in Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        tonBalance: increment(-price),
        ownedTrackIds: arrayUnion(trackId),
      });

      // Increment Collector Genesis task
      const genesisTask = tasks.find((t) => t.id === "3");
      if (genesisTask && !genesisTask.completed) {
        updateTaskProgress("3", genesisTask.progress + 1);
      }

      addNotification(
        `Neural acquisition complete: "${track.title}"`,
        "success",
      );

      // Update local state
      setUserProfile((prev) => ({
        ...prev,
        tonBalance: (prev.tonBalance || 0) - price,
      }));
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `tracks/${trackId}/purchase`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const joinJamRoom = (roomId: string) => {
    const room = {
      id: roomId,
      name: roomId === "genesis" ? "Genesis Node" : "Cyber Drift Room",
      listeners: Math.floor(Math.random() * 50) + 10,
      currentTrack: MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)],
    };
    setActiveJamRoom(room);
    addNotification(`Joined Jam Room: ${room.name}`, "success");
    if (room.currentTrack) playTrack(room.currentTrack);
  };

  const leaveJamRoom = () => {
    setActiveJamRoom(null);
    addNotification("Disconnected from Jam Room", "info");
  };

  const updateRoyaltyConfig = async (
    artistId: string,
    config: Artist["royaltyConfig"],
  ) => {
    if (!artistId) {
      console.warn("Attempted to update undefined artistId royalty config");
      return;
    }
    setIsLoading(true);
    try {
      setArtists((prev) =>
        prev.map((artist) =>
          artist.uid === artistId
            ? { ...artist, royaltyConfig: config }
            : artist,
        ),
      );

      if (auth.currentUser) {
        await updateDoc(doc(db, "users", artistId), { royaltyConfig: config });
      }

      addNotification("Royalty protocol updated", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${artistId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      return [track, ...filtered].slice(0, 10);
    });

    // Increment stream task progress
    const streamTask = tasks.find((t) => t.id === "1");
    if (streamTask && !streamTask.completed) {
      updateTaskProgress("1", streamTask.progress + 1);
    }

    if (audioRef.current) {
      // Ensure AudioContext is running
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current
          .resume()
          .catch((err) => console.warn("Failed to resume AudioContext:", err));
      }

      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }

      setCurrentTrack(track);

      // Increment streams
      const trackRef = doc(db, "tracks", track.id);
      await updateDoc(trackRef, {
        playCount: increment(1),
      }).catch(console.warn);

      let sourceUrl =
        track.audioUrl ||
        "https://storage.googleapis.com/media-session/sintel/snow-fight.mp3";

      if (isOffline) {
        const cachedUrl = await audioCacheService.getCachedTrack(track.id);
        if (cachedUrl) {
          sourceUrl = cachedUrl;
          addNotification("Playing from cache", "info");
        } else {
          addNotification("Track not available offline", "error");
          return;
        }
      } else {
        // Cache if not already cached
        const isCached = await audioCacheService.isTrackCached(track.id);
        if (!isCached) {
          audioCacheService
            .cacheTrack(track.id, sourceUrl)
            .catch(console.error);
        }
      }

      let highFidelity = false;
      let exclusive = null;

      if (track.isNFT) {
        const ownedNFT =
          userNFTs.find((n) => n.trackId === track.id) ||
          (userProfile.ownedNftIds?.includes(track.id)
            ? allNFTs.find((n) => n.trackId === track.id)
            : null);

        if (ownedNFT) {
          highFidelity = true;
          exclusive = ownedNFT.exclusiveContent || null;
          if (track.audioIpfsUrl) {
            sourceUrl = track.audioIpfsUrl;
          }
          addNotification(
            "NFT Verified: Playing high-fidelity version",
            "success",
          );
        } else {
          addNotification(
            "Standard streaming. Own the NFT for high-fidelity audio.",
            "info",
          );
        }
      }

      setIsHighFidelity(highFidelity);
      setExclusiveContent(exclusive);

      try {
        // Reset crossOrigin to anonymous for each new track to allow visualizer
        // Only set crossOrigin if it's a remote URL
        if (sourceUrl.startsWith("http")) {
          audioRef.current.crossOrigin = "anonymous";
        } else {
          audioRef.current.removeAttribute("crossorigin");
        }

        audioRef.current.src = sourceUrl;
        audioRef.current.load(); // Explicitly call load()

        playPromiseRef.current = audioRef.current.play();
        if (playPromiseRef.current !== undefined) {
          playPromiseRef.current.catch((error) => {
            // Check for common playback errors
            const isInterrupted =
              error.name === "AbortError" ||
              error.message?.includes("interrupted");

            if (!isInterrupted) {
              console.warn(
                "[Audio] Primary source failed, attempting fallback...",
                error,
              );
              if (audioRef.current) {
                // First try: Same URL but without crossOrigin (fixes CORS issues but breaks visualizer)
                audioRef.current.pause();
                audioRef.current.removeAttribute("crossorigin");
                audioRef.current.src = sourceUrl;
                audioRef.current.load();

                const fallbackPromise = audioRef.current.play();
                if (fallbackPromise !== undefined) {
                  fallbackPromise.catch((e) => {
                    // Second try: different reliable fallback URL
                    console.warn(
                      "[Audio] CORS-less reload failed, trying global fallback...",
                      e,
                    );
                    if (audioRef.current) {
                      audioRef.current.src =
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
                      audioRef.current.load();
                      audioRef.current.play().catch((err) => {
                        if (
                          err.name !== "AbortError" &&
                          !err.message?.includes("interrupted")
                        ) {
                          console.error("[Audio] All fallbacks failed:", err);
                          addNotification(
                            "Playback protocol failed. Signal lost.",
                            "error",
                          );
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
          type: "stream",
          amount: 0.001,
          platformFee: 0.0001,
          artistShare: 0.0009,
          recipientAddress: track.artistId || "ARTIST",
          senderAddress: userProfile.walletAddress,
          trackId: track.id,
          trackTitle: track.title,
        });
      } catch (err) {
        console.error("Audio initialization error:", err);
        addNotification("Failed to initialize audio protocol", "error");
      }
    }

    if (!queue.find((t) => t.id === track.id))
      setQueue((prev) => [...prev, track]);
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
        await playPromiseRef.current.catch(() => {});
      }
      audioRef.current.pause();
    } else {
      try {
        // Ensure AudioContext is running
        if (audioContextRef.current?.state === "suspended") {
          audioContextRef.current
            .resume()
            .catch((err) =>
              console.warn("Failed to resume AudioContext:", err),
            );
        }

        playPromiseRef.current = audioRef.current.play();
        if (playPromiseRef.current !== undefined) {
          playPromiseRef.current.catch((error) => {
            if (
              error.name !== "AbortError" &&
              !error.message?.includes("interrupted")
            ) {
              console.error("[Audio] Playback error during toggle:", error);
              /* If it failed because of source issues, try to reload with fallbacks */
              if (currentTrack) {
                // If it's a "supported source" error, it's likely CORS or a dead link
                // We'll try the same robust fallback as playTrack
                console.warn("[Audio] Attempting recovery during toggle...");
                audioRef.current!.pause();
                audioRef.current!.removeAttribute("crossorigin");
                audioRef.current!.src =
                  currentTrack.audioUrl ||
                  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
                audioRef.current!.load();
                audioRef.current!.play().catch((e) => {
                  if (
                    e.name !== "AbortError" &&
                    !e.message?.includes("interrupted")
                  ) {
                    console.error("[Audio] Toggle recovery failed:", e);
                    addNotification(
                      "Audio signal lost. Recovery failed.",
                      "error",
                    );
                    setIsPlaying(false);
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

    if (repeatMode === "one") {
      playTrack(currentTrack);
      return;
    }

    const index = queue.findIndex((t) => t.id === currentTrack.id);
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      playTrack(queue[nextIndex]);
    } else if (index !== -1 && index < queue.length - 1) {
      playTrack(queue[index + 1]);
    } else if (repeatMode === "all") {
      playTrack(queue[0]);
    }
  };

  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const index = queue.findIndex((t) => t.id === currentTrack.id);
    if (index > 0) playTrack(queue[index - 1]);
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
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
      localStorage.setItem(STORAGE_KEYS.MUTED, "true");
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      localStorage.setItem(STORAGE_KEYS.MUTED, "false");
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
    if (!trackId) {
      console.warn("Attempted to like undefined track");
      return;
    }
    setIsLoading(true);
    try {
      const isLiked = likedTrackIds.includes(trackId);
      const newLikedTrackIds = isLiked
        ? likedTrackIds.filter((id) => id !== trackId)
        : [...likedTrackIds, trackId];

      setLikedTrackIds(newLikedTrackIds);

      // Update local firestoreTracks state
      setFirestoreTracks((prev) =>
        prev.map((t) =>
          t.id === trackId
            ? { ...t, likes: (t.likes || 0) + (isLiked ? -1 : 1) }
            : t,
        ),
      );

      // Update currentTrack if it's the one being liked
      if (currentTrack?.id === trackId) {
        setCurrentTrack((prev) =>
          prev
            ? { ...prev, likes: (prev.likes || 0) + (isLiked ? -1 : 1) }
            : null,
        );
      }

      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { likedTrackIds: newLikedTrackIds });

        const trackRef = doc(db, "tracks", trackId);
        await updateDoc(trackRef, { likes: increment(isLiked ? -1 : 1) });
      }

      if (isLiked) {
        addNotification("Track removed from favorites", "info");
      } else {
        addNotification("Track added to favorites", "success");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tracks/${trackId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const [artists, setArtists] = useState<Artist[]>(MOCK_ARTISTS);

  const toggleFollowUser = async (userId: string) => {
    if (!userId) {
      console.warn("Attempted to follow undefined userId");
      return;
    }
    setIsLoading(true);
    try {
      const isFollowing = followedUserIds.includes(userId);
      const newFollowedUserIds = isFollowing
        ? followedUserIds.filter((id) => id !== userId)
        : [...followedUserIds, userId];

      setFollowedUserIds(newFollowedUserIds);

      if (!isFollowing) {
        // Increment Network Supporter task
        const followTask = tasks.find((t) => t.id === "2");
        if (followTask && !followTask.completed) {
          updateTaskProgress("2", followTask.progress + 1);
        }
      }

      // Update artist follower count locally
      setArtists((currentArtists) =>
        currentArtists.map((artist) => {
          if (artist.uid === userId) {
            return {
              ...artist,
              followers: isFollowing
                ? Math.max(0, artist.followers - 1)
                : artist.followers + 1,
            };
          }
          return artist;
        }),
      );

      // Update userProfile following count and followedUserIds locally
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        following: isFollowing
          ? Math.max(0, prevProfile.following - 1)
          : prevProfile.following + 1,
        followedUserIds: newFollowedUserIds,
        followedArtists: newFollowedUserIds,
        followingCount: newFollowedUserIds.length,
      }));

      // Update Firebase if user is logged in
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          followedUserIds: newFollowedUserIds,
          following: newFollowedUserIds.length,
        });

        await updateDoc(doc(db, "users", userId), {
          followers: increment(isFollowing ? -1 : 1),
        });
      }

      if (isFollowing) {
        addNotification("Unfollowed user", "info");
      } else {
        addNotification("Followed user", "success");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const closePlayer = async () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setFullPlayerOpen(false);
  };

  const toggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    localStorage.setItem(STORAGE_KEYS.SHUFFLE, String(nextShuffle));
    if (nextShuffle) {
      setQueue((prev) => [...prev].sort(() => Math.random() - 0.5));
    }
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    localStorage.setItem(STORAGE_KEYS.REPEAT, nextMode);
  };

  const createNewPlaylist = async (
    name: string,
    description?: string,
    initialTrack?: Track,
    coverUrl?: string,
    isPrivate?: boolean,
    isCollaborative?: boolean,
    tags?: string[],
  ) => {
    setIsLoading(true);
    const playlistId = Date.now().toString();
    const newPlaylist: Playlist = {
      id: playlistId,
      title: name,
      coverUrl:
        coverUrl || "" /* Leave empty for dynamic collage/placeholder */,
      trackCount: initialTrack ? 1 : 0,
      creator: userProfile.name,
      description,
      trackIds: initialTrack ? [initialTrack.id] : [],
      isPrivate,
      isCollaborative,
      tags,
      updatedAt: new Date().toISOString(),
    };

    try {
      const cleanPlaylist = cleanObject(newPlaylist);
      await setDoc(doc(db, "playlists", playlistId), cleanPlaylist);
      setPlaylists((prev) => [newPlaylist, ...prev]);
      if (initialTrack) {
        addNotification(
          `Created "${name}" and added "${initialTrack.title}"`,
          "success",
        );
      } else {
        addNotification(`Created playlist "${name}"`, "success");
      }
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `playlists/${playlistId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "playlists", playlistId));
      setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
      addNotification("Playlist deleted", "info");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `playlists/${playlistId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlaylist = async (
    playlistId: string,
    updates: Partial<Playlist>,
  ) => {
    setIsLoading(true);
    try {
      const updated = { ...updates, updatedAt: new Date().toISOString() };
      const cleanUpdates = cleanObject(updated);
      await updateDoc(doc(db, "playlists", playlistId), cleanUpdates);
      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === playlistId ? { ...pl, ...updated } : pl)),
      );
      addNotification("Playlist updated", "success");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `playlists/${playlistId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (title: string) => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const folderId = `folder-${Date.now()}`;
      const newFolder: PlaylistFolder = {
        id: folderId,
        title,
        creator: auth.currentUser.uid,
        playlistIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(
        doc(db, "playlistFolders", folderId),
        cleanObject(newFolder),
      );
      addNotification(`Folder "${title}" created`, "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "playlistFolders");
    } finally {
      setIsLoading(false);
    }
  };

  const renameFolder = async (folderId: string, newTitle: string) => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, "playlistFolders", folderId), {
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });
      addNotification(`Folder renamed to "${newTitle}"`, "success");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `playlistFolders/${folderId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    setIsLoading(true);
    try {
      const folder = playlistFolders.find((f) => f.id === folderId);
      if (folder && folder.playlistIds.length > 0) {
        // Unset folderId on all playlists in this folder
        const batch = writeBatch(db);
        folder.playlistIds.forEach((playlistId) => {
          batch.update(doc(db, "playlists", playlistId), { folderId: null });
        });
        await batch.commit();
      }
      await deleteDoc(doc(db, "playlistFolders", folderId));
      addNotification("Folder deleted", "info");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `playlistFolders/${folderId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const movePlaylistToFolder = async (
    playlistId: string,
    folderId: string | null,
  ) => {
    setIsLoading(true);
    try {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) throw new Error("Playlist not found");

      const oldFolderId = playlist.folderId;
      const batch = writeBatch(db);

      // 1. Update the playlist itself
      batch.update(doc(db, "playlists", playlistId), {
        folderId: folderId,
        updatedAt: new Date().toISOString(),
      });

      // 2. Remove from old folder if it exists
      if (oldFolderId) {
        const oldFolder = playlistFolders.find((f) => f.id === oldFolderId);
        if (oldFolder) {
          batch.update(doc(db, "playlistFolders", oldFolderId), {
            playlistIds: oldFolder.playlistIds.filter(
              (id) => id !== playlistId,
            ),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 3. Add to new folder if it exists
      if (folderId) {
        const newFolder = playlistFolders.find((f) => f.id === folderId);
        if (newFolder) {
          batch.update(doc(db, "playlistFolders", folderId), {
            playlistIds: arrayUnion(playlistId),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      await batch.commit();
      addNotification(
        folderId ? "Playlist moved to folder" : "Playlist removed from folder",
        "success",
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `playlists/${playlistId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateDiscoverWeekly = async () => {
    setIsLoading(true);
    try {
      // Check if Discover Weekly already exists and was updated this week
      const existingIndex = playlists.findIndex(
        (p) => p.title === "Discover Weekly",
      );
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
      const historyIds = new Set(recentlyPlayed.map((t) => t.id));
      const likedIds = new Set(likedTrackIds);
      const likedNftIds = new Set(userProfile.likedNftIds || []);
      const nftTrackIds = new Set(userNFTs.map((n) => n.trackId));

      // Find preferred genres and artists
      const preferredGenres = new Map<string, number>();
      const preferredArtists = new Map<string, number>();
      const favoredArtistIds = new Set(followedUserIds || []);

      const analyzeTrack = (trackId: string, weight: number) => {
        const track = allTracks.find((t) => t.id === trackId);
        if (track) {
          preferredGenres.set(
            track.genre,
            (preferredGenres.get(track.genre) || 0) + weight,
          );
          const artistKey = track.artistId || track.artist;
          preferredArtists.set(
            artistKey,
            (preferredArtists.get(artistKey) || 0) + weight,
          );
        }
      };

      recentlyPlayed.forEach((t) => analyzeTrack(t.id, 1));
      likedTrackIds.forEach((id) => analyzeTrack(id, 3)); // Likes weighted more
      userNFTs.forEach((n) => analyzeTrack(n.trackId, 5)); // Collected tracks weighted most

      // Add weight for interacted (liked) NFTs
      likedNftIds.forEach((nftId) => {
        const nft = allNFTs.find((n) => n.id === nftId);
        if (nft && nft.trackId) analyzeTrack(nft.trackId, 4);
      });

      // Add weight for followed artists
      favoredArtistIds.forEach((artistId) => {
        preferredArtists.set(
          artistId,
          (preferredArtists.get(artistId) || 0) + 4,
        );
      });

      // Sort preferences
      const topGenresList = Array.from(preferredGenres.entries())
        .sort((a, b) => b[1] - a[1])
        .map((e) => e[0]);
      const topArtistsList = Array.from(preferredArtists.entries())
        .sort((a, b) => b[1] - a[1])
        .map((e) => e[0]);

      // Generate recommendations
      const recommendations = allTracks.filter((track) => {
        // Don't recommend tracks they already own NFT of, but they can be in history
        if (nftTrackIds.has(track.id)) return false;

        // Exclude tracks already liked too much? No, maybe keep them if they are favorites,
        // but Discover Weekly usually aims for NEW stuff.
        if (likedIds.has(track.id)) return false;

        // Recommend based on genre or artist
        const matchesGenre = topGenresList.slice(0, 5).includes(track.genre);
        const matchesArtist = topArtistsList
          .slice(0, 5)
          .includes(track.artistId || track.artist);

        return matchesGenre || matchesArtist;
      });

      // If we don't have enough recommendations, add some trending tracks from same genres
      let finalTracks = recommendations
        .sort(() => 0.5 - Math.random())
        .slice(0, 20);
      if (finalTracks.length < 20) {
        const trendingByGenre = getTrendingTracks().filter(
          (t) =>
            !finalTracks.find((ft) => ft.id === t.id) &&
            topGenresList.slice(0, 3).includes(t.genre),
        );
        finalTracks = [...finalTracks, ...trendingByGenre].slice(0, 20);
      }

      // If still not enough, just trending
      if (finalTracks.length < 10) {
        const trending = getTrendingTracks().filter(
          (t) => !finalTracks.find((ft) => ft.id === t.id),
        );
        finalTracks = [...finalTracks, ...trending].slice(0, 20);
      }

      const playlistId =
        existingIndex !== -1 ? playlists[existingIndex].id : `dw-${Date.now()}`;
      const newPlaylist: Playlist = {
        id: playlistId,
        title: "Discover Weekly",
        coverUrl: getPlaceholderImage("discover", 400, 400),
        trackCount: finalTracks.length,
        creator: "TonJam AI",
        description:
          "Your weekly dose of fresh music, personalized based on your listening history, likes, and NFT collection.",
        trackIds: finalTracks.map((t) => t.id),
        updatedAt: now.toISOString(),
      };

      // Update Firebase if user is logged in
      if (auth.currentUser) {
        await setDoc(doc(db, "playlists", playlistId), newPlaylist);
      }

      setPlaylists((prev) => {
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newPlaylist;
          return updated;
        }
        return [newPlaylist, ...prev];
      });

      addNotification(
        "Your Discover Weekly playlist has been updated!",
        "success",
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        "playlists/discover-weekly",
      );
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
          addNotification(
            "Not enough data to generate recommendations yet",
            "info",
          );
          setIsLoading(false);
          return;
        }

        const name = `AI Playlist ${playlists.length + 1}`;
        const playlistId = Date.now().toString();
        const newPlaylist: Playlist = {
          id: playlistId,
          title: name,
          coverUrl: "",
          trackCount: tracksToUse.length,
          creator: "TonJam AI",
          description: "AI playlist generated based on your listening history.",
          trackIds: tracksToUse.map((t) => t.id),
          updatedAt: new Date().toISOString(),
        };

        if (auth.currentUser) {
          await setDoc(doc(db, "playlists", playlistId), newPlaylist);
        }

        setPlaylists((prev) => [newPlaylist, ...prev]);
        addNotification(
          `AI Playlist "${name}" created with ${tracksToUse.length} tracks`,
          "success",
        );
        setIsLoading(false);
        return;
      }

      // Use Gemini to generate a smart playlist
      const ai = new GoogleGenAI({ apiKey });

      const recentTrackNames = recentlyPlayed
        .slice(0, 5)
        .map((t) => `${t.title} by ${t.artist}`)
        .join(", ");
      const likedTrackNames = allTracks
        .filter((t) => likedTrackIds.includes(t.id))
        .slice(0, 5)
        .map((t) => `${t.title} by ${t.artist}`)
        .join(", ");
      const availableTracks = allTracks
        .map(
          (t) =>
            `ID: ${t.id} | Title: ${t.title} | Artist: ${t.artist} | Genre: ${t.genre}`,
        )
        .join("\n");

      const prompt = `
You are an expert AI DJ. Based on the user's recent listening history and liked tracks, create a new personalized playlist from the available catalog.
Recent listens: ${recentTrackNames || "None"}
Liked tracks: ${likedTrackNames || "None"}

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
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              trackIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "description", "trackIds"],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");

      if (!result.trackIds || result.trackIds.length === 0) {
        throw new Error("AI didn't return any tracks");
      }

      // Filter out invalid IDs just in case
      const validTrackIds = result.trackIds.filter((id: string) =>
        allTracks.some((t) => t.id === id),
      );

      if (validTrackIds.length === 0) {
        throw new Error("AI returned invalid track IDs");
      }

      const playlistId = Date.now().toString();
      const newPlaylist: Playlist = {
        id: playlistId,
        title: result.title || `AI Playlist ${playlists.length + 1}`,
        coverUrl: "",
        trackCount: validTrackIds.length,
        creator: "TonJam AI",
        description: result.description || "AI generated playlist.",
        trackIds: validTrackIds,
        updatedAt: new Date().toISOString(),
      };

      if (auth.currentUser) {
        await setDoc(doc(db, "playlists", playlistId), newPlaylist);
      }

      setPlaylists((prev) => [newPlaylist, ...prev]);
      addNotification(`AI Playlist "${newPlaylist.title}" created!`, "success");
    } catch (error) {
      console.error("AI Playlist Generation Error:", error);
      // Fallback
      addNotification(
        "Failed to generate AI playlist. Try again later.",
        "error",
      );
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
    const playlist = playlists.find((p) => p.id === playlistId);
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
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, "playlists", playlistId), updates);
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === playlistId) {
            return { ...pl, ...updates };
          }
          return pl;
        }),
      );
      addNotification(`Added "${track.title}" to ${playlist.title}`);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `playlists/${playlistId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeTrackFromPlaylist = async (
    playlistId: string,
    trackId: string,
  ) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    setIsLoading(true);
    const newIds = (playlist.trackIds || []).filter((id) => id !== trackId);
    const updates = {
      trackIds: newIds,
      trackCount: newIds.length,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, "playlists", playlistId), updates);
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === playlistId) {
            return { ...pl, ...updates };
          }
          return pl;
        }),
      );
      addNotification("Track removed from playlist", "info");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `playlists/${playlistId}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reorderTrackInPlaylist = async (
    playlistId: string,
    trackId: string,
    direction: "up" | "down",
  ) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || !playlist.trackIds) return;

    const index = playlist.trackIds.indexOf(trackId);
    if (index === -1) return;

    const newTrackIds = [...playlist.trackIds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newTrackIds.length) {
      setIsLoading(true);
      const temp = newTrackIds[index];
      newTrackIds[index] = newTrackIds[targetIndex];
      newTrackIds[targetIndex] = temp;

      const updates = {
        trackIds: newTrackIds,
        updatedAt: new Date().toISOString(),
      };

      try {
        await updateDoc(doc(db, "playlists", playlistId), updates);
        setPlaylists((prev) =>
          prev.map((pl) => {
            if (pl.id === playlistId) {
              return { ...pl, ...updates };
            }
            return pl;
          }),
        );
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.UPDATE,
          `playlists/${playlistId}`,
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getEarnings = async (userId: string) => {
    try {
      const snap = await getDocs(
        query(
          collection(db, "transactions"),
          where("participants", "array-contains", userId),
          where("status", "==", "completed"),
        ),
      );

      let total = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.artistShare) {
          total += data.artistShare;
        } else if (data.artistId === userId) {
          // Fallback for older transaction schema or if artistId is explicitly set
          total += data.price || data.amount || 0;
        }
      });

      return total;
    } catch (error) {
      console.error("Error fetching earnings:", error);
      return 0;
    }
  };

  const submitSponsorship = async (data: Partial<SponsoredContent>) => {
    setIsLoading(true);
    try {
      if (!auth.currentUser)
        throw new Error("Must be logged in to submit sponsorship");

      const sponsorshipData = {
        ...data,
        artistId: auth.currentUser.uid,
        artistName: userProfile.name,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "sponsoredContent"), sponsorshipData);
      addNotification(
        "Sponsorship request submitted for consideration",
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "sponsoredContent");
    } finally {
      setIsLoading(false);
    }
  };

  const approveSponsorship = async (id: string) => {
    if (userProfile.role !== "admin") return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, "sponsoredContent", id), {
        status: "approved",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
      });
      addNotification("Sponsorship approved and payment accepted", "success");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `sponsoredContent/${id}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const rejectSponsorship = async (id: string) => {
    if (userProfile.role !== "admin") return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, "sponsoredContent", id), { status: "rejected" });
      addNotification("Sponsorship request rejected", "info");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `sponsoredContent/${id}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const searchTracks = useCallback(
    async (queryText: string): Promise<Track[]> => {
      if (!queryText.trim()) return [];

      const searchLower = queryText.toLowerCase();

      return allTracks.filter(
        (track) =>
          (track.title || "").toLowerCase().includes(searchLower) ||
          (track.artist || "").toLowerCase().includes(searchLower) ||
          (track.genre && track.genre.toLowerCase().includes(searchLower)),
      );
    },
    [allTracks],
  );

  const searchArtists = useCallback(
    async (queryText: string): Promise<Artist[]> => {
      if (!queryText.trim()) return [];
      const searchLower = queryText.toLowerCase();
      return artists.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(searchLower) ||
          (a.genre && a.genre.toLowerCase().includes(searchLower)) ||
          (a.bio && a.bio.toLowerCase().includes(searchLower)),
      );
    },
    [artists],
  );

  const searchNFTs = useCallback(
    async (queryText: string): Promise<NFTItem[]> => {
      if (!queryText.trim()) return [];
      const searchLower = queryText.toLowerCase();
      return allNFTs.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(searchLower) ||
          (n.artist && n.artist.toLowerCase().includes(searchLower)) ||
          (n.description && n.description.toLowerCase().includes(searchLower)),
      );
    },
    [allNFTs],
  );

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        progress,
        isFullPlayerOpen,
        isShuffle,
        repeatMode,
        notifications,
        playlists,
        recentlyPlayed,
        likedTrackIds,
        followedUserIds,
        trackToAddToPlaylist,
        optionsTrack,
        optionsCallbacks,
        activePlaylistId,
        userProfile,
        genesisContractAddress,
        volume,
        isMuted,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        addToQueue,
        playAll,
        seek,
        setVolume,
        toggleMute,
        toggleLikeTrack,
        toggleFollowUser,
        closePlayer,
        setFullPlayerOpen,
        toggleShuffle,
        toggleRepeat,
        addNotification,
        setTrackToAddToPlaylist,
        setOptionsTrack,
        setActivePlaylistId,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        reorderTrackInPlaylist,
        searchTracks,
        searchArtists,
        searchNFTs,
        createNewPlaylist,
        deletePlaylist,
        updatePlaylist,
        generateDiscoverWeekly,
        createRecommendedPlaylist,
        clearRecentlyPlayed,
        setUserProfile,
        setAnthem,
        setGenesisContractAddress,
        userTracks,
        userNFTs,
        userBids,
        allTracks,
        allNFTs,
        artists,
        firestoreUsers,
        setArtists,
        addUserTrack,
        updateTrack,
        addUserNFT,
        updateNFT,
        recordTransaction,
        depositTON,
        withdrawTON,
        purchaseJAM,
        subscribePremium,
        stakeJam,
        unstakeJam,
        claimJamRewards,
        toggleAutoCompound,
        transactions,
        audioElement: audioRef.current,
        analyser: analyserRef.current,
        posts,
        createPost,
        addCommentToPost,
        toggleLikePost,
        deletePost,
        updatePost,
        playlistFolders,
        createFolder,
        renameFolder,
        deleteFolder,
        movePlaylistToFolder,
        sponsoredPosts,
        tasks,
        addTask,
        updateTaskProgress,
        completeTask,
        claimTaskReward,
        updateUserRole,
        getTrendingTracks,
        getTopNFTTracks,
        getTracksByGenre,
        getRecommendations,
        jamTrack,
        mintNFT,
        activeJamRoom,
        joinJamRoom,
        leaveJamRoom,
        allPlaylists,
        discoverWeekly,
        searchQuery,
        setSearchQuery,
        isHeaderSearchOpen,
        setIsHeaderSearchOpen,
        isDiscoverFiltersOpen,
        setIsDiscoverFiltersOpen,
        isCreatePlaylistModalOpen,
        setIsCreatePlaylistModalOpen,
        featuredPlaylist,
        updateRoyaltyConfig,
        marketplaceFilters,
        setMarketplaceFilters,
        jamspaceFilters,
        setJamspaceFilters,
        isLoading,
        deleteTrack,
        isHighFidelity,
        exclusiveContent,
        communityPosts: posts,
        addCommunityPost: createPost,
        resetProtocol,
        submitSponsorship,
        approveSponsorship,
        rejectSponsorship,
        isOffline,
        toggleOfflineMode,
        downloadTrackForOffline,
        isTrackCached,
        deleteCachedTrack,
        getEarnings,
        purchaseTrack,
        userAddress: tonAddress,
        headerTitle,
        setHeaderTitle,
      }}
    >
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
  if (!context)
    throw new Error("useAudio must be used within an AudioProvider");
  return context;
};

export const useUserRole = () => {
  const { userProfile } = useAudio();
  return useMemo(
    () => ({
      isAdmin: userProfile.role === "admin",
      isArtist: userProfile.role === "artist",
      isCollector: userProfile.role === "collector",
      role: userProfile.role,
    }),
    [userProfile.role],
  );
};

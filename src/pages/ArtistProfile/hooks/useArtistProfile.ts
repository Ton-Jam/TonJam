import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Artist, Track, NFTItem } from "@/types";
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS } from "@/constants";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  getArtistStats, 
  getMockAlbums, 
  getMockSingles, 
  getMockCollections, 
  getMockPlaylists, 
  getMockPosts, 
  getMockEvents, 
  getMockMutualFollowers, 
  getTopSupporters, 
  getArtistMissions, 
  getMockAnalytics 
} from "../mock";
import { 
  ArtistStats, 
  AlbumData, 
  NFTCollectionData, 
  PlaylistData, 
  ArtistPost, 
  ArtistEvent, 
  MutualFollower, 
  TopSupporter, 
  ArtistMission, 
  ArtistAnalyticsData 
} from "../types";

export const useArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    addNotification, 
    userProfile, 
    playTrack, 
    playAll, 
    followedUserIds, 
    toggleFollowUser,
    artists = [],
    allTracks = [],
    allNFTs = []
  } = useAudio();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Follow State
  const isFollowing = useMemo(() => {
    if (!artist) return false;
    return followedUserIds?.includes(artist.uid) || false;
  }, [followedUserIds, artist]);

  // Support State
  const [supportAmount, setSupportAmount] = useState<string>("5");
  const [isSupporting, setIsSupporting] = useState(false);

  // Dynamic States for Lists to support user liking/interacting
  const [tracks, setTracks] = useState<Track[]>([]);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [singles, setSingles] = useState<Track[]>([]);
  const [collections, setCollections] = useState<NFTCollectionData[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [events, setEvents] = useState<ArtistEvent[]>([]);
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [mutualFollowers, setMutualFollowers] = useState<MutualFollower[]>([]);
  const [topSupporters, setTopSupporters] = useState<TopSupporter[]>([]);
  const [missions, setMissions] = useState<ArtistMission[]>([]);
  const [analytics, setAnalytics] = useState<ArtistAnalyticsData | null>(null);

  // Sorting
  const [trackSort, setTrackSort] = useState<"plays" | "newest" | "title">("plays");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadArtistData = async () => {
      if (!id) {
        if (isMounted) {
          setArtist(null);
          setIsLoading(false);
        }
        return;
      }

      const targetId = decodeURIComponent(id).trim();
      const lowerTarget = targetId.toLowerCase();

      // 1. Try finding in loaded AudioContext artists
      let foundArtist: Artist | null = null;
      if (artists && artists.length > 0) {
        foundArtist = artists.find(a => 
          a.uid?.toLowerCase() === lowerTarget ||
          a.username?.replace('@', '').toLowerCase() === lowerTarget ||
          a.name?.toLowerCase() === lowerTarget ||
          a.name?.toLowerCase().replace(/\s+/g, '-') === lowerTarget
        ) || null;
      }

      // 2. Query Firestore 'artists' collection if not in local context
      if (!foundArtist) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const artistDoc = await getDoc(doc(db, 'artists', targetId));
          if (artistDoc.exists()) {
            foundArtist = { uid: artistDoc.id, ...artistDoc.data() } as Artist;
          }
        } catch (err) {
          console.warn('[useArtistProfile] Error fetching from artists collection:', err);
        }
      }

      // 3. Query Firestore 'users' collection for verified artist profile
      if (!foundArtist) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const userDoc = await getDoc(doc(db, 'users', targetId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            foundArtist = {
              uid: userDoc.id,
              name: userData.name || userData.displayName || 'Artist',
              username: userData.username ? (userData.username.startsWith('@') ? userData.username : `@${userData.username}`) : undefined,
              avatarUrl: userData.avatar || userData.photoURL,
              coverPhoto: userData.bannerUrl || userData.coverUrl,
              bio: userData.bio || '',
              walletAddress: userData.walletAddress || '',
              followers: userData.followers || 0,
              verified: Boolean(userData.isVerifiedArtist || userData.isVerified || userData.verificationStatus === 'verified'),
              isVerifiedArtist: Boolean(userData.isVerifiedArtist || userData.isVerified || userData.verificationStatus === 'verified'),
              genre: userData.genre,
              socials: userData.socials,
              earnings: userData.earnings ? { streaming: 0, nftSales: 0, total: userData.earnings } : undefined
            } as Artist;
          }
        } catch (err) {
          console.warn('[useArtistProfile] Error fetching from users collection:', err);
        }
      }

      if (!isMounted) return;

      if (!foundArtist) {
        // Honest not-found state without fabricated profiles
        setArtist(null);
        setTracks([]);
        setNfts([]);
        setAlbums([]);
        setPlaylists([]);
        setSingles([]);
        setCollections([]);
        setPosts([]);
        setEvents([]);
        setStats(null);
        setIsLoading(false);
        return;
      }

      setArtist(foundArtist);

      // Real statistics from authentic records
      setStats({
        monthlyListeners: (foundArtist as any).monthlyListeners || 0,
        followers: foundArtist.followers || 0,
        following: 0,
        streams: (foundArtist as any).totalStreams || (foundArtist as any).streams || 0,
        totalStreams: (foundArtist as any).totalStreams || (foundArtist as any).streams || 0,
        followersCount: foundArtist.followers || 0,
        tracksCount: 0,
        nftsCount: 0,
        albumsCount: 0,
        singlesCount: 0,
        playlistsCount: 0,
        nftCollectionsCount: 0,
        nftOwnersCount: 0,
        floorPrice: "0",
        totalSales: "0"
      });

      // Genuine artist tracks from context
      const artistTracks = (allTracks || []).filter(t => 
        t.artistId?.toLowerCase() === foundArtist!.uid.toLowerCase() ||
        t.artist?.toLowerCase() === foundArtist!.name.toLowerCase()
      );
      setTracks(artistTracks);
      setSingles(artistTracks);

      // Genuine artist NFTs from context
      const artistNFTs = (allNFTs || []).filter(n => 
        n.creator?.toLowerCase() === foundArtist!.name.toLowerCase() ||
        n.creator?.toLowerCase() === foundArtist!.uid.toLowerCase() ||
        n.artistId?.toLowerCase() === foundArtist!.uid.toLowerCase()
      );
      setNfts(artistNFTs);

      // Genuine artist albums & playlists
      setAlbums([]);
      setCollections([]);
      setPlaylists([]);
      setPosts([]);
      setEvents([]);
      setMutualFollowers([]);
      setTopSupporters([]);
      setMissions([]);
      setAnalytics(null);

      setIsLoading(false);
    };

    loadArtistData();

    return () => {
      isMounted = false;
    };
  }, [id, artists, allTracks, allNFTs]);

  // Actions
  const handleFollowToggle = useCallback(() => {
    if (!artist) return;
    toggleFollowUser(artist.uid);
    toast(isFollowing ? `Unfollowed ${artist.name}` : `Following ${artist.name}`);
    if (addNotification) {
      addNotification(
        isFollowing ? `You unfollowed ${artist.name}` : `You are now following ${artist.name}!`,
        "success"
      );
    }
  }, [artist, isFollowing, toggleFollowUser, addNotification]);

  const handlePlayAll = useCallback(() => {
    if (tracks.length === 0) return;
    playAll(tracks);
    toast(`Playing all tracks by ${artist?.name}`);
  }, [tracks, playAll, artist]);

  const handleShufflePlay = useCallback(() => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playAll(shuffled);
    toast(`Shuffling tracks by ${artist?.name}`);
  }, [tracks, playAll, artist]);

  const handleSupportArtist = useCallback(async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsSupporting(true);
    // Simulate TON blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSupporting(false);
    toast.success(`Successfully sent ${amount} TJ Coins to ${artist?.name || 'Artist'}!`);
    if (addNotification) {
      addNotification(`Sent ${amount} TJ Coins to ${artist?.name}!`, "success");
    }
  }, [artist, addNotification]);

  const handleLikePost = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLikedNow = !post.isLiked;
        return {
          ...post,
          isLiked: isLikedNow,
          likes: isLikedNow ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  }, []);

  const sortedTracks = useMemo(() => {
    const list = [...tracks];
    if (trackSort === "plays") {
      return list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (trackSort === "title") {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list; // default or newest (ordered as is)
  }, [tracks, trackSort]);

  return {
    artist,
    isLoading,
    isFollowing,
    activeTab,
    setActiveTab,
    stats,
    tracks: sortedTracks,
    rawTracks: tracks,
    nfts,
    albums,
    singles,
    collections,
    playlists,
    posts,
    events,
    mutualFollowers,
    topSupporters,
    missions,
    analytics,
    trackSort,
    setTrackSort,
    supportAmount,
    setSupportAmount,
    isSupporting,
    handleFollowToggle,
    handlePlayAll,
    handleShufflePlay,
    handleSupportArtist,
    handleLikePost,
    playTrack
  };
};

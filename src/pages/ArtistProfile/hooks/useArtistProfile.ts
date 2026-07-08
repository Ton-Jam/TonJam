import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Artist, Track, NFTItem } from "@/types";
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_NFTS } from "@/constants";
import { useAudio } from "@/context/AudioContext";
import { useAuth } from "@/context/AuthContext";
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
    toggleFollowUser 
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
    setIsLoading(true);
    // Find the artist by id or fallback to the first mock artist
    const targetId = id || "dj-krupy";
    const foundArtist = MOCK_ARTISTS.find(a => a.uid === targetId) || MOCK_ARTISTS[0];
    
    if (foundArtist) {
      setArtist(foundArtist);
      setStats(getArtistStats(foundArtist.uid));
      setAlbums(getMockAlbums(foundArtist.uid));
      setSingles(getMockSingles(foundArtist.uid));
      setCollections(getMockCollections(foundArtist.uid));
      setPlaylists(getMockPlaylists(foundArtist.uid));
      setPosts(getMockPosts());
      setEvents(getMockEvents(foundArtist.uid));
      setMutualFollowers(getMockMutualFollowers());
      setTopSupporters(getTopSupporters());
      setMissions(getArtistMissions());
      setAnalytics(getMockAnalytics());

      // Filter global tracks & NFTs
      const artistTracks = MOCK_TRACKS.filter(t => t.artistId === foundArtist.uid);
      setTracks(artistTracks.length > 0 ? artistTracks : MOCK_TRACKS.slice(0, 8));

      const artistNFTs = MOCK_NFTS.filter(n => n.creator === foundArtist.name);
      setNfts(artistNFTs.length > 0 ? artistNFTs : MOCK_NFTS.slice(0, 6));
    }
    
    // Simulate slight delay to trigger skeletons elegantly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [id]);

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

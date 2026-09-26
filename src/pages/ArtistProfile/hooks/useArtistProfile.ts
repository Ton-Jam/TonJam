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
    setIsLoading(true);
    const targetId = id ? decodeURIComponent(id).trim() : "dj-krupy";
    const lowerTarget = targetId.toLowerCase();
    
    // Combine context artists and MOCK_ARTISTS
    const allKnown = [...(artists || []), ...MOCK_ARTISTS];
    
    let foundArtist = allKnown.find(a => 
      a.uid?.toLowerCase() === lowerTarget ||
      a.username?.replace('@', '').toLowerCase() === lowerTarget ||
      a.name?.toLowerCase() === lowerTarget ||
      a.name?.toLowerCase().replace(/\s+/g, '-') === lowerTarget
    );

    // If still not found and target was supplied, generate dynamic profile
    if (!foundArtist && targetId) {
      const displayName = targetId
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      foundArtist = {
        uid: targetId,
        name: displayName,
        username: `@${targetId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        walletAddress: `UQ${targetId.slice(0, 4)}...8888`,
        avatarUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(displayName)}%20artist%20portrait%20photography%20studio?width=600&height=600&nologo=true`,
        followers: 12400,
        verified: true,
        isVerifiedArtist: true,
        genre: 'Afrobeats',
        bio: `${displayName} is an active creator and recording artist on TonJam, minting exclusive music NFT releases and streaming live on the TON blockchain.`,
        bannerUrl: "/default_tonjam_banner.jpg",
        bannerImageUrl: "/default_tonjam_banner.jpg",
        socials: { 
          x: `https://x.com/${targetId.toLowerCase().replace(/[^a-z0-9]/g, '')}`, 
          telegram: `https://t.me/${targetId.toLowerCase().replace(/[^a-z0-9]/g, '')}` 
        },
        earnings: { streaming: 320.0, nftSales: 1450.0, total: 1770.0 }
      };
    }

    if (!foundArtist) {
      foundArtist = MOCK_ARTISTS[0];
    }
    
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

      // Filter tracks from audioContext and mock
      const candidateTracks = (allTracks && allTracks.length > 0) ? allTracks : MOCK_TRACKS;
      const artistTracks = candidateTracks.filter(t => 
        t.artistId?.toLowerCase() === foundArtist!.uid.toLowerCase() ||
        t.artist?.toLowerCase() === foundArtist!.name.toLowerCase()
      );
      
      setTracks(artistTracks.length > 0 ? artistTracks : candidateTracks.slice(0, 5));

      // Filter NFTs from audioContext and mock
      const candidateNFTs = (allNFTs && allNFTs.length > 0) ? allNFTs : MOCK_NFTS;
      let artistNFTs = candidateNFTs.filter(n => 
        n.creator?.toLowerCase() === foundArtist!.name.toLowerCase() ||
        n.creator?.toLowerCase() === foundArtist!.uid.toLowerCase()
      );

      // Ensure at least 3 releases are always visible for the user to view/explore
      if (artistNFTs.length === 0) {
        artistNFTs = candidateNFTs.slice(0, 3).map((nft, idx) => ({
          ...nft,
          id: `nft-${foundArtist!.uid}-${idx + 1}`,
          creator: foundArtist!.name,
          title: `${foundArtist!.name} - ${nft.title || 'Genesis Single Drop'}`,
          edition: `1 of ${25 * (idx + 1)}`
        }));
      }

      setNfts(artistNFTs);
    }
    
    // Simulate slight delay to trigger skeletons elegantly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
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

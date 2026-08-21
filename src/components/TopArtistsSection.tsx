import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Award, 
  Flame, 
  Play, 
  Pause, 
  Disc, 
  Plus, 
  Check, 
  Crown,
  Zap,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { MOCK_ARTISTS, MOCK_TRACKS, TON_LOGO } from '@/constants';
import { Track } from '@/types';

export interface TopCreator {
  id: string;
  uid: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  volumeTON: number;
  activeNFTsCount: number;
  totalStreams: number;
  followersCount: number;
  topTrack?: Track;
  rank?: number;
}

type SortMetric = 'volume' | 'active' | 'streams' | 'trending';

export interface TopArtistsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showFilters?: boolean;
  variant?: 'scroll' | 'grid';
  className?: string;
}

export const TopArtistsSection: React.FC<TopArtistsSectionProps> = ({
  title = "Top Artists",
  subtitle = "Most active & highest-volume creators on Tonjam marketplace",
  limit = 12,
  showFilters = true,
  variant = 'scroll',
  className = ""
}) => {
  const navigate = useNavigate();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    followedUserIds = [], 
    toggleFollowUser,
    allTracks = [],
    artists = []
  } = useAudio();

  const [sortMetric, setSortMetric] = useState<SortMetric>('volume');
  const [realtimeSalesMap, setRealtimeSalesMap] = useState<Record<string, number>>({});
  const [realtimeListingsMap, setRealtimeListingsMap] = useState<Record<string, number>>({});
  const [realtimeStreamsMap, setRealtimeStreamsMap] = useState<Record<string, number>>({});
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Real-time Firestore listener for marketplace transactions and track activity
  useEffect(() => {
    let unsubscribeTx: (() => void) | undefined;
    let unsubscribeTracks: (() => void) | undefined;
    let unsubscribeNfts: (() => void) | undefined;

    try {
      // 1. Subscribe to NFT Sales / Transactions in real-time
      const txQuery = query(collection(db, "transactions"));
      unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
        const salesAcc: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'nft_sale' || data.type === 'jam_purchase' || data.type === 'mint' || data.type === 'trade') {
            const artistId = data.artistId || data.creatorId || data.sellerId || data.participants?.[0];
            const amount = Number(data.amount || data.price || 0);
            if (artistId) {
              salesAcc[artistId] = (salesAcc[artistId] || 0) + amount;
            }
          }
        });
        setRealtimeSalesMap(salesAcc);
        setIsLiveSynced(true);
      }, (err) => {
        console.warn("Realtime transactions snapshot listener notice:", err);
      });

      // 2. Subscribe to Tracks for active NFT counts and play counts
      const tracksQuery = query(collection(db, "tracks"));
      unsubscribeTracks = onSnapshot(tracksQuery, (snapshot) => {
        const listingsAcc: Record<string, number> = {};
        const streamsAcc: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const artistId = data.artistId || data.creator || data.artist;
          if (artistId) {
            listingsAcc[artistId] = (listingsAcc[artistId] || 0) + 1;
            streamsAcc[artistId] = (streamsAcc[artistId] || 0) + Number(data.playCount || data.streams || 0);
          }
        });
        setRealtimeListingsMap(prev => ({ ...prev, ...listingsAcc }));
        setRealtimeStreamsMap(prev => ({ ...prev, ...streamsAcc }));
      }, (err) => {
        console.warn("Realtime tracks snapshot listener notice:", err);
      });

      // 3. Subscribe to NFTs collection for active listings
      const nftsQuery = query(collection(db, "nfts"));
      unsubscribeNfts = onSnapshot(nftsQuery, (snapshot) => {
        const nftListings: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const artistId = data.artistId || data.creator || data.owner;
          if (artistId) {
            nftListings[artistId] = (nftListings[artistId] || 0) + 1;
          }
        });
        setRealtimeListingsMap(prev => {
          const merged = { ...prev };
          Object.entries(nftListings).forEach(([k, v]) => {
            merged[k] = Math.max(merged[k] || 0, v);
          });
          return merged;
        });
      }, (err) => {
        console.warn("Realtime nfts snapshot listener notice:", err);
      });

    } catch (err) {
      console.warn("Firestore listeners initialization fallback:", err);
    }

    return () => {
      if (unsubscribeTx) unsubscribeTx();
      if (unsubscribeTracks) unsubscribeTracks();
      if (unsubscribeNfts) unsubscribeNfts();
    };
  }, []);

  // Process & Compute Top Creators List dynamically
  const topCreators = useMemo(() => {
    const pool = artists.length > 0 ? artists : (MOCK_ARTISTS as any[]);
    const poolTracks: Track[] = allTracks.length > 0 ? allTracks : (MOCK_TRACKS as Track[]);

    const compiled: TopCreator[] = pool.map((art: any, idx) => {
      const uid = art.uid || art.id || `art-${idx + 1}`;
      const name = art.name || "Unknown Artist";
      const username = art.username || name.toLowerCase().replace(/\s+/g, '_');
      const avatar = art.avatarUrl || art.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`;
      const isVerified = Boolean(art.verified || art.isVerifiedArtist);

      // Find all tracks by this creator
      const creatorTracks = poolTracks.filter(t => 
        t.artistId === uid || 
        t.artist?.toLowerCase() === name.toLowerCase() ||
        (t as any).creator?.toLowerCase() === name.toLowerCase()
      );

      // Highest-played top track for audio preview
      const topTrack = creatorTracks.length > 0
        ? [...creatorTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))[0]
        : poolTracks[idx % poolTracks.length];

      // Dynamic real-time calculation
      const liveSales = realtimeSalesMap[uid] || 0;
      const liveListings = realtimeListingsMap[uid] || creatorTracks.length;
      const liveStreams = realtimeStreamsMap[uid] || creatorTracks.reduce((sum, t) => sum + (t.playCount || 0), 0);

      // Baseline fallback values if fresh
      const volumeTON = liveSales > 0 ? liveSales : (art.earnings?.nftSales || Math.floor((idx + 1) * 280 + 140));
      const activeNFTsCount = liveListings > 0 ? liveListings : Math.max(creatorTracks.length, Math.floor((100 - idx) * 0.8) + 3);
      const totalStreams = liveStreams > 0 ? liveStreams : (art.playCount || art.monthlyListeners || Math.floor((100 - idx) * 12500 + 8500));
      const followersCount = art.followers || Math.floor((100 - idx) * 850 + 1200);

      return {
        id: uid,
        uid,
        name,
        username,
        avatar,
        isVerified,
        volumeTON,
        activeNFTsCount,
        totalStreams,
        followersCount,
        topTrack
      };
    });

    // Sort based on active metric
    compiled.sort((a, b) => {
      if (sortMetric === 'volume') return b.volumeTON - a.volumeTON;
      if (sortMetric === 'active') return b.activeNFTsCount - a.activeNFTsCount;
      if (sortMetric === 'streams') return b.totalStreams - a.totalStreams;
      // Trending: weighted formula (Volume * 10 + ActiveNFTs * 50 + Streams * 0.01)
      const scoreA = (a.volumeTON * 10) + (a.activeNFTsCount * 50) + (a.totalStreams * 0.01);
      const scoreB = (b.volumeTON * 10) + (b.activeNFTsCount * 50) + (b.totalStreams * 0.01);
      return scoreB - scoreA;
    });

    // Assign rank
    return compiled.slice(0, limit).map((creator, i) => ({
      ...creator,
      rank: i + 1
    }));
  }, [artists, allTracks, realtimeSalesMap, realtimeListingsMap, realtimeStreamsMap, sortMetric, limit]);

  const handleTogglePlayTrack = (e: React.MouseEvent, track?: Track) => {
    e.stopPropagation();
    if (!track) return;
    playTrack(track);
  };

  const handleFollowClick = (e: React.MouseEvent, artistUid: string) => {
    e.stopPropagation();
    toggleFollowUser(artistUid);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className={`-mx-4 sm:-mx-6 md:-mx-8 space-y-3.5 text-left ${className}`} id="top-artists-section">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-section-title text-text-primary flex items-center gap-1.5">
              <Award className="w-5 h-5 text-blue-400 fill-blue-400/20" />
              {title}
            </h2>
            {isLiveSynced && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </span>
            )}
          </div>
        </div>

        {/* Filter Pills & Navigation Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {showFilters && (
            <div className="hidden md:flex items-center gap-1 bg-card/60 p-1 rounded-xl border border-white/5">
              {[
                { id: 'volume', label: 'Volume', icon: Zap },
                { id: 'active', label: 'NFTs', icon: Disc },
                { id: 'streams', label: 'Streams', icon: Play },
                { id: 'trending', label: 'Trending', icon: Flame },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = sortMetric === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSortMetric(tab.id as SortMetric)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {variant === 'scroll' && (
            <div className="flex items-center gap-1">
              <button
                onClick={scrollLeft}
                aria-label="Scroll Left"
                className="w-7 h-7 rounded-lg bg-card/80 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Scroll Right"
                className="w-7 h-7 rounded-lg bg-card/80 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button 
            onClick={() => navigate("/artists")} 
            className="text-xs font-bold text-primary flex items-center outline-none cursor-pointer border-none bg-transparent ml-1"
          >
            All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Filter Chips (visible on small screens) */}
      {showFilters && (
        <div className="flex md:hidden items-center gap-1.5 px-4 sm:px-6 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'volume', label: 'Volume', icon: Zap },
            { id: 'active', label: 'NFTs', icon: Disc },
            { id: 'streams', label: 'Streams', icon: Play },
            { id: 'trending', label: 'Trending', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = sortMetric === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSortMetric(tab.id as SortMetric)}
                className={`flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-card/60 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* HORIZONTAL SCROLLABLE ROW */}
      {variant === 'scroll' ? (
        <div 
          ref={scrollContainerRef}
          className="flex gap-3.5 overflow-x-auto no-scrollbar pb-3 px-4 sm:px-6 md:px-8 w-full scroll-smooth"
        >
          {topCreators.map((creator) => {
            const isFollowed = followedUserIds.includes(creator.uid);
            const isPlayingThisTrack = currentTrack?.id === creator.topTrack?.id && isPlaying;

            const isTop3 = (creator.rank || 99) <= 3;
            const rankBg = creator.rank === 1
              ? 'bg-amber-500 text-black font-black'
              : creator.rank === 2
                ? 'bg-cyan-400 text-black font-black'
                : creator.rank === 3
                  ? 'bg-purple-400 text-black font-black'
                  : 'bg-card/80 text-zinc-400 font-bold';

            return (
              <motion.div
                key={`scroll-artist-${creator.id}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/artist/${creator.uid}`)}
                className="w-[210px] sm:w-[230px] shrink-0 bg-card/60 backdrop-blur-md rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 cursor-pointer group relative overflow-hidden shadow-lg hover:bg-card/80"
              >
                {/* Top Row: Rank Badge & Follow Action */}
                <div className="flex items-center justify-between z-10">
                  <div className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider flex items-center gap-1 ${rankBg}`}>
                    {isTop3 && <Crown className="w-3 h-3 shrink-0" />}
                    <span>#{creator.rank}</span>
                  </div>

                  <button
                    onClick={(e) => handleFollowClick(e, creator.uid)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      isFollowed
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-white/10 hover:bg-white text-white hover:text-black'
                    }`}
                  >
                    {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{isFollowed ? 'Following' : 'Follow'}</span>
                  </button>
                </div>

                {/* Avatar & Creator Info */}
                <div className="flex flex-col items-center text-center space-y-2 z-10 pt-1">
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-16 h-16 rounded-full bg-zinc-900 object-cover group-hover:scale-105 transition-transform shadow-md"
                      loading="lazy"
                    />
                    {creator.isVerified && (
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 w-full">
                    <div className="flex items-center justify-center gap-1 max-w-full">
                      <h3 className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-cyan-400 transition-colors">
                        {creator.name}
                      </h3>
                      <ArtistVerificationBadge
                        isVerified={creator.isVerified}
                        artistName={creator.name}
                        artistUid={creator.uid}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 truncate">@{creator.username}</p>
                  </div>
                </div>

                {/* Volume & Activity Box */}
                <div className="w-full bg-white/5 rounded-xl p-2.5 space-y-1 z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Volume Traded</span>
                    <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded">+3.8%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
                    <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 shrink-0" />
                    <span>{creator.volumeTON.toLocaleString()} TON</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider pt-0.5">
                    <span>{creator.activeNFTsCount} Listed</span>
                    <span>•</span>
                    <span>{formatNumber(creator.totalStreams)} Plays</span>
                  </div>
                </div>

                {/* Top Track Quick Listen Preview */}
                {creator.topTrack && (
                  <button
                    onClick={(e) => handleTogglePlayTrack(e, creator.topTrack)}
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 hover:text-white transition-all flex items-center justify-between text-[9px] font-black uppercase tracking-wider z-10 cursor-pointer"
                  >
                    <span className="truncate max-w-[130px]">{creator.topTrack.title}</span>
                    {isPlayingThisTrack ? <Pause className="w-3 h-3 shrink-0" /> : <Play className="w-3 h-3 shrink-0 ml-1" />}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* GRID VIEW FALLBACK */
        <div className="px-4 sm:px-6 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {topCreators.map((creator) => {
            const isFollowed = followedUserIds.includes(creator.uid);
            return (
              <motion.div
                key={`grid-artist-${creator.id}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/artist/${creator.uid}`)}
                className="bg-card/60 hover:bg-card rounded-2xl p-4 flex flex-col items-center text-center justify-between space-y-3 transition-all border border-white/5 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-16 h-16 rounded-full bg-zinc-900 object-cover shadow-md"
                    loading="lazy"
                  />
                  <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-zinc-900 text-blue-400 flex items-center justify-center text-[10px] font-mono font-black border border-white/10">
                    #{creator.rank}
                  </span>
                  {creator.isVerified && (
                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 w-full">
                  <span className="text-xs font-black text-white uppercase block truncate group-hover:text-blue-400 transition-colors">
                    {creator.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block truncate">
                    @{creator.username}
                  </span>
                </div>

                <div className="w-full bg-white/5 rounded-xl p-2 space-y-1 text-center">
                  <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                    <img src={TON_LOGO} alt="TON" className="w-3 h-3" />
                    <span>{creator.volumeTON.toLocaleString()} TON</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                    <span>{creator.activeNFTsCount} NFTs</span>
                    <span>{formatNumber(creator.followersCount)} Fans</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleFollowClick(e, creator.uid)}
                  className={`w-full py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${
                    isFollowed
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="w-3 h-3" /> Following
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" /> Follow
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopArtistsSection;


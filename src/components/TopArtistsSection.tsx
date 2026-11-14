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
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { TON_LOGO } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';
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

  useEffect(() => {
    const unsubscribeSales = onSnapshot(
      query(collection(db, "nftSales")),
      (snapshot) => {
        const salesAcc: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const artistId = data.artistId || data.creatorId || data.sellerId;
          const amount = Number(data.salePrice ?? data.amount ?? data.price ?? 0);
          if (artistId) {
            salesAcc[artistId] = (salesAcc[artistId] || 0) + amount;
          }
        });
        setRealtimeSalesMap(salesAcc);
        setIsLiveSynced(true);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "nftSales")
    );

    const unsubscribeTracks = onSnapshot(
      query(collection(db, "tracks")),
      (snapshot) => {
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
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "tracks")
    );

    const unsubscribeNfts = onSnapshot(
      query(collection(db, "nfts")),
      (snapshot) => {
        const nftListings: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const artistId = data.artistId || data.creatorId || data.creator;
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
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "nfts")
    );

    return () => {
      unsubscribeSales();
      unsubscribeTracks();
      unsubscribeNfts();
    };
  }, []);

  const topCreators = useMemo(() => {
    if (!artists || artists.length === 0) return [];

    const compiled: TopCreator[] = artists.map((art: any) => {
      const uid = art.uid || art.id;
      const name = art.name || "Artist";
      const username = art.username || name.toLowerCase().replace(/\s+/g, '_');
      const avatar = art.avatarUrl || art.avatar || getPlaceholderImage(`artist-${uid}`);
      const isVerified = Boolean(art.verified || art.isVerifiedArtist);

      const creatorTracks = allTracks.filter(t => 
        t.artistId === uid || 
        t.artist?.toLowerCase() === name.toLowerCase() ||
        (t as any).creator?.toLowerCase() === name.toLowerCase()
      );

      const topTrack = creatorTracks.length > 0
        ? [...creatorTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))[0]
        : undefined;

      const liveSales = realtimeSalesMap[uid] || 0;
      const liveListings = realtimeListingsMap[uid] || 0;
      const liveStreams = realtimeStreamsMap[uid] ?? creatorTracks.reduce((sum, t) => sum + (t.playCount || 0), 0);

      const volumeTON = liveSales > 0 ? liveSales : (typeof art.earnings === 'number' ? art.earnings : (art.earnings?.nftSales || 0));
      const activeNFTsCount = liveListings;
      const totalStreams = liveStreams || art.playCount || art.monthlyListeners || 0;
      const followersCount = art.followers || 0;

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

    compiled.sort((a, b) => {
      if (sortMetric === 'volume') return b.volumeTON - a.volumeTON;
      if (sortMetric === 'active') return b.activeNFTsCount - a.activeNFTsCount;
      if (sortMetric === 'streams') return b.totalStreams - a.totalStreams;
      const scoreA = (a.volumeTON * 10) + (a.activeNFTsCount * 50) + (a.totalStreams * 0.01);
      const scoreB = (b.volumeTON * 10) + (b.activeNFTsCount * 50) + (b.totalStreams * 0.01);
      return scoreB - scoreA;
    });

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
    scrollContainerRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  };

  if (topCreators.length === 0) return null;

  return (
    <div className={`w-full space-y-3.5 text-left ${className}`} id="top-artists-section">
      <div className="flex items-center justify-between">
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

        <div className="flex items-center gap-2 shrink-0">
          {showFilters && (
            <div className="hidden md:flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-[3px] border border-white/12">
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
                    className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-[3px] transition-colors cursor-pointer whitespace-nowrap border ${
                      isActive
                        ? 'bg-[#0088CC] text-white border-[#0088CC]'
                        : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
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
                className="w-7 h-7 rounded-[3px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center border-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Scroll Right"
                className="w-7 h-7 rounded-[3px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center border-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button 
            onClick={() => navigate("/artists")} 
            className="text-xs font-semibold text-[#0088CC] hover:text-[#0088CC]/80 flex items-center outline-none cursor-pointer border-none bg-transparent ml-1"
          >
            All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
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
                className={`flex items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-[3px] transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-[#0088CC] text-white border-[#0088CC]'
                    : 'bg-[#0A0A0A] text-white/60 hover:text-white border-white/12'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {variant === 'scroll' ? (
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full scroll-smooth"
        >
          {topCreators.map((creator) => {
            const isFollowed = followedUserIds.includes(creator.uid);
            const isPlayingThisTrack = currentTrack?.id === creator.topTrack?.id && isPlaying;

            const isTop3 = (creator.rank || 99) <= 3;
            const rankBg = creator.rank === 1
              ? 'bg-amber-500 text-black font-semibold'
              : creator.rank === 2
                ? 'bg-[#0088CC] text-white font-semibold'
                : creator.rank === 3
                  ? 'bg-purple-400 text-black font-semibold'
                  : 'bg-white/10 text-white/60 font-semibold';

            return (
              <motion.div
                key={`scroll-artist-${creator.id}`}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/artist/${creator.uid}`)}
                className="w-[200px] sm:w-[220px] shrink-0 bg-[#0A0A0A] rounded-[3px] p-3 transition-colors flex flex-col justify-between space-y-2.5 cursor-pointer group relative overflow-hidden border border-white/12 hover:border-white/20"
              >
                <div className="flex items-center justify-between z-10">
                  <div className={`px-1.5 py-0.5 rounded-[3px] text-[8px] uppercase tracking-wider flex items-center gap-1 ${rankBg}`}>
                    {isTop3 && <Crown className="w-3 h-3 shrink-0" />}
                    <span>#{creator.rank}</span>
                  </div>

                  <button
                    onClick={(e) => handleFollowClick(e, creator.uid)}
                    className={`pill px-2.5 py-1 rounded-full text-[8px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors duration-300 cursor-pointer border-0 ${
                      isFollowed
                        ? 'bg-[#0088CC] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                    }`}
                  >
                    {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{isFollowed ? 'Following' : 'Follow'}</span>
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-1.5 z-10 pt-0.5">
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-14 h-14 rounded-full bg-[#101010] object-cover group-hover:scale-103 transition-transform border border-white/10"
                      loading="lazy"
                    />
                    {creator.isVerified && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#0088CC] text-white flex items-center justify-center text-[8px] font-bold border border-[#0A0A0A]">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 w-full">
                    <div className="flex items-center justify-center gap-1 max-w-full">
                      <h3 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-tight truncate group-hover:text-[#0088CC] transition-colors">
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
                    <p className="text-[9px] font-mono text-white/50 truncate">@{creator.username}</p>
                  </div>
                </div>

                <div className="w-full bg-[#101010] rounded-[3px] p-2 space-y-1 z-10 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-medium text-white/50 uppercase tracking-wider">Volume Traded</span>
                    <span className="text-[8px] font-mono text-slate-400 font-semibold px-1 py-0.2 rounded-[2px]">
                      {formatNumber(creator.followersCount)} Fans
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0088CC] font-mono">
                    <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{creator.volumeTON.toLocaleString()} TON</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-medium text-white/50 uppercase tracking-wider pt-0.5">
                    <span>{creator.activeNFTsCount} Listed</span>
                    <span>•</span>
                    <span>{formatNumber(creator.totalStreams)} Plays</span>
                  </div>
                </div>

                {creator.topTrack && (
                  <button
                    onClick={(e) => handleTogglePlayTrack(e, creator.topTrack)}
                    className="w-full py-1 px-2 rounded-[3px] bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center justify-between text-[8px] font-semibold uppercase tracking-wider z-10 cursor-pointer border border-white/5"
                  >
                    <span className="truncate max-w-[120px]">{creator.topTrack.title}</span>
                    {isPlayingThisTrack ? <Pause className="w-3 h-3 shrink-0 text-[#0088CC]" /> : <Play className="w-3 h-3 shrink-0 ml-1" />}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {topCreators.map((creator) => {
            const isFollowed = followedUserIds.includes(creator.uid);
            return (
              <motion.div
                key={`grid-artist-${creator.id}`}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/artist/${creator.uid}`)}
                className="bg-[#0A0A0A] hover:bg-[#101010] rounded-[3px] p-3 flex flex-col items-center text-center justify-between space-y-2.5 transition-colors border border-white/12 hover:border-white/20 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-14 h-14 rounded-full bg-[#101010] object-cover border border-white/10"
                    loading="lazy"
                  />
                  <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#101010] text-[#0088CC] flex items-center justify-center text-[9px] font-mono font-bold border border-white/12">
                    #{creator.rank}
                  </span>
                  {creator.isVerified && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#0088CC] text-white flex items-center justify-center text-[8px] font-bold border border-[#0A0A0A]">
                      ✓
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 w-full">
                  <span className="text-xs font-semibold text-[#F5F7FA] uppercase block truncate group-hover:text-[#0088CC] transition-colors">
                    {creator.name}
                  </span>
                  <span className="text-[9px] font-mono text-white/50 block truncate">
                    @{creator.username}
                  </span>
                </div>

                <div className="w-full bg-[#101010] rounded-[3px] p-2 space-y-1 text-center border border-white/5">
                  <div className="text-xs font-semibold text-[#0088CC] font-mono flex items-center justify-center gap-1">
                    <img src={TON_LOGO} alt="TON" className="w-3 h-3 opacity-80" />
                    <span>{creator.volumeTON.toLocaleString()} TON</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-medium text-white/50 uppercase tracking-wider px-0.5">
                    <span>{creator.activeNFTsCount} NFTs</span>
                    <span>{formatNumber(creator.followersCount)} Fans</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleFollowClick(e, creator.uid)}
                  className={`pill w-full py-1.5 rounded-full text-[8px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors duration-300 border-0 ${
                    isFollowed
                      ? 'bg-[#0088CC] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
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

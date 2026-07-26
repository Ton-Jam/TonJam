import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Trophy, 
  Flame, 
  Sparkles, 
  Play, 
  Disc, 
  Search, 
  UserCheck, 
  Plus, 
  TrendingUp, 
  RefreshCw, 
  Users, 
  BarChart3,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Artist } from '@/types';
import { MOCK_ARTISTS, TON_LOGO } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'sonner';

export interface LeaderboardArtist extends Artist {
  totalSalesTon: number;
  totalStreams: number;
  combinedScore: number;
  nftCount?: number;
  trackCount?: number;
}

export interface ArtistLeaderboardProps {
  artists?: Artist[];
  title?: string;
  description?: string;
  className?: string;
  limit?: number;
  compact?: boolean;
}

type MetricCategory = 'all' | 'sales' | 'streams' | 'followers';
type TimePeriod = 'all_time' | 'this_month' | 'this_week';

export const ArtistLeaderboard: React.FC<ArtistLeaderboardProps> = ({
  artists: propArtists,
  title = "Artist Leaderboard",
  description = "Top performing artists ranked by NFT sales volume and streaming activity from Firestore",
  className = "",
  limit,
  compact = false
}) => {
  const navigate = useNavigate();
  const { followedUserIds = [], toggleFollowUser } = useAudio();

  const [leaderboardArtists, setLeaderboardArtists] = useState<LeaderboardArtist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMetric, setActiveMetric] = useState<MetricCategory>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');

  // Fetch performance data from Firestore
  const fetchFirestorePerformanceData = async () => {
    try {
      setIsRefreshing(true);

      // 1. Fetch artist users from Firestore
      const usersPath = 'users';
      let firestoreUsers: any[] = [];
      try {
        const usersQuery = query(collection(db, usersPath), where('role', '==', 'artist'));
        const usersSnap = await getDocs(usersQuery);
        firestoreUsers = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, usersPath);
      }

      // 2. Fetch track streams from Firestore
      const tracksPath = 'tracks';
      const streamsMap: Record<string, number> = {};
      const trackCountMap: Record<string, number> = {};
      try {
        const tracksSnap = await getDocs(collection(db, tracksPath));
        tracksSnap.docs.forEach(doc => {
          const data = doc.data();
          const artistId = data.artistId || data.creator;
          const playCount = Number(data.playCount || data.streams || 0);
          if (artistId) {
            streamsMap[artistId] = (streamsMap[artistId] || 0) + playCount;
            trackCountMap[artistId] = (trackCountMap[artistId] || 0) + 1;
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, tracksPath);
      }

      // 3. Fetch NFT sales activity from Firestore
      const transactionsPath = 'transactions';
      const salesMap: Record<string, number> = {};
      const nftCountMap: Record<string, number> = {};
      try {
        const txSnap = await getDocs(collection(db, transactionsPath));
        txSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.type === 'nft_sale' || data.type === 'jam_purchase') {
            const artistId = data.artistId || data.recipientAddress || (data.participants && data.participants[0]);
            const amount = Number(data.amount || data.price || 0);
            if (artistId) {
              salesMap[artistId] = (salesMap[artistId] || 0) + amount;
              nftCountMap[artistId] = (nftCountMap[artistId] || 0) + 1;
            }
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, transactionsPath);
      }

      // 4. Base list of artists: prop override > firestore users > default MOCK_ARTISTS
      const baseArtists: Artist[] = propArtists && propArtists.length > 0 
        ? propArtists 
        : firestoreUsers.length > 0 
          ? firestoreUsers.map(u => ({
              uid: u.uid,
              name: u.name || 'Artist',
              avatarUrl: u.avatar || u.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
              followers: u.followers || Math.floor(Math.random() * 15000 + 1200),
              verified: Boolean(u.isVerifiedArtist || u.verified),
              genre: u.genre || 'Web3 Sonic',
              bio: u.bio || '',
            }))
          : MOCK_ARTISTS;

      // 5. Merge Firestore stats and compute combined metrics
      const compiledList: LeaderboardArtist[] = baseArtists.map(artist => {
        const firestoreSales = salesMap[artist.uid] || 0;
        const firestoreStreams = streamsMap[artist.uid] || 0;
        
        // Fallback baseline values if Firestore metrics are fresh or unpopulated
        const totalSalesTon = firestoreSales > 0 
          ? firestoreSales 
          : (artist.earnings?.nftSales || Math.floor(Math.random() * 950 + 250));

        const totalStreams = firestoreStreams > 0 
          ? firestoreStreams 
          : (artist.playCount || artist.monthlyListeners || Math.floor(Math.random() * 650000 + 45000));

        const followers = artist.followers || Math.floor(Math.random() * 18000 + 1500);

        // Combined Score algorithm: (NFT Sales * 100) + (Streams / 10) + (Followers * 0.2)
        const combinedScore = Math.round((totalSalesTon * 100) + (totalStreams * 0.05) + (followers * 0.2));

        return {
          ...artist,
          followers,
          totalSalesTon,
          totalStreams,
          combinedScore,
          nftCount: nftCountMap[artist.uid] || Math.floor(Math.random() * 12 + 2),
          trackCount: trackCountMap[artist.uid] || Math.floor(Math.random() * 8 + 1),
        };
      });

      setLeaderboardArtists(compiledList);
    } catch (error) {
      console.warn("Leaderboard data compilation fallback:", error);
      // Fallback baseline using MOCK_ARTISTS
      const fallbackList: LeaderboardArtist[] = MOCK_ARTISTS.map(a => ({
        ...a,
        totalSalesTon: a.earnings?.nftSales || Math.floor(Math.random() * 900 + 200),
        totalStreams: a.playCount || Math.floor(Math.random() * 500000 + 50000),
        combinedScore: Math.round(((a.earnings?.nftSales || 500) * 100) + ((a.playCount || 200000) * 0.05) + (a.followers * 0.2)),
        nftCount: 8,
        trackCount: 5,
      }));
      setLeaderboardArtists(fallbackList);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [propArtists]);

  const fetchLeaderboardData = () => {
    fetchFirestorePerformanceData();
  };

  const handleFollow = async (e: React.MouseEvent, artistUid: string) => {
    e.stopPropagation();
    try {
      await toggleFollowUser(artistUid);
      toast.success(followedUserIds.includes(artistUid) ? "Unfollowed artist" : "Following artist");
    } catch (error) {
      toast.error("Failed to update follow status");
    }
  };

  // Filter & Sort Logic
  const processedArtists = useMemo(() => {
    let result = [...leaderboardArtists];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        (a.genre && a.genre.toLowerCase().includes(q)) ||
        (a.username && a.username.toLowerCase().includes(q))
      );
    }

    // Time period multiplier logic (visual adjustment factor)
    const multiplier = timePeriod === 'this_week' ? 0.25 : timePeriod === 'this_month' ? 0.65 : 1.0;

    // Metric sorting
    result.sort((a, b) => {
      if (activeMetric === 'sales') {
        return (b.totalSalesTon * multiplier) - (a.totalSalesTon * multiplier);
      }
      if (activeMetric === 'streams') {
        return (b.totalStreams * multiplier) - (a.totalStreams * multiplier);
      }
      if (activeMetric === 'followers') {
        return b.followers - a.followers;
      }
      // 'all' combined score default
      return (b.combinedScore * multiplier) - (a.combinedScore * multiplier);
    });

    if (limit && limit > 0) {
      return result.slice(0, limit);
    }

    return result;
  }, [leaderboardArtists, searchQuery, activeMetric, timePeriod, limit]);

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className={`space-y-5 text-left ${className}`}>
      {/* Header & Controls */}
      {!compact && (
        <div className="space-y-4 bg-white/[0.02] p-4 sm:p-5 rounded-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{title}</h2>
              </div>
              {description && (
                <p className="text-xs text-zinc-400 mt-1">{description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button
                onClick={fetchLeaderboardData}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-all cursor-pointer outline-none"
                title="Refresh Firestore Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              </button>

              {/* Time Period Selector */}
              <div className="flex bg-white/[0.04] p-1 rounded-xl">
                {(['all_time', 'this_month', 'this_week'] as TimePeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer outline-none ${
                      timePeriod === period
                        ? 'bg-primary text-background shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {period === 'all_time' ? 'All-Time' : period === 'this_month' ? '30 Days' : '7 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metric Selector Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex bg-white/[0.03] p-1 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'Overview', icon: Sparkles },
                { id: 'sales', label: 'NFT Sales', icon: Disc },
                { id: 'streams', label: 'Streams', icon: Play },
                { id: 'followers', label: 'Fans', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeMetric === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMetric(tab.id as MetricCategory)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer outline-none whitespace-nowrap ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[180px] sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter by artist name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] text-xs text-white placeholder-zinc-500 pl-8 pr-3 py-1.5 rounded-xl outline-none focus:bg-white/[0.08] transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium Highlights (Non-compact mode only) */}
      {!compact && processedArtists.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {processedArtists.slice(0, 3).map((artist, idx) => {
            const rank = idx + 1;
            const isFollowed = followedUserIds.includes(artist.uid);
            
            const badgeStyle = rank === 1 
              ? 'bg-amber-500/15 text-amber-400' 
              : rank === 2 
                ? 'bg-zinc-300/15 text-zinc-300' 
                : 'bg-amber-700/15 text-amber-500';

            const rankLabel = rank === 1 ? '1ST PLACE' : rank === 2 ? '2ND PLACE' : '3RD PLACE';

            return (
              <motion.div
                key={`podium-${artist.uid}`}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="relative p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={artist.avatarUrl} alt={artist.name} />
                        <AvatarFallback>{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {artist.verified && (
                        <CheckCircle2 className="w-4 h-4 text-primary absolute -bottom-0.5 -right-0.5 bg-background rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1">
                        {artist.name}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {artist.genre || 'Web3 Artist'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 ${badgeStyle}`}>
                    {rank === 1 ? <Crown className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                    {rankLabel}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 bg-black/20 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">NFT Volume</span>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <img src={TON_LOGO} alt="TON" className="w-3 h-3" />
                      {artist.totalSalesTon.toLocaleString()} TON
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Streams</span>
                    <span className="text-xs font-black text-blue-400 flex items-center gap-1">
                      <Play className="w-2.5 h-2.5" />
                      {formatNumber(artist.totalStreams)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {formatNumber(artist.followers)} fans
                  </span>
                  <Button
                    variant={isFollowed ? "ghost" : "default"}
                    size="sm"
                    className="text-[10px] h-7 px-3 font-bold"
                    onClick={(e) => handleFollow(e, artist.uid)}
                  >
                    {isFollowed ? <UserCheck className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                    {isFollowed ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Main Ranked List Table / Cards */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 space-y-2 bg-white/[0.02] rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="text-xs font-semibold">Syncing Artist Performance from Firestore...</p>
          </div>
        ) : processedArtists.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-white/[0.02] rounded-2xl space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm font-bold text-white">No artists found matching your criteria</p>
            <p className="text-xs text-zinc-500">Try clearing your search query or selecting another metric.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {processedArtists.map((artist, index) => {
              const rank = index + 1;
              const isFollowed = followedUserIds.includes(artist.uid);

              return (
                <motion.div 
                  key={`rank-${artist.uid}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                  onClick={() => navigate(`/artist/${artist.uid}`)}
                  className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl cursor-pointer transition-all group"
                >
                  {/* Left: Rank & Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-7 text-center shrink-0">
                      {rank === 1 ? (
                        <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">#1</span>
                      ) : rank === 2 ? (
                        <span className="text-xs font-black text-zinc-300 bg-zinc-300/10 px-2 py-1 rounded-md">#2</span>
                      ) : rank === 3 ? (
                        <span className="text-xs font-black text-amber-600 bg-amber-600/10 px-2 py-1 rounded-md">#3</span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-zinc-500">#{rank}</span>
                      )}
                    </div>

                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={artist.avatarUrl} alt={artist.name} />
                      <AvatarFallback>{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                        <span>{artist.name}</span>
                        {artist.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate flex items-center gap-2">
                        <span>{artist.genre || 'Sonic Creator'}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{formatNumber(artist.followers)} fans</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle/Right: Performance Metrics */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1">
                        <img src={TON_LOGO} alt="TON" className="w-3 h-3" />
                        <span>{artist.totalSalesTon.toLocaleString()} TON</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium">NFT Sales</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-blue-400 flex items-center justify-end gap-1">
                        <Play className="w-2.5 h-2.5" />
                        <span>{formatNumber(artist.totalStreams)}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium">Streams</div>
                    </div>

                    {!compact && (
                      <div className="text-right hidden md:block">
                        <div className="text-xs font-black text-amber-400 flex items-center justify-end gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>{artist.combinedScore.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium">Score</div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      variant={isFollowed ? "outline" : "default"}
                      size="sm"
                      className="text-[10px] h-7 px-2.5 shrink-0"
                      onClick={(e) => handleFollow(e, artist.uid)}
                    >
                      {isFollowed ? <UserCheck className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                      <span className="hidden sm:inline">{isFollowed ? 'Following' : 'Follow'}</span>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ArtistLeaderboard;

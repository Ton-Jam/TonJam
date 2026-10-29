import React, { useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Play,
  Users,
  Coins,
  TrendingUp,
  Gem,
  Headphones,
  Music2,
  Sparkles,
  ArrowUpRight,
  Radio,
} from 'lucide-react';
import { useArtistAnalytics, TimeRange, AnalyticsMetricTab } from '@/contexts/ArtistAnalyticsContext';
import { Track, NFTItem } from '@/types';

interface ArtistAnalyticsDashboardProps {
  artistId?: string;
  artistName?: string;
  tracks?: Track[];
  nfts?: NFTItem[];
  className?: string;
  title?: string;
}

const CustomStreamTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111C30]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-2xl text-xs space-y-1 select-none pointer-events-none">
        <p className="font-bold text-white mb-1">{label}</p>
        <div className="flex items-center gap-2 text-[#229ED9]">
          <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
          <span className="text-zinc-300">Streams:</span>
          <span className="font-mono font-bold text-white">{payload[0]?.value?.toLocaleString()}</span>
        </div>
        {payload[1] && (
          <div className="flex items-center gap-2 text-[#9B7CFF]">
            <span className="w-2 h-2 rounded-full bg-[#9B7CFF]" />
            <span className="text-zinc-300">Listeners:</span>
            <span className="font-mono font-bold text-white">{payload[1]?.value?.toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomFollowerTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111C30]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-2xl text-xs space-y-1 select-none pointer-events-none">
        <p className="font-bold text-white mb-1">{label}</p>
        <div className="flex items-center gap-2 text-[#2DD4BF]">
          <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
          <span className="text-zinc-300">New Followers:</span>
          <span className="font-mono font-bold text-white">+{payload[0]?.value?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomNftTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111C30]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-2xl text-xs space-y-1 select-none pointer-events-none">
        <p className="font-bold text-white mb-1">{label}</p>
        <div className="flex items-center gap-2 text-[#FFC857]">
          <span className="w-2 h-2 rounded-full bg-[#FFC857]" />
          <span className="text-zinc-300">Volume:</span>
          <span className="font-mono font-bold text-white">{payload[0]?.value?.toLocaleString()} TON</span>
        </div>
        {payload[1] && (
          <div className="flex items-center gap-2 text-[#34D399]">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span className="text-zinc-300">Transactions:</span>
            <span className="font-mono font-bold text-white">{payload[1]?.value?.toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ArtistAnalyticsDashboard: React.FC<ArtistAnalyticsDashboardProps> = ({
  artistId,
  artistName,
  tracks,
  nfts,
  className = "",
  title = "Artist Analytics & Telemetry",
}) => {
  const {
    timeRange,
    setTimeRange,
    activeTab,
    setActiveTab,
    streamData,
    followerData,
    nftSalesData,
    topTracks,
    summary,
    setArtistContextData,
  } = useArtistAnalytics();

  // Sync props to context when passed
  useEffect(() => {
    if (artistId || artistName || (tracks && tracks.length) || (nfts && nfts.length)) {
      setArtistContextData({
        artistId,
        artistName,
        tracks,
        nfts,
      });
    }
  }, [artistId, artistName, tracks, nfts, setArtistContextData]);

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'all', label: 'All-Time' },
  ];

  const metricTabs: { id: AnalyticsMetricTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'streams', label: 'Streaming', icon: Headphones },
    { id: 'followers', label: 'Followers', icon: Users },
    { id: 'nfts', label: 'NFT Sales', icon: Gem },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return num.toLocaleString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#229ED9] animate-pulse" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">{title}</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time on-chain music metrics, listener conversion, and secondary marketplace volume
          </p>
        </div>

        {/* Timeframe Pill Selectors (NO border lines) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] self-start sm:self-auto">
          {timeRanges.map((range) => {
            const isActive = timeRange === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#229ED9] text-white shadow-md shadow-[#229ED9]/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Metric Highlight Cards (NO border lines) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Streams Card */}
        <div 
          onClick={() => setActiveTab('streams')}
          className={`p-4 rounded-2xl transition-all cursor-pointer select-none ${
            activeTab === 'streams' 
              ? 'bg-[#229ED9]/15 shadow-xl shadow-[#229ED9]/10' 
              : 'bg-white/[0.04] hover:bg-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Streams</span>
            <div className="w-7 h-7 rounded-full bg-[#229ED9]/15 flex items-center justify-center text-[#229ED9]">
              <Headphones className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight">
            {formatNumber(summary.totalStreams)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#34D399] font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+{summary.streamGrowthPercent}%</span>
            <span className="text-zinc-500 font-normal ml-0.5">vs prev</span>
          </div>
        </div>

        {/* Followers Card */}
        <div 
          onClick={() => setActiveTab('followers')}
          className={`p-4 rounded-2xl transition-all cursor-pointer select-none ${
            activeTab === 'followers' 
              ? 'bg-[#2DD4BF]/15 shadow-xl shadow-[#2DD4BF]/10' 
              : 'bg-white/[0.04] hover:bg-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Followers</span>
            <div className="w-7 h-7 rounded-full bg-[#2DD4BF]/15 flex items-center justify-center text-[#2DD4BF]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight">
            {formatNumber(summary.totalFollowers)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#2DD4BF] font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+{summary.followerGrowthPercent}%</span>
            <span className="text-zinc-500 font-normal ml-0.5">growth</span>
          </div>
        </div>

        {/* NFT Volume Card */}
        <div 
          onClick={() => setActiveTab('nfts')}
          className={`p-4 rounded-2xl transition-all cursor-pointer select-none ${
            activeTab === 'nfts' 
              ? 'bg-[#FFC857]/15 shadow-xl shadow-[#FFC857]/10' 
              : 'bg-white/[0.04] hover:bg-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">NFT Volume</span>
            <div className="w-7 h-7 rounded-full bg-[#FFC857]/15 flex items-center justify-center text-[#FFC857]">
              <Gem className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight">
            {summary.nftVolumeTON.toLocaleString()} <span className="text-xs font-bold text-zinc-400">TON</span>
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#FFC857] font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{summary.nftVolumeGrowthPercent}%</span>
            <span className="text-zinc-500 font-normal ml-0.5">volume</span>
          </div>
        </div>

        {/* Royalties Earned Card */}
        <div 
          onClick={() => setActiveTab('nfts')}
          className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] transition-all cursor-pointer select-none"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Earned Royalties</span>
            <div className="w-7 h-7 rounded-full bg-[#34D399]/15 flex items-center justify-center text-[#34D399]">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#34D399] tabular-nums tracking-tight">
            {summary.totalRoyaltiesTON.toLocaleString()} <span className="text-xs font-bold text-zinc-400">TON</span>
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-400 font-medium">
            <span>8% secondary cut</span>
          </div>
        </div>
      </div>

      {/* 3. Metric Filter Navigation Tabs (NO border lines) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {metricTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 select-none ${
                isActive
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Main Chart Sections (NO border lines) */}
      <div className="space-y-6">
        {/* Streaming Plays & Listeners Chart */}
        {(activeTab === 'overview' || activeTab === 'streams') && (
          <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
                  Streaming Trajectory & Unique Listeners
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Decentralized playback streaming volume across JamSpace and TonJam client apps
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#229ED9]" />
                  <span>Streams</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9B7CFF]" />
                  <span>Unique Listeners</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={streamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#229ED9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#229ED9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="listenersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B7CFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9B7CFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    stroke="none" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  />
                  <YAxis 
                    stroke="none" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    tickFormatter={(val) => formatNumber(val)}
                  />
                  <Tooltip content={<CustomStreamTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="streams"
                    stroke="#229ED9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#streamGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#229ED9", stroke: "#07111F", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="listeners"
                    stroke="#9B7CFF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#listenersGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#9B7CFF", stroke: "#07111F", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Follower Growth Chart */}
        {(activeTab === 'overview' || activeTab === 'followers') && (
          <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                  Audience Growth & Net New Followers
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Follower velocity converted from song plays, playlists, and social engagement
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">Total Reach: </span>
                <span className="text-xs font-mono font-bold text-white">{formatNumber(summary.totalFollowers)} fans</span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={followerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    stroke="none" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  />
                  <YAxis 
                    stroke="none" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomFollowerTooltip />} />
                  <Bar 
                    dataKey="netGain" 
                    fill="url(#followerGradient)" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* NFT Sales Volume Chart */}
        {(activeTab === 'overview' || activeTab === 'nfts') && (
          <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFC857]" />
                  Music NFT Marketplace Sales Volume
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Primary mint sales and secondary collector trading volume verified on TON blockchain
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFC857]" />
                  <span>Volume (TON)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                  <span>Sales Count</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nftSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nftVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFC857" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#FFC857" stopOpacity={0.25} />
                    </linearGradient>
                    <linearGradient id="nftCountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    stroke="none" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  />
                  <YAxis 
                    stroke="none" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomNftTooltip />} />
                  <Bar 
                    dataKey="volumeTON" 
                    fill="url(#nftVolumeGradient)" 
                    radius={[6, 6, 0, 0]} 
                  />
                  <Bar 
                    dataKey="salesCount" 
                    fill="url(#nftCountGradient)" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 5. Top Tracks Streaming Breakdown (NO border lines) */}
        <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <Music2 className="w-4 h-4 text-[#9B7CFF]" />
              Top Streaming Tracks Telemetry
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Ranked by plays</span>
          </div>

          <div className="space-y-2 pt-1">
            {topTracks.map((track, idx) => (
              <div 
                key={track.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all select-none"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <span className="w-4 text-xs font-mono font-bold text-zinc-500 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{track.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span>{formatNumber(track.streams)} streams</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span>{formatNumber(track.uniqueListeners)} listeners</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Completion Rate Bar */}
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-zinc-400 font-mono">{track.completionRate}% completion</span>
                    <div className="w-16 h-1.5 rounded-full bg-white/[0.1] mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#229ED9] to-[#9B7CFF] rounded-full" 
                        style={{ width: `${track.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex items-center gap-0.5 text-xs font-bold text-[#34D399]">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{track.trend}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistAnalyticsDashboard;

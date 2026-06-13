import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Button as MTButton } from "@material-tailwind/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Disc, 
  Sparkles, 
  Crown,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Artist } from '@/types';
import { MOCK_ARTISTS, TON_LOGO } from '@/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// D3 Sparkline trend chart component
interface D3SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  gradientId: string;
}

const D3Sparkline: React.FC<D3SparklineProps> = ({
  data,
  width = 90,
  height = 32,
  gradientId
}) => {
  const { linePath, areaPath, isPositive, lastY } = useMemo(() => {
    if (!data || data.length === 0) {
      return { linePath: '', areaPath: '', isPositive: true, lastY: 0 };
    }

    const padding = 2;
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([padding, width - padding]);
    
    const minVal = d3.min(data) || 0;
    const maxVal = d3.max(data) || 0;
    const yScale = d3.scaleLinear()
      .domain([minVal === maxVal ? minVal - 10 : minVal, maxVal === maxVal ? maxVal + 10 : maxVal])
      .range([height - padding, padding]);

    const lineGen = d3.line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX); // Smoothest line interpolation

    const areaGen = d3.area<number>()
      .x((_, i) => xScale(i))
      .y0(height)
      .y1((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    const first = data[0];
    const last = data[data.length - 1];
    const positive = last >= first;
    const lastYVal = yScale(last);

    return {
      linePath: lineGen(data) || '',
      areaPath: areaGen(data) || '',
      isPositive: positive,
      lastY: lastYVal
    };
  }, [data, width, height]);

  // Emerald vs Rose
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <svg width={width} height={height} className="overflow-visible select-none pointer-events-none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Fill Area with radial/linear fade */}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      {/* Line Stroke */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dynamic pulsating point at the end of the trend line */}
      {data.length > 0 && (
        <circle
          cx={width - 2}
          cy={lastY}
          r={2.5}
          fill={strokeColor}
          className="animate-pulse"
        />
      )}
    </svg>
  );
};

// Main leaderboards component
interface TrendingArtistLeaderboardProps {
  limit?: number;
  className?: string;
  artists?: Artist[];
}

export const TrendingArtistLeaderboard: React.FC<TrendingArtistLeaderboardProps> = ({
  limit = 5,
  className = '',
  artists = MOCK_ARTISTS
}) => {
  const navigate = useNavigate();
  const [metricTab, setMetricTab] = useState<'plays' | 'nft-sales'>('plays');

  // Deterministically generate a 7-day trend array based on artist seed
  const generateTrend = (artistName: string, isPlaysType: boolean) => {
    let hash = 0;
    for (let i = 0; i < artistName.length; i++) {
      hash = artistName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    const baseValue = isPlaysType 
      ? (seed % 150000) + 40000 
      : (seed % 1200) + 150;

    const data: number[] = [];
    let current = baseValue;
    for (let d = 0; d < 7; d++) {
      // Deterministic shift: either up or down
      const fluctuation = ((seed + d * 31) % 20) - 8; // -8% to +12%
      current = Math.max(isPlaysType ? 1000 : 10, current * (1 + fluctuation / 100));
      data.push(Math.round(current));
    }
    return data;
  };

  // Build enhanced data structure for all artists
  const processedArtists = useMemo(() => {
    return artists.map(artist => {
      const playsTrend = generateTrend(artist.name, true);
      const nftTrend = generateTrend(artist.name, false);
      const currentPlays = playsTrend[playsTrend.length - 1];
      const currentSales = nftTrend[nftTrend.length - 1];

      // Trend percentage change
      const playsDiff = ((currentPlays - playsTrend[0]) / playsTrend[0]) * 100;
      const nftDiff = ((currentSales - nftTrend[0]) / nftTrend[0]) * 100;

      return {
        ...artist,
        playsTrend,
        nftTrend,
        currentPlays,
        currentSales,
        playsDiff,
        nftDiff,
      };
    });
  }, [artists]);

  // Sort artists based on active metric tab
  const rankedArtists = useMemo(() => {
    const list = [...processedArtists];
    if (metricTab === 'plays') {
      return list.sort((a, b) => b.currentPlays - a.currentPlays).slice(0, limit);
    } else {
      return list.sort((a, b) => b.currentSales - a.currentSales).slice(0, limit);
    }
  }, [processedArtists, metricTab, limit]);

  // Helpers to structure numbers elegantly
  const formatPlays = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const formatSales = (val: number) => {
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className={`w-full py-2 bg-transparent ${className}`}>
      {/* Title Header with zero custom outer borders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white">
              Vibe Velocity Leaderboard
            </h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Real-time algorithmic stream momentum & trade index
          </p>
        </div>

        {/* Custom Toggle Selection with zero borders */}
        <div className="flex bg-white/[0.03] p-1 rounded-full w-fit gap-2">
          <MTButton
            onClick={() => setMetricTab('plays')}
            variant={metricTab === 'plays' ? "filled" : "outlined"}
            color="blue"
            className="rounded-full px-6 py-2 text-[10px] h-auto lowercase font-medium tracking-widest transition-all whitespace-nowrap"
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            Track Plays
          </MTButton>
          <MTButton
            onClick={() => setMetricTab('nft-sales')}
            variant={metricTab === 'nft-sales' ? "filled" : "outlined"}
            color="blue"
            className="rounded-full px-6 py-2 text-[10px] h-auto lowercase font-medium tracking-widest transition-all whitespace-nowrap"
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            Sales Volume
          </MTButton>
        </div>
      </div>

      {/* Leaderboard List Structure */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {rankedArtists.map((artist, idx) => {
            const rank = idx + 1;
            const currentTrend = metricTab === 'plays' ? artist.playsTrend : artist.nftTrend;
            const trendDiff = metricTab === 'plays' ? artist.playsDiff : artist.nftDiff;
            const isPositive = trendDiff >= 0;

            return (
              <motion.div
                key={`${artist.uid}-${metricTab}`}
                layoutId={`row-${artist.uid}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="group flex items-center justify-between p-4 bg-white/[0.015] hover:bg-white/[0.045] transition-all duration-300 rounded-xl cursor-pointer"
              >
                {/* Left Side: Rank, Avatar, Information */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Rank positioning indicator */}
                  <div className="w-6 flex-shrink-0 flex items-center justify-center font-mono">
                    {rank === 1 ? (
                      <Crown className="h-4.5 w-4.5 text-yellow-500" />
                    ) : (
                      <span className="text-xs font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar with gradient accents */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-none shadow-md">
                      <AvatarImage 
                        src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="bg-zinc-800 text-white font-extrabold text-xs">
                        {artist.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {artist.isVerifiedArtist && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 shadow-md">
                        <UserCheck className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Artist Title & Descriptor */}
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-blue-400 transition-all font-display truncate">
                      {artist.name}
                    </h4>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                      {artist.genre || 'Sound Architect'}
                    </p>
                  </div>
                </div>

                {/* Middle: Sparkline trend visualizer powered by D3 */}
                <div className="hidden md:flex items-center justify-center px-6">
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <D3Sparkline 
                      data={currentTrend} 
                      gradientId={`sparkline-gradient-${artist.uid}-${metricTab}`}
                    />
                  </div>
                </div>

                {/* Right Side: Score Metric & Percentage Growth */}
                <div className="flex items-center gap-4 sm:gap-6 text-right flex-shrink-0">
                  {/* Percentage Shift */}
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-0.5 text-[10px] font-extrabold metric ${
                      isPositive ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {isPositive ? '+' : ''}
                      {trendDiff.toFixed(1)}%
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                    <p className="text-[7.5px] font-bold text-zinc-600 uppercase tracking-widest">
                      7d Delta
                    </p>
                  </div>

                  {/* Absolute Value */}
                  <div className="min-w-[65px] flex flex-col items-end justify-center">
                    <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1 metric">
                      {metricTab === 'plays' ? (
                        <>
                          <Play className="h-3 w-3 text-blue-500 fill-current opacity-70" />
                          {formatPlays(artist.currentPlays)}
                        </>
                      ) : (
                        <>
                          <img src={TON_LOGO} alt="TON" className="h-3 w-3 saturate-100 inline" />
                          {formatSales(artist.currentSales)}
                        </>
                      )}
                    </span>
                    <p className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">
                      {metricTab === 'plays' ? 'Plays' : 'Volume'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Button controls with zero custom borders */}
      <div className="pt-4 flex justify-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/discover')}
          className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-white transition-all gap-2 cursor-pointer h-10 px-6 rounded-full"
        >
          <span>Connect Neural Feeds</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default TrendingArtistLeaderboard;

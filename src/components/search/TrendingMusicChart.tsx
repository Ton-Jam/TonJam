import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Play, Sparkles, TrendingUp, Music } from 'lucide-react';
import * as RechartsPrimitive from 'recharts';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';

const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = RechartsPrimitive as any;

// Fallback tracks in case allTracks is empty
const SEED_TRACKS: Partial<Track>[] = [
  {
    id: 'seed-1',
    title: 'TON Genesis',
    artist: 'DJ Krupy',
    coverUrl: 'https://picsum.photos/seed/ton/150/150',
    genre: 'Synthwave',
    playCount: 15420
  },
  {
    id: 'seed-2',
    title: 'Cyber Vibe',
    artist: 'Aura Sync',
    coverUrl: 'https://picsum.photos/seed/cyber/150/150',
    genre: 'Phonk',
    playCount: 12900
  },
  {
    id: 'seed-3',
    title: 'Sundance',
    artist: 'Alchemist Wave',
    coverUrl: 'https://picsum.photos/seed/sun/150/150',
    genre: 'Afro-TON',
    playCount: 9430
  }
];

interface ChartDataPoint {
  time: string;
  [key: string]: number | string;
}

export const TrendingMusicChart: React.FC = () => {
  const { allTracks = [], playTrack, currentTrack, isPlaying } = useAudio();

  // Pick top 3 tracks to track in our chart
  const tracksToTrack = useMemo(() => {
    if (allTracks && allTracks.length > 0) {
      // Sort or slice top 3
      return allTracks.slice(0, 3);
    }
    return SEED_TRACKS as Track[];
  }, [allTracks]);

  // Track colors for chart lines
  const colors = ['#00B4D8', '#9D4EDD', '#F72585'];

  // Initialize historical real-time data points
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  // Store current live stream rates
  const [currentRates, setCurrentRates] = useState<Record<string, number>>({});
  // Countdown timer for periodic data-fetching (every 30 seconds)
  const [secondsToSync, setSecondsToSync] = useState(30);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // Generate initial 6 data points ending at "Now"
    const now = new Date();
    const initialPoints: ChartDataPoint[] = [];
    
    // Initial starting base stream rates
    const baseRates = tracksToTrack.reduce((acc, track) => {
      acc[track.id] = Math.floor(Math.random() * 40) + 60; // 60-100 stream rate
      return acc;
    }, {} as Record<string, number>);

    setCurrentRates(baseRates);

    for (let i = 5; i >= 0; i--) {
      const timeLabel = new Date(now.getTime() - i * 30000); // 30s intervals historically
      const timeStr = timeLabel.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const point: ChartDataPoint = { time: timeStr };
      tracksToTrack.forEach((track) => {
        // Create a slight historical curve
        const deviation = Math.floor(Math.sin((5 - i) / 2) * 15) + (Math.floor(Math.random() * 10) - 5);
        point[track.id] = Math.max(10, baseRates[track.id] + deviation);
      });
      initialPoints.push(point);
    }

    setChartData(initialPoints);
  }, [tracksToTrack]);

  // Periodic 30-second data-fetching mechanism
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToSync((prev) => {
        if (prev <= 1) {
          // Trigger async data fetch update
          setIsFetching(true);
          
          setTimeout(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            setChartData((prevData) => {
              const nextPoint: ChartDataPoint = { time: timeStr };
              
              setCurrentRates((prevRates) => {
                const updatedRates = { ...prevRates };
                tracksToTrack.forEach((track) => {
                  const currentVal = prevRates[track.id] || 80;
                  // Introduce steady live growth trend (random +1 to +10 streams/min increment)
                  const growth = Math.floor(Math.random() * 10) + 1;
                  const newVal = Math.min(500, currentVal + growth);
                  updatedRates[track.id] = newVal;
                  nextPoint[track.id] = newVal;
                });
                return updatedRates;
              });

              const updatedData = [...prevData, nextPoint];
              if (updatedData.length > 8) {
                updatedData.shift();
              }
              return updatedData;
            });

            setIsFetching(false);
          }, 1200); // realistic latency for fetching live stats from blockchain/ledger

          return 30; // reset to 30 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tracksToTrack]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c133a] p-3 rounded-xl border border-white/10 shadow-2xl space-y-1.5 text-left">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Time: {payload[0].payload.time}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const trackInfo = tracksToTrack.find(t => t.id === entry.name);
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[11px] font-medium text-white max-w-[120px] truncate">
                    {trackInfo?.title || 'Track'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-300 ml-auto">
                    {entry.value} streams/m
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[12px] bg-[#0c133a]/80 p-5 md:p-6 space-y-6 select-none relative overflow-hidden">
      {/* Absolute faint background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8]/5 blur-2xl rounded-full pointer-events-none" />
      
      {/* Header section with Dynamic Status Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#00B4D8] animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-[#00B4D8] uppercase tracking-widest">
              Live Network Pulse
            </span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Trending Music Feed
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.05em]">
            Real-time visual stream-rate tracker of top community tracks
          </p>
        </div>

        {/* Live Indicator Badge */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {isFetching ? (
            <div className="flex items-center gap-1.5 bg-[#00B4D8]/10 text-[#00B4D8] px-3 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-ping" />
              Fetching Live Growth...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/5 text-slate-400 px-3 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-widest">
              <span>Syncing in {secondsToSync}s</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              Stream Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Tracks Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Live Line Chart */}
        <div className="lg:col-span-2 bg-[#050A24]/40 rounded-xl p-3 flex flex-col justify-center min-h-[260px]">
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={8}
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={8}
                  tickLine={false}
                  domain={[0, 'auto']}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip />} />
                {tracksToTrack.map((track, index) => (
                  <Line
                    key={track.id}
                    type="monotone"
                    dataKey={track.id}
                    name={track.id}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    animationDuration={400}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend indicator bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            {tracksToTrack.map((track, index) => (
              <div key={track.id} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-[10px] font-medium text-slate-300 truncate max-w-[120px]">
                  {track.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks List Sidebar */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Currently Auditing
            </span>
            <div className="space-y-2">
              {tracksToTrack.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const activeRate = currentRates[track.id] || 0;
                
                return (
                  <div
                    key={track.id}
                    className="p-2 rounded-lg bg-[#050A24]/30 hover:bg-[#050A24]/60 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0">
                        <img 
                          src={track.coverUrl} 
                          alt={track.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => playTrack(track as Track)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-3.5 h-3.5 text-[#00B4D8] fill-[#00B4D8]" />
                        </button>
                      </div>
                      
                      <div className="min-w-0 text-left">
                        <h4 className="text-[11px] font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3" style={{ color: colors[index % colors.length] }} />
                        <span className="text-[11px] font-mono font-bold text-white">
                          {activeRate}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">
                        streams/m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prompt banner to play the trending tracks */}
          <div className="p-3 rounded-lg bg-[#00B4D8]/5 flex items-center gap-2.5">
            <Music className="w-4 h-4 text-[#00B4D8] shrink-0" />
            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.05em] leading-snug text-left">
              Click cover image to cue up live trending waves directly to player.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

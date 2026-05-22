import React, { useState, useMemo } from 'react';
import * as RechartsPrimitive from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Calendar, Flame, TrendingUp, Music } from 'lucide-react';

const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = RechartsPrimitive as any;

const ResponsiveContainerRC = ResponsiveContainer as any;
const BarChartRC = BarChart as any;
const BarRC = Bar as any;
const XAxisRC = XAxis as any;
const YAxisRC = YAxis as any;
const TooltipRC = Tooltip as any;
const CellRC = Cell as any;

interface Track {
  id: string;
  title: string;
  genre?: string;
  coverUrl?: string;
  plays?: number;
}

interface DailyStreamsChartProps {
  tracks: Track[];
}

export default function DailyStreamsChart({ tracks }: DailyStreamsChartProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('all');

  // Days of the week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Seeded simple random number generator to make track stats consistent per track
  const getDailyDataForTrack = (trackId: string, baseSeed: number) => {
    const data = [];
    const seed = baseSeed || 1;
    for (let i = 0; i < 7; i++) {
      // Deterministic pseudo-random values based on track ID and day index
      const val = Math.abs(Math.sin((seed * 45.67 + i * 23.45))) * 400 + 100;
      data.push({
        day: days[i],
        streams: Math.round(val),
      });
    }
    return data;
  };

  // Memoize stream data based on selected track
  const chartData = useMemo(() => {
    if (tracks.length === 0) {
      // Fallback baseline data if no tracks exist yet
      return [
        { day: 'Mon', streams: 840 },
        { day: 'Tue', streams: 1200 },
        { day: 'Wed', streams: 950 },
        { day: 'Thu', streams: 1450 },
        { day: 'Fri', streams: 1850 },
        { day: 'Sat', streams: 1600 },
        { day: 'Sun', streams: 1300 },
      ];
    }

    if (selectedTrackId === 'all') {
      // Sum the stream counts of all tracks
      const aggregated = days.map((day, index) => {
        let sum = 0;
        tracks.forEach((track, tIdx) => {
          const trackData = getDailyDataForTrack(track.id, tIdx + 1);
          sum += trackData[index].streams;
        });
        return { day, streams: sum };
      });
      return aggregated;
    } else {
      const idx = tracks.findIndex(t => t.id === selectedTrackId);
      return getDailyDataForTrack(selectedTrackId, idx !== -1 ? idx + 1 : 1);
    }
  }, [selectedTrackId, tracks]);

  // Compute overall statistics for the current view
  const stats = useMemo(() => {
    let total = 0;
    let peakVal = 0;
    let peakLabel = 'Mon';

    chartData.forEach(d => {
      total += d.streams;
      if (d.streams > peakVal) {
        peakVal = d.streams;
        peakLabel = d.day;
      }
    });

    const average = Math.round(total / chartData.length);

    return {
      total,
      peakVal,
      peakLabel,
      average
    };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[32px] p-5 space-y-5 relative overflow-hidden"
    >
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 px-1.5 bg-cyan-500/10 rounded-md text-cyan-400">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              Sonic Analytics
            </h2>
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-white">
            Daily Stream Distribution
          </h3>
        </div>

        {/* Calendar context badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-full self-start">
          <Calendar className="w-3 h-3 text-cyan-500" />
          <span className="text-[8px] font-black tracking-wider uppercase text-white/60">
            Last 7 Days (UTC)
          </span>
        </div>
      </div>

      {/* Horizontal Track Selector ScrollRail */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
          <button
            onClick={() => setSelectedTrackId('all')}
            className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer ${
              selectedTrackId === 'all'
                ? 'bg-cyan-500 text-black font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Tracks
          </button>
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-1.5 cursor-pointer max-w-[150px] ${
                selectedTrackId === track.id
                  ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Music className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{track.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Key Metric Snapshot Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/20 rounded-2xl p-3 border border-white/5 decoration-none">
          <span className="text-[7px] text-white/30 uppercase tracking-widest block font-bold mb-0.5">Total Plays</span>
          <p className="text-sm font-black text-cyan-400 font-mono tracking-tight">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
          <span className="text-[7px] text-white/30 uppercase tracking-widest block font-bold mb-0.5">Avg / Day</span>
          <p className="text-sm font-black text-white font-mono tracking-tight">{stats.average.toLocaleString()}</p>
        </div>
        <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
          <span className="text-[7px] text-white/30 uppercase tracking-widest block font-bold mb-0.5">Peak Day</span>
          <p className="text-sm font-black text-purple-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 inline shrink-0" />
            <span className="text-xs uppercase font-extrabold">{stats.peakLabel}</span>
          </p>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="bg-black/30 rounded-2xl p-3">
        <div className="h-[140px] w-full">
          <ResponsiveContainerRC width="100%" height="100%">
            <BarChartRC data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#db2777" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxisRC
                dataKey="day"
                stroke="rgba(255,255,255,0.15)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxisRC
                stroke="rgba(255,255,255,0.15)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
              />
              <TooltipRC
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  fontSize: '9px',
                  color: '#fff',
                  fontWeight: '900',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                }}
                itemStyle={{ color: '#22d3ee' }}
                labelStyle={{ color: '#94a3b8', textTransform: 'uppercase' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 8 }}
              />
              <BarRC
                dataKey="streams"
                fill="url(#cyanPurpleGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              >
                {chartData.map((entry: any, index: number) => (
                  <CellRC 
                    key={`cell-${index}`} 
                    fill={entry.day === stats.peakLabel ? "url(#activeGradient)" : "url(#cyanPurpleGrad)"} 
                  />
                ))}
              </BarRC>
            </BarChartRC>
          </ResponsiveContainerRC>
        </div>
      </div>
    </motion.div>
  );
}

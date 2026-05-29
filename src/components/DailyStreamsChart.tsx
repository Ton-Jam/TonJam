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
      className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-2xl p-3 space-y-3 relative overflow-hidden"
    >
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-black uppercase tracking-tight text-white">
            Streams
          </h3>
          <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">
            Daily Distribution
          </p>
        </div>

        {/* Calendar context badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/5 rounded-full shrink-0">
          <Calendar className="w-2.5 h-2.5 text-cyan-500" />
          <span className="text-[7px] font-black tracking-wider uppercase text-white/60">
            7 Days
          </span>
        </div>
      </div>

      {/* Key Metric Snapshot Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <span className="text-[6px] text-white/30 uppercase tracking-widest block font-bold mb-0.5">Total</span>
          <p className="text-xs font-black text-cyan-400 font-mono tracking-tight">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <span className="text-[6px] text-white/30 uppercase tracking-widest block font-bold mb-0.5">Avg</span>
          <p className="text-xs font-black text-white font-mono tracking-tight">{stats.average.toLocaleString()}</p>
        </div>
        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <span className="text-[6px] text-white/30 uppercase tracking-widest block font-bold mb-0.5">Peak</span>
          <p className="text-xs font-black text-purple-400 font-mono tracking-tight">
             {stats.peakLabel}
          </p>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="bg-black/30 rounded-lg p-2">
        <div className="h-[120px] w-full">
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
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxisRC
                stroke="rgba(255,255,255,0.15)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
              />
              <TooltipRC
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  fontSize: '8px',
                  color: '#fff',
                  fontWeight: '900',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                }}
                itemStyle={{ color: '#22d3ee' }}
                labelStyle={{ color: '#94a3b8', textTransform: 'uppercase' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 4 }}
              />
              <BarRC
                dataKey="streams"
                fill="url(#cyanPurpleGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
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
      
      {/* Horizontal Track Selector ScrollRail */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
          <button
            onClick={() => setSelectedTrackId('all')}
            className={`px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer ${
              selectedTrackId === 'all'
                ? 'bg-cyan-500 text-black font-extrabold'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            All
          </button>
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-1 cursor-pointer max-w-[100px] ${
                selectedTrackId === track.id
                  ? 'bg-purple-600 text-white font-extrabold'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Music className="w-2 h-2 shrink-0" />
              <span className="truncate">{track.title}</span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

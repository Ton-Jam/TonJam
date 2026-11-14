import React, { useMemo } from 'react';
import { Activity, Play, TrendingUp, Music } from 'lucide-react';
import * as RechartsPrimitive from 'recharts';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';

const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } = RechartsPrimitive as any;

export const TrendingMusicChart: React.FC = () => {
  const { allTracks = [], playTrack } = useAudio();

  const tracksToTrack = useMemo(() => {
    if (!allTracks || allTracks.length === 0) return [];
    return [...allTracks]
      .sort((a, b) => Number(b.playCount || b.streams || 0) - Number(a.playCount || a.streams || 0))
      .slice(0, 3);
  }, [allTracks]);

  const colors = ['#00B4D8', '#9D4EDD', '#F72585'];

  const chartData = useMemo(() => {
    return tracksToTrack.map((track, index) => ({
      id: track.id,
      name: track.title.length > 14 ? `${track.title.slice(0, 12)}...` : track.title,
      title: track.title,
      plays: Number(track.playCount || track.streams || 0),
      likes: Number(track.likes || 0),
      color: colors[index % colors.length],
    }));
  }, [tracksToTrack]);

  if (tracksToTrack.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#0c133a] p-3 rounded-xl shadow-2xl space-y-1 text-left">
          <p className="text-[11px] font-bold text-white truncate max-w-[180px]">{item.title}</p>
          <p className="text-[11px] font-mono font-bold text-[#00B4D8]">
            {Number(item.plays).toLocaleString()} plays
          </p>
          <p className="text-[10px] font-mono text-slate-400">
            {Number(item.likes).toLocaleString()} likes
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[12px] bg-[#0c133a]/80 p-5 md:p-6 space-y-6 select-none relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8]/5 blur-2xl rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#00B4D8]" />
            <span className="text-[9px] font-mono font-bold text-[#00B4D8] uppercase tracking-widest">
              Live Track Metrics
            </span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Trending Music Feed
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.05em]">
            Top tracks ranked by real Firestore play counts
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full self-start sm:self-center">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
            Live Firestore Sync
          </span>
        </div>
      </div>

      {/* Main Grid: Chart + Tracks Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Live Bar Chart */}
        <div className="lg:col-span-2 bg-[#050A24]/40 rounded-xl p-3 flex flex-col justify-center min-h-[260px]">
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={9}
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={9}
                  tickLine={false}
                  domain={[0, 'auto']}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="plays" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
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
              Top Tracks
            </span>
            <div className="space-y-2">
              {tracksToTrack.map((track, index) => {
                const playsCount = Number(track.playCount || track.streams || 0);
                
                return (
                  <div
                    key={track.id}
                    className="p-2 rounded-lg bg-[#050A24]/30 hover:bg-[#050A24]/60 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0 bg-slate-900">
                        {track.coverUrl && (
                          <img 
                            src={track.coverUrl} 
                            alt={track.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
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
                          {playsCount.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">
                        plays
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

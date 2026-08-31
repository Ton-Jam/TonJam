import React from 'react';
import { BarChart3, Star, Disc, Flame, Clock, Radio, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryAnalytics } from '../types';

interface AnalyticsSectionProps {
  analytics: LibraryAnalytics;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ analytics }) => {
  // SVG Chart calculation variables
  const maxHours = Math.max(...analytics.weeklyHours.map(d => d.hours));
  const chartHeight = 120;
  const chartWidth = 360;

  return (
    <div className="space-y-4">
      {/* Upper streak bento banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Streak card */}
        <div className="bg-gradient-to-br from-orange-950/20 to-amber-950/10 border border-orange-500/10 p-4 rounded-[10px] flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-wider">Listening Streak</span>
            <p className="text-xl font-black text-orange-400 font-mono leading-tight">{analytics.listeningStreakDays} Days</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-tight">Streak active since last month</p>
          </div>
        </div>

        {/* Listening Hours card */}
        <div className="bg-gradient-to-br from-blue-950/20 to-sky-950/10 border border-blue-500/10 p-4 rounded-[10px] flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-wider">Total Active Hours</span>
            <p className="text-xl font-black text-blue-400 font-mono leading-tight">{analytics.totalListeningHours} hrs</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-tight">Total on-chain streaming time</p>
          </div>
        </div>

        {/* Dynamic Badge card */}
        <div className="bg-gradient-to-br from-purple-950/20 to-indigo-950/10 border border-purple-500/10 p-4 rounded-[10px] flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-wider">Listener Tier</span>
            <p className="text-xl font-black text-purple-400 font-mono leading-tight">Superfan Core</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-tight">Top 2% Satoshi Sync listeners</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Streaming Activity Chart (Custom SVG bar chart for robust compilation) */}
        <div className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-foreground">
              <BarChart3 className="w-4 h-4 text-[#0052FF]" />
              <h2 className="section-title">Weekly Stream Timeline</h2>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Hours / Day</span>
          </div>

          <div className="pt-2">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = chartHeight - chartHeight * ratio;
                return (
                  <g key={index}>
                    <line 
                      x1="0" 
                      y1={y} 
                      x2={chartWidth} 
                      y2={y} 
                      stroke="currentColor" 
                      className="text-black/5 dark:text-white/5" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x="0" 
                      y={y - 4} 
                      fill="currentColor" 
                      className="text-[8px] font-mono fill-muted-foreground font-bold"
                    >
                      {(maxHours * ratio).toFixed(1)}h
                    </text>
                  </g>
                );
              })}

              {/* Bars rendering */}
              {analytics.weeklyHours.map((data, index) => {
                const barWidth = 32;
                const barGap = (chartWidth - barWidth * analytics.weeklyHours.length) / (analytics.weeklyHours.length - 1);
                const x = index * (barWidth + barGap);
                const barHeight = (data.hours / maxHours) * (chartHeight - 20);
                const y = chartHeight - 20 - barHeight;

                return (
                  <g key={index} className="group cursor-pointer">
                    {/* Hover indicator tooltip */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill="url(#barGradient)"
                      className="transition-all hover:opacity-80"
                    />
                    {/* Day label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[9px] font-bold font-mono fill-muted-foreground uppercase"
                    >
                      {data.day}
                    </text>
                  </g>
                );
              })}

              {/* Gradient def */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0052FF" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Favorite Genre distributions */}
        <div className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] p-4 space-y-4">
          <div className="flex items-center justify-between px-1 text-foreground">
            <h2 className="section-title">Favorite Genre Nodes</h2>
            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Share %</span>
          </div>

          <div className="space-y-3 pt-1">
            {analytics.favoriteGenres.map((genre) => (
              <div key={genre.genre} className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-foreground">{genre.genre}</span>
                  <span className="font-mono text-muted-foreground font-bold">{genre.percentage}%</span>
                </div>
                {/* Visual meter bar */}
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0052FF] h-full rounded-full" 
                    style={{ width: `${genre.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Songs */}
        <div className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-foreground px-1 mb-1">
            <Disc className="w-4 h-4 text-pink-500" />
            <h2 className="section-title">Top Tracks This Month</h2>
          </div>

          <div className="space-y-2">
            {analytics.topSongs.map((song, i) => (
              <div key={i} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-mono font-black text-muted-foreground w-4 text-center">
                  {i + 1}
                </span>
                <img src={song.coverUrl} alt={song.title} className="w-8 h-8 rounded-md object-cover bg-slate-800 shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] font-bold text-foreground truncate">{song.title}</h5>
                  <p className="text-[9px] text-muted-foreground truncate">{song.artist}</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-muted-foreground shrink-0 bg-white/5 px-2 py-0.5 rounded-md">
                  {song.plays} plays
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-foreground px-1 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="section-title">Top Artists Played</h2>
          </div>

          <div className="space-y-2">
            {analytics.favoriteArtists.map((artist, i) => (
              <div key={i} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-mono font-black text-muted-foreground w-4 text-center">
                  {i + 1}
                </span>
                <img src={artist.avatarUrl} alt={artist.name} className="w-8 h-8 rounded-full object-cover bg-slate-800 shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] font-bold text-foreground truncate">{artist.name}</h5>
                  <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Verified artist node</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-muted-foreground shrink-0 bg-white/5 px-2 py-0.5 rounded-md">
                  {artist.playCount} streams
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

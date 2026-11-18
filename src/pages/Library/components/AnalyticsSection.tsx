import React from 'react';
import { BarChart3, Star, Disc, Flame, Clock, Radio, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryAnalytics } from '../types';

interface AnalyticsSectionProps {
  analytics: LibraryAnalytics;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ analytics }) => {
  // SVG Chart calculation variables
  const maxHours = Math.max(1, ...analytics.weeklyHours.map(d => d.hours));
  const chartHeight = 120;
  const chartWidth = 360;

  return (
    <div className="space-y-4">
      {/* Upper streak bento banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Streak card */}
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] border-0 p-4 rounded-[var(--tj-radius-lg,10px)] flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-500/12 text-orange-400">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--tj-color-text-muted,#7F91AA)] uppercase font-mono font-bold tracking-wider">Listening Streak</span>
            <p className="text-xl font-black text-orange-400 font-mono leading-tight">
              {analytics.listeningStreakDays} {analytics.listeningStreakDays === 1 ? 'Day' : 'Days'}
            </p>
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] mt-0.5 font-medium leading-tight">
              {analytics.listeningStreakDays > 0 ? 'Active listening streak' : 'Play a track to start a streak'}
            </p>
          </div>
        </div>

        {/* Listening Hours card */}
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] border-0 p-4 rounded-[var(--tj-radius-lg,10px)] flex items-center gap-4">
          <div className="p-3 rounded-full bg-[var(--tj-color-brand-primary,#00B4D8)]/12 text-[var(--tj-color-brand-primary,#00B4D8)]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--tj-color-text-muted,#7F91AA)] uppercase font-mono font-bold tracking-wider">Total Active Hours</span>
            <p className="text-xl font-black text-[var(--tj-color-brand-primary,#00B4D8)] font-mono leading-tight">{analytics.totalListeningHours} hrs</p>
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] mt-0.5 font-medium leading-tight">Session streaming time</p>
          </div>
        </div>

        {/* Dynamic Badge card */}
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] border-0 p-4 rounded-[var(--tj-radius-lg,10px)] flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-500/12 text-purple-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--tj-color-text-muted,#7F91AA)] uppercase font-mono font-bold tracking-wider">Listener Activity</span>
            <p className="text-xl font-black text-purple-400 font-mono leading-tight">
              {analytics.topSongs.length > 0 ? 'Active Listener' : 'New Listener'}
            </p>
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] mt-0.5 font-medium leading-tight">
              {analytics.topSongs.length > 0
                ? `${analytics.topSongs.length} recent ${analytics.topSongs.length === 1 ? 'track' : 'tracks'} tracked`
                : 'Stream music to unlock stats'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Streaming Activity Chart */}
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] border-0 rounded-[var(--tj-radius-lg,10px)] p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[var(--tj-color-text-primary,#F8FAFC)]">
              <BarChart3 className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
              <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Weekly Stream Timeline</h2>
            </div>
            <span className="text-[10px] font-mono text-[var(--tj-color-text-muted,#7F91AA)] uppercase font-bold tracking-widest">Hours / Day</span>
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
                      className="text-white/5"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="0"
                      y={y - 4}
                      fill="currentColor"
                      className="text-[8px] font-mono fill-[var(--tj-color-text-muted,#7F91AA)] font-bold"
                    >
                      {(maxHours * ratio).toFixed(1)}h
                    </text>
                  </g>
                );
              })}

              {/* Bars rendering */}
              {analytics.weeklyHours.map((data, index) => {
                const barWidth = 32;
                const barGap = analytics.weeklyHours.length > 1
                  ? (chartWidth - barWidth * analytics.weeklyHours.length) / (analytics.weeklyHours.length - 1)
                  : 0;
                const x = index * (barWidth + barGap);
                const barHeight = Math.max(0, (data.hours / maxHours) * (chartHeight - 20));
                const y = chartHeight - 20 - barHeight;

                return (
                  <g key={index} className="group cursor-pointer">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill="url(#barGradient)"
                      className="transition-all hover:opacity-80"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[9px] font-bold font-mono fill-[var(--tj-color-text-muted,#7F91AA)] uppercase"
                    >
                      {data.day}
                    </text>
                  </g>
                );
              })}

              {/* Gradient def */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00B4D8" />
                  <stop offset="100%" stopColor="#0088CC" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Favorite Genre distributions */}
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] border-0 rounded-[var(--tj-radius-lg,10px)] p-4 space-y-4">
          <div className="flex items-center justify-between px-1 text-[var(--tj-color-text-primary,#F8FAFC)]">
            <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Favorite Genres</h2>
            <span className="text-[10px] font-mono font-bold text-[var(--tj-color-text-muted,#7F91AA)] uppercase tracking-widest">Share %</span>
          </div>

          {analytics.favoriteGenres.length === 0 ? (
            <div className="py-8 text-center">
              <Music className="w-6 h-6 text-[var(--tj-color-text-muted,#7F91AA)] mx-auto mb-2 opacity-60" />
              <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
                Play tracks to see your top genres here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {analytics.favoriteGenres.map((genre) => (
                <div key={genre.genre} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--tj-color-text-primary,#F8FAFC)]">{genre.genre}</span>
                    <span className="font-mono text-[var(--tj-color-text-secondary,#A8B7CC)] font-bold">{genre.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--tj-color-bg-secondary,#0B1424)] rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--tj-color-brand-primary,#00B4D8)] h-full rounded-full"
                      style={{ width: `${genre.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Songs */}
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] border-0 rounded-[var(--tj-radius-lg,10px)] p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[var(--tj-color-text-primary,#F8FAFC)] px-1 mb-1">
            <Disc className="w-4 h-4 text-pink-400" />
            <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Top Tracks This Month</h2>
          </div>

          {analytics.topSongs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
                No tracks played yet. Your top played songs will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.topSongs.map((song, i) => (
                <div key={i} className="flex items-center gap-3 p-1.5 rounded-[var(--tj-radius-sm,6px)] hover:bg-[var(--tj-color-surface-hover,#132B49)] transition-colors">
                  <span className="text-xs font-mono font-black text-[var(--tj-color-text-muted,#7F91AA)] w-4 text-center">
                    {i + 1}
                  </span>
                  <img src={song.coverUrl} alt={song.title} className="w-8 h-8 rounded-[var(--tj-radius-sm,6px)] object-cover bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">{song.title}</h5>
                    <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">{song.artist}</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[var(--tj-color-text-secondary,#A8B7CC)] shrink-0 bg-[var(--tj-color-chip-background,#102943)] px-2 py-0.5 rounded-[var(--tj-radius-xs,4px)]">
                    {song.plays} plays
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Artists */}
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] border-0 rounded-[var(--tj-radius-lg,10px)] p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[var(--tj-color-text-primary,#F8FAFC)] px-1 mb-1">
            <Star className="w-4 h-4 text-amber-400" />
            <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Top Artists Played</h2>
          </div>

          {analytics.favoriteArtists.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
                No artists played yet. Explore tracks to build your artist stats.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.favoriteArtists.map((artist, i) => (
                <div key={i} className="flex items-center gap-3 p-1.5 rounded-[var(--tj-radius-sm,6px)] hover:bg-[var(--tj-color-surface-hover,#132B49)] transition-colors">
                  <span className="text-xs font-mono font-black text-[var(--tj-color-text-muted,#7F91AA)] w-4 text-center">
                    {i + 1}
                  </span>
                  <img src={artist.avatarUrl} alt={artist.name} className="w-8 h-8 rounded-full object-cover bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">{artist.name}</h5>
                    <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] font-medium">Recently streamed</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[var(--tj-color-text-secondary,#A8B7CC)] shrink-0 bg-[var(--tj-color-chip-background,#102943)] px-2 py-0.5 rounded-[var(--tj-radius-xs,4px)]">
                    {artist.playCount} {artist.playCount === 1 ? 'stream' : 'streams'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

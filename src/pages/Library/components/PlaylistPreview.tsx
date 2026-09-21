import React from 'react';
import type { SpotifyPlaylistPreview } from './ImportSpotifyPlaylistModal';

export interface PlaylistPreviewProps {
  playlist: SpotifyPlaylistPreview;
}

function formatDuration(secondsOrMs?: number): string | null {
  if (secondsOrMs === undefined || secondsOrMs === null || isNaN(secondsOrMs) || secondsOrMs <= 0) {
    return null;
  }
  const totalSeconds = secondsOrMs > 1000 ? Math.floor(secondsOrMs / 1000) : Math.floor(secondsOrMs);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const PlaylistPreview: React.FC<PlaylistPreviewProps> = ({ playlist }) => {
  const fallbackCover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&h=400&q=80';
  const remainingCount = Math.max((playlist.trackCount || 0) - 5, 0);

  return (
    <div className="space-y-4">
      {/* Playlist Header */}
      <div className="p-3 rounded-[6px] bg-[#141414] flex gap-3.5 items-center">
        <img
          src={playlist.imageUrl || fallbackCover}
          alt={`${playlist.name} playlist artwork`}
          className="w-16 h-16 rounded-[6px] object-cover bg-black/40 aspect-square shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-[16px] leading-[24px] font-medium text-[#F5F7FA] truncate">
            {playlist.name}
          </h3>
          
          <p className="text-[12px] sm:text-[13px] leading-[18px] sm:leading-[20px] font-normal text-[rgba(245,247,250,0.72)] truncate">
            {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}
            {playlist.ownerName ? ` • ${playlist.ownerName}` : ''}
          </p>

          {playlist.description && (
            <p className="text-[11px] text-[rgba(245,247,250,0.55)] line-clamp-1 leading-relaxed pt-0.5">
              {playlist.description}
            </p>
          )}
        </div>
      </div>

      {/* Track Preview List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[12px] text-[rgba(245,247,250,0.6)] font-medium px-1">
          <span>Track Preview</span>
          <span>Duration</span>
        </div>

        <div 
          role="region"
          tabIndex={0}
          aria-label="Playlist track preview"
          className="max-h-[240px] sm:max-h-[280px] overflow-y-auto overflow-x-hidden scrollbar-hide focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0088CC]/50 bg-[#0D0D0D] rounded-[6px] p-1.5 space-y-1"
        >
          {playlist.tracks && playlist.tracks.length > 0 ? (
            playlist.tracks.slice(0, 5).map((track, idx) => {
              const durationStr = formatDuration(track.durationMs);
              return (
                <div
                  key={track.id || idx}
                  className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-[4px] hover:bg-white/5 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-[12px] font-mono text-[rgba(245,247,250,0.55)] w-5 shrink-0 text-left">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#F5F7FA] truncate">
                        {track.name}
                      </p>
                      <p className="text-[12px] font-normal text-[rgba(245,247,250,0.55)] truncate">
                        {Array.isArray(track.artists) ? track.artists.join(', ') : track.artists}
                      </p>
                    </div>
                  </div>

                  {durationStr && (
                    <span className="text-[12px] font-normal text-[rgba(245,247,250,0.55)] shrink-0 ml-3 text-right font-mono tabular-nums">
                      {durationStr}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-[13px] text-[rgba(245,247,250,0.55)]">
              No tracks found
            </div>
          )}

          {remainingCount > 0 && (
            <div className="py-1.5 text-center text-[12px] font-normal text-[rgba(245,247,250,0.55)] font-mono mt-0.5">
              + {remainingCount} more tracks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

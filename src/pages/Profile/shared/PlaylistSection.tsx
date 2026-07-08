import React from 'react';
import { Play, Disc, Eye, FolderHeart } from 'lucide-react';
import { motion } from 'motion/react';
import { PlaylistData } from '@/pages/ArtistProfile/types';
import { useToast } from '@/components/layout/ToastProvider';

interface PlaylistSectionProps {
  playlists: PlaylistData[];
  onSelectPlaylist?: (playlistId: string) => void;
  onPlayPlaylist?: (playlistId: string) => void;
}

export const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  playlists,
  onSelectPlaylist,
  onPlayPlaylist
}) => {
  const toast = useToast();

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12 bg-[#101A3B]/40 border border-white/5 rounded-2xl p-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
        No playlists curated
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Curated Playlists ({playlists.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <motion.div
            key={playlist.id}
            onClick={() => onSelectPlaylist?.(playlist.id)}
            className="bg-[#101A3B] border border-white/5 rounded-2xl p-3 flex flex-col group hover:bg-[#15234f] transition-all cursor-pointer relative"
          >
            {/* Cover art block */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3">
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayPlaylist?.(playlist.id);
                  }}
                  className="p-3 bg-white text-[#050A24] rounded-full hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current text-[#050A24]" />
                </button>
              </div>

              {/* Type Badge */}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded-md text-[8px] font-bold text-[#0052FF] uppercase tracking-wider">
                {playlist.type}
              </div>
            </div>

            {/* Meta */}
            <div className="min-w-0 space-y-1">
              <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-white transition-colors">
                {playlist.name}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{playlist.trackCount} Tracks</span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3 text-slate-500" />
                  {playlist.plays.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistSection;

import React from 'react';
import { Play, ListMusic, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Playlist } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface FeaturedPlaylistSectionProps {
  playlists: Playlist[];
  onPlayPlaylist: (playlist: Playlist) => void;
}

export const FeaturedPlaylistSection: React.FC<FeaturedPlaylistSectionProps> = ({
  playlists,
  onPlayPlaylist
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest">Selected Mixes</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Featured Playlists</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {playlists.map((playlist) => {
          const imageSrc = playlist.coverUrl || getPlaceholderImage(playlist.title);

          return (
            <motion.div
              key={`featured-playlist-${playlist.id}`}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 p-4 flex flex-col justify-between aspect-[4/5] cursor-pointer group transition-all"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-950 border border-white/5">
                <img
                  src={imageSrc}
                  alt={playlist.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = getPlaceholderImage(playlist.title); }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayPlaylist(playlist);
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#0052FF] text-white flex items-center justify-center scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 hover:scale-110 active:scale-95 transition-all shadow-lg border border-white/20"
                >
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </button>
              </div>

              <div className="mt-3 space-y-1 truncate">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors">
                  {playlist.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>by {playlist.creator}</span>
                </p>
                <p className="text-[9px] font-mono text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>{playlist.trackCount || playlist.trackIds?.length || 0} tracks</span>
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

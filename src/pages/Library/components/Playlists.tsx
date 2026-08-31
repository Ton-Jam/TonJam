import React, { useState } from 'react';
import { Plus, Disc, Pin, Trash2, Library, FolderHeart } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryPlaylist } from '../types';

interface PlaylistsProps {
  playlists: LibraryPlaylist[];
  onCreatePlaylist: (title: string) => void;
  onDeletePlaylist: (id: string) => void;
  onTogglePin: (id: string) => void;
  layout?: 'grid' | 'list';
}

export const Playlists: React.FC<PlaylistsProps> = ({
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onTogglePin,
  layout = 'list'
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistTitle.trim()) {
      onCreatePlaylist(playlistTitle);
      setPlaylistTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-pink-500" />
          <h2 className="section-title">Playlists</h2>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="text-xs font-bold text-[#0052FF] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {isCreating && (
        <motion.form 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="p-4 bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] flex flex-col md:flex-row gap-3 items-stretch md:items-center"
        >
          <input
            type="text"
            required
            placeholder="Name your playlist..."
            value={playlistTitle}
            onChange={(e) => setPlaylistTitle(e.target.value)}
            className="flex-1 bg-black/10 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-[10px] px-3.5 py-2 text-xs font-semibold outline-none focus:border-[#0052FF] text-foreground"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-foreground text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer"
            >
              Create Node
            </button>
          </div>
        </motion.form>
      )}

      {layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Create Playlist Shortcut Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreating(true)}
            className="border border-dashed border-black/15 dark:border-white/15 hover:border-[#0052FF] bg-transparent hover:bg-[#0052FF]/5 rounded-[10px] aspect-square flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors group"
          >
            <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#0052FF]/20 text-muted-foreground group-hover:text-[#0052FF] transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground mt-3 transition-colors uppercase tracking-wider">New Playlist</span>
          </motion.div>

          {/* Playlists items */}
          {playlists.map((playlist) => (
            <motion.div
              key={playlist.id}
              whileHover={{ scale: 1.02 }}
              className="relative bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-[10px] flex flex-col justify-between group h-full"
            >
              {/* Cover art block */}
              <div className="relative aspect-square w-full rounded-[10px] overflow-hidden mb-3 bg-slate-800">
                <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                
                {/* Overlay elements */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {playlist.isPinned && (
                    <div className="p-1.5 bg-black/60 text-amber-400 rounded-full" title="Pinned to Top">
                      <Pin className="w-3 h-3 fill-current" />
                    </div>
                  )}
                  {playlist.isDownloaded && (
                    <div className="p-1.5 bg-black/60 text-emerald-400 rounded-full" title="Downloaded offline">
                      <Disc className="w-3 h-3 animate-spin-slow" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-foreground leading-snug line-clamp-1">{playlist.title}</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">
                  {playlist.tracksCount} tracks • {playlist.creator}
                </p>
              </div>

              {/* Quick Actions overlay on hover */}
              <div className="flex gap-1.5 mt-3 pt-2 border-t border-black/5 dark:border-white/5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onTogglePin(playlist.id)}
                  className={`p-1.5 rounded-md hover:bg-white/10 ${playlist.isPinned ? 'text-amber-400' : 'text-muted-foreground'}`}
                  title={playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                {playlist.isCustom && (
                  <button
                    onClick={() => onDeletePlaylist(playlist.id)}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-500"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Create Playlist Shortcut Row */}
          <motion.div
            whileHover={{ x: 4 }}
            onClick={() => setIsCreating(true)}
            className="border border-dashed border-black/15 dark:border-white/15 hover:border-[#0052FF] bg-transparent hover:bg-[#0052FF]/5 rounded-[10px] p-3 flex items-center gap-3 cursor-pointer transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-[#0052FF] transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider text-left">
              Create New Playlist
            </span>
          </motion.div>

          {/* Playlists items in List view */}
          {playlists.map((playlist) => (
            <motion.div
              key={playlist.id}
              whileHover={{ x: 4 }}
              className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-[10px] flex items-center justify-between group gap-4 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-1 left-1 flex gap-0.5">
                    {playlist.isPinned && (
                      <div className="p-0.5 bg-black/60 text-amber-400 rounded-full">
                        <Pin className="w-2 h-2 fill-current" />
                      </div>
                    )}
                    {playlist.isDownloaded && (
                      <div className="p-0.5 bg-black/60 text-emerald-400 rounded-full">
                        <Disc className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-extrabold text-foreground truncate">{playlist.title}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">
                    {playlist.tracksCount} tracks • {playlist.creator}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onTogglePin(playlist.id)}
                  className={`p-1.5 rounded-md hover:bg-white/10 ${playlist.isPinned ? 'text-amber-400' : 'text-muted-foreground'}`}
                  title={playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                {playlist.isCustom && (
                  <button
                    onClick={() => onDeletePlaylist(playlist.id)}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Disc, Pin, Trash2, Sliders, Music2, Sparkles, ArrowDownToLine } from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';
import { LibraryPlaylist } from '../types';

interface PlaylistsProps {
  playlists: LibraryPlaylist[];
  onCreatePlaylist: (title: string) => void;
  onDeletePlaylist: (id: string) => void;
  onTogglePin: (id: string) => void;
  onImportSpotify?: () => void;
  onOpenCreateModal?: () => void;
  layout?: 'grid' | 'list';
}

export const Playlists: React.FC<PlaylistsProps> = ({
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onTogglePin,
  onImportSpotify,
  onOpenCreateModal,
  layout = 'list'
}) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistTitle.trim()) {
      onCreatePlaylist(playlistTitle.trim());
      setPlaylistTitle('');
      setIsCreating(false);
    }
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  return (
    <div className="space-y-4">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-pink-500" />
          <h2 className="section-title">Playlists</h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#94A3B8]">
            {playlists.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onImportSpotify && (
            <button
              type="button"
              onClick={onImportSpotify}
              className="text-xs font-semibold text-[#0088CC] flex items-center gap-1.5 hover:text-[#38bdf8] transition-colors cursor-pointer border-none bg-transparent"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import Spotify</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onOpenCreateModal) {
                onOpenCreateModal();
              } else {
                setIsCreating(true);
              }
            }}
            className="text-xs font-bold text-white bg-[#00B4D8] hover:bg-[#0098EA] px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-[#00B4D8]/20 border-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* QUICK INLINE CREATION PANEL */}
      {isCreating && (
        <motion.form 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          onSubmit={handleSubmit}
          className="p-4 bg-[#111C30] rounded-2xl shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center animate-in fade-in duration-200"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              required
              autoFocus
              placeholder="Name your playlist..."
              value={playlistTitle}
              onChange={(e) => setPlaylistTitle(e.target.value)}
              className="w-full bg-[#0B1424] rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#00B4D8] text-white placeholder:text-[#64748B] transition-all border-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  onOpenCreateModal();
                }}
                className="px-3.5 py-2.5 bg-[#172338] hover:bg-[#1E2E4A] text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5"
                title="Open full creator with cover upload, privacy, and tags"
              >
                <Sliders className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setPlaylistTitle('');
                setIsCreating(false);
              }}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0098EA] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#00B4D8]/25 border-none"
            >
              Create Playlist
            </button>
          </div>
        </motion.form>
      )}

      {/* PLAYLISTS COLLECTION */}
      <LayoutGroup id="playlists-layout-group">
        <motion.div 
          layout
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className={layout === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-2"}
        >
          {/* Create Playlist Shortcut Card in Grid View */}
          {layout === 'grid' && (
            <motion.div
              layout
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onOpenCreateModal) {
                  onOpenCreateModal();
                } else {
                  setIsCreating(true);
                }
              }}
              className="bg-[#111C30]/60 hover:bg-[#111C30] rounded-2xl aspect-square flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-all group shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-[#00B4D8]/20 text-[#94A3B8] group-hover:text-[#00B4D8] flex items-center justify-center transition-all group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#94A3B8] group-hover:text-white mt-3 transition-colors uppercase tracking-wider">
                New Playlist
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5">
                Custom Collection
              </span>
            </motion.div>
          )}

          {/* Empty State */}
          {playlists.length === 0 && layout !== 'grid' && (
            <div className="bg-[#111C30] rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center mx-auto">
                <Music2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No Playlists Created Yet</h4>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  Create and name your own playlists to organize your favorite TonJam tracks and music NFTs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCreateModal) onOpenCreateModal();
                  else setIsCreating(true);
                }}
                className="px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0098EA] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#00B4D8]/25 border-none"
              >
                Create Your First Playlist
              </button>
            </div>
          )}

          {/* Playlist Items */}
          {playlists.map((playlist) => (
            <motion.div
              layout
              key={playlist.id}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              whileHover={layout === 'grid' ? { scale: 1.02 } : { x: 3 }}
              onClick={() => handlePlaylistClick(playlist.id)}
              className={
                layout === 'grid'
                  ? "relative bg-[#111C30] hover:bg-[#15233D] p-3.5 rounded-2xl flex flex-col justify-between group h-full cursor-pointer transition-all shadow-md select-none"
                  : "bg-[#111C30] hover:bg-[#15233D] p-3 sm:p-3.5 rounded-2xl flex items-center justify-between group gap-4 text-left cursor-pointer transition-all shadow-md select-none"
              }
            >
              {layout === 'grid' ? (
                <>
                  {/* Cover Art Box */}
                  <motion.div 
                    layoutId={`playlist-cover-${playlist.id}`}
                    className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#0B1424] shadow-sm"
                  >
                    <img 
                      src={playlist.coverUrl} 
                      alt={playlist.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      referrerPolicy="no-referrer" 
                    />
                    
                    {/* Badge Overlays */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {playlist.isPinned && (
                        <div className="p-1.5 bg-black/70 backdrop-blur-md text-amber-400 rounded-lg shadow-sm" title="Pinned">
                          <Pin className="w-3 h-3 fill-current" />
                        </div>
                      )}
                      {playlist.isDownloaded && (
                        <div className="p-1.5 bg-black/70 backdrop-blur-md text-emerald-400 rounded-lg shadow-sm" title="Offline Available">
                          <Disc className="w-3 h-3 animate-spin-slow" />
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <div className="space-y-1 min-w-0">
                    <motion.h4 
                      layoutId={`playlist-title-${playlist.id}`}
                      className="text-[10px] font-bold text-white leading-snug truncate group-hover:text-[#00B4D8] transition-colors"
                    >
                      {playlist.title}
                    </motion.h4>
                    <p className="text-[8px] text-[#94A3B8] font-medium truncate">
                      {playlist.tracksCount} track{playlist.tracksCount === 1 ? '' : 's'} • {playlist.creator}
                    </p>
                  </div>

                  {/* Quick Actions on Hover */}
                  <div className="flex gap-1 mt-3 pt-2 justify-end opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(playlist.id);
                      }}
                      className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent ${
                        playlist.isPinned ? 'text-amber-400' : 'text-[#94A3B8]'
                      }`}
                      title={playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    {playlist.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete playlist "${playlist.title}"?`)) {
                            onDeletePlaylist(playlist.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#94A3B8] hover:text-rose-400 transition-colors cursor-pointer border-none bg-transparent"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <motion.div 
                      layoutId={`playlist-cover-${playlist.id}`}
                      className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0B1424] shrink-0 shadow-sm"
                    >
                      <img 
                        src={playlist.coverUrl} 
                        alt={playlist.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute top-1 left-1 flex gap-0.5">
                        {playlist.isPinned && (
                          <div className="p-0.5 bg-black/70 backdrop-blur-sm text-amber-400 rounded-md">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                        {playlist.isDownloaded && (
                          <div className="p-0.5 bg-black/70 backdrop-blur-sm text-emerald-400 rounded-md">
                            <Disc className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <div className="min-w-0 flex-1 text-left">
                      <motion.h4 
                        layoutId={`playlist-title-${playlist.id}`}
                        className="text-[10px] font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors"
                      >
                        {playlist.title}
                      </motion.h4>
                      <p className="text-[8px] text-[#94A3B8] font-medium truncate mt-0.5">
                        {playlist.tracksCount} track{playlist.tracksCount === 1 ? '' : 's'} • {playlist.creator}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(playlist.id);
                      }}
                      className={`p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent ${
                        playlist.isPinned ? 'text-amber-400' : 'text-[#94A3B8]'
                      }`}
                      title={playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    {playlist.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete playlist "${playlist.title}"?`)) {
                            onDeletePlaylist(playlist.id);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-[#94A3B8] hover:text-rose-400 transition-colors cursor-pointer border-none bg-transparent"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

export default Playlists;

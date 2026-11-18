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
          <Disc className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
          <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Playlists</h2>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--tj-color-chip-background,#102943)] text-[var(--tj-color-text-secondary,#A8B7CC)]">
            {playlists.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onImportSpotify && (
            <button
              type="button"
              onClick={onImportSpotify}
              className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] flex items-center gap-1.5 hover:text-[var(--tj-color-brand-hover,#21C2E8)] transition-colors cursor-pointer border-0 bg-transparent"
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
            className="min-h-[36px] text-xs font-bold text-white bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] px-3 py-1.5 rounded-[var(--tj-radius-md,8px)] flex items-center gap-1 transition-colors cursor-pointer border-0 shadow-none"
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
          className="p-4 bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-lg,10px)] flex flex-col md:flex-row gap-3 items-stretch md:items-center"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              required
              autoFocus
              placeholder="Name your playlist..."
              value={playlistTitle}
              onChange={(e) => setPlaylistTitle(e.target.value)}
              className="w-full bg-[var(--tj-color-input-background,#0B1F36)] rounded-[var(--tj-radius-md,8px)] px-4 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[var(--tj-color-brand-primary,#00B4D8)] text-[var(--tj-color-text-primary,#F8FAFC)] placeholder:text-[var(--tj-color-text-muted,#7F91AA)] transition-all border-0"
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
                className="min-h-[38px] px-3.5 py-2 bg-[var(--tj-color-chip-background,#102943)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-[var(--tj-radius-md,8px)] transition-colors cursor-pointer border-0 flex items-center gap-1.5"
                title="Open full creator with cover upload, privacy, and tags"
              >
                <Sliders className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setPlaylistTitle('');
                setIsCreating(false);
              }}
              className="min-h-[38px] px-4 py-2 bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-[var(--tj-radius-md,8px)] transition-colors cursor-pointer border-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[38px] px-5 py-2 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold uppercase tracking-wider rounded-[var(--tj-radius-md,8px)] transition-colors cursor-pointer border-0"
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
          className={layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5' : 'space-y-2'}
        >
          {/* Create Playlist Shortcut Card in Grid View */}
          {layout === 'grid' && (
            <motion.button
              type="button"
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
              className="bg-[var(--tj-color-surface-elevated,#111C30)]/70 hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-lg,10px)] aspect-square flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors group border-0"
            >
              <div className="w-12 h-12 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-chip-background,#102943)] group-hover:bg-[var(--tj-color-brand-primary,#00B4D8)]/20 text-[var(--tj-color-text-secondary,#A8B7CC)] group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] flex items-center justify-center transition-all group-hover:scale-105">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--tj-color-text-primary,#F8FAFC)] group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] mt-3 transition-colors uppercase tracking-wider">
                New Playlist
              </span>
              <span className="text-[11px] text-[var(--tj-color-text-muted,#7F91AA)] mt-0.5">
                Custom Collection
              </span>
            </motion.button>
          )}

          {/* Empty State */}
          {playlists.length === 0 && layout !== 'grid' && (
            <div className="bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-lg,10px)] p-8 text-center space-y-3 border-0">
              <div className="w-12 h-12 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-brand-primary,#00B4D8)]/12 text-[var(--tj-color-brand-primary,#00B4D8)] flex items-center justify-center mx-auto">
                <Music2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--tj-color-text-primary,#F8FAFC)]">No Playlists Created Yet</h4>
                <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] max-w-sm mx-auto">
                  Create and name your own playlists to organize your favorite TonJam tracks and music NFTs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCreateModal) onOpenCreateModal();
                  else setIsCreating(true);
                }}
                className="min-h-[40px] px-5 py-2.5 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold uppercase tracking-wider rounded-[var(--tj-radius-md,8px)] transition-colors cursor-pointer border-0"
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
              whileHover={layout === 'grid' ? { scale: 1.015 } : { x: 2 }}
              onClick={() => handlePlaylistClick(playlist.id)}
              className={
                layout === 'grid'
                  ? 'relative bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] p-3 rounded-[var(--tj-radius-lg,10px)] flex flex-col justify-between group h-full cursor-pointer transition-colors select-none border-0'
                  : 'bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] p-3 rounded-[var(--tj-radius-lg,10px)] flex items-center justify-between group gap-3 text-left cursor-pointer transition-colors select-none border-0'
              }
            >
              {layout === 'grid' ? (
                <>
                  {/* Cover Art Box */}
                  <motion.div
                    layoutId={`playlist-cover-${playlist.id}`}
                    className="relative aspect-square w-full rounded-[var(--tj-radius-md,8px)] overflow-hidden mb-3 bg-[var(--tj-color-bg-secondary,#0B1424)]"
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
                        <div className="p-1.5 bg-black/70 backdrop-blur-md text-amber-400 rounded-[var(--tj-radius-sm,6px)]" title="Pinned">
                          <Pin className="w-3 h-3 fill-current" />
                        </div>
                      )}
                      {playlist.isDownloaded && (
                        <div className="p-1.5 bg-black/70 backdrop-blur-md text-emerald-400 rounded-[var(--tj-radius-sm,6px)]" title="Offline Available">
                          <Disc className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <div className="space-y-1 min-w-0">
                    <motion.h4
                      layoutId={`playlist-title-${playlist.id}`}
                      className="text-xs font-bold text-[var(--tj-color-text-primary,#F8FAFC)] leading-snug truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors"
                    >
                      {playlist.title}
                    </motion.h4>
                    <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] font-medium truncate">
                      {playlist.tracksCount} track{playlist.tracksCount === 1 ? '' : 's'} • {playlist.creator}
                    </p>
                  </div>

                  {/* Quick Actions (touch-accessible on mobile, reveal on hover on desktop) */}
                  <div className="flex gap-1 mt-2 pt-1 justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(playlist.id);
                      }}
                      className={`p-2 rounded-[var(--tj-radius-sm,6px)] hover:bg-white/10 transition-colors cursor-pointer border-0 bg-transparent ${
                        playlist.isPinned ? 'text-amber-400' : 'text-[var(--tj-color-text-secondary,#A8B7CC)]'
                      }`}
                      title={playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
                      aria-label={playlist.isPinned ? `Unpin ${playlist.title}` : `Pin ${playlist.title}`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    {playlist.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlaylist(playlist.id);
                        }}
                        className="p-2 rounded-[var(--tj-radius-sm,6px)] hover:bg-rose-500/20 text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-rose-400 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Delete Playlist"
                        aria-label={`Delete ${playlist.title}`}
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
                      className="relative w-12 h-12 rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0"
                    >
                      <img
                        src={playlist.coverUrl}
                        alt={playlist.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 left-1 flex gap-0.5">
                        {playlist.isPinned && (
                          <div className="p-0.5 bg-black/70 backdrop-blur-sm text-amber-400 rounded-[var(--tj-radius-xs,4px)]">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                        {playlist.isDownloaded && (
                          <div className="p-0.5 bg-black/70 backdrop-blur-sm text-emerald-400 rounded-[var(--tj-radius-xs,4px)]">
                            <Disc className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <div className="min-w-0 flex-1 text-left">
                      <motion.h4
                        layoutId={`playlist-title-${playlist.id}`}
                        className="text-xs sm:text-sm font-bold text-[var(--tj-color-text-primary,#F8FAFC)] truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors"
                      >
                        {playlist.title}
                      </motion.h4>
                      <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] font-medium truncate mt-0.5">
                        {playlist.tracksCount} track{playlist.tracksCount === 1 ? '' : 's'} • {playlist.creator}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(playlist.id);
                      }}
                      className={`p-2 rounded-[var(--tj-radius-md,8px)] hover:bg-white/10 transition-colors cursor-pointer border-0 bg-transparent ${
                        playlist.isPinned ? 'text-amber-400' : 'text-[var(--tj-color-text-secondary,#A8B7CC)]'
                      }`}
                      title={playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
                      aria-label={playlist.isPinned ? `Unpin ${playlist.title}` : `Pin ${playlist.title}`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    {playlist.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlaylist(playlist.id);
                        }}
                        className="p-2 rounded-[var(--tj-radius-md,8px)] hover:bg-rose-500/20 text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-rose-400 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Delete Playlist"
                        aria-label={`Delete ${playlist.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
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

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc, ArrowUpDown, Filter, Music2 } from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';
import { LibraryAlbum } from '../types';

interface AlbumsProps {
  albums: LibraryAlbum[];
  layout?: 'grid' | 'list';
}

export const Albums: React.FC<AlbumsProps> = ({ albums, layout = 'list' }) => {
  const navigate = useNavigate();
  const [localSortBy, setLocalSortBy] = useState<'title' | 'year' | 'tracks'>('title');

  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => {
      if (localSortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (localSortBy === 'year') {
        return b.releaseYear - a.releaseYear; // newest first
      } else if (localSortBy === 'tracks') {
        return b.tracksCount - a.tracksCount; // biggest first
      }
      return 0;
    });
  }, [albums, localSortBy]);

  return (
    <div className="space-y-4">
      {/* Header with Sort Menu */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
          <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Albums Collection</h2>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--tj-color-text-muted,#7F91AA)]" />
          <select
            aria-label="Sort albums"
            value={localSortBy}
            onChange={(e) => setLocalSortBy(e.target.value as 'title' | 'year' | 'tracks')}
            className="bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-primary,#F8FAFC)] text-[11px] font-bold uppercase tracking-wider border-0 rounded-[var(--tj-radius-sm,6px)] px-2.5 py-1.5 outline-none cursor-pointer focus:ring-1 focus:ring-[var(--tj-color-brand-primary,#00B4D8)]"
          >
            <option value="title">Alphabetical</option>
            <option value="year">Release Year</option>
            <option value="tracks">Tracks Count</option>
          </select>
        </div>
      </div>

      {sortedAlbums.length === 0 ? (
        <div className="text-center py-10 px-6 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-elevated,#111C30)]/60 border-0">
          <Music2 className="w-8 h-8 text-[var(--tj-color-text-muted,#7F91AA)] mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-[var(--tj-color-text-primary,#F8FAFC)]">No Albums Found</h4>
          <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] max-w-xs mx-auto mt-1">
            Albums from collections and release catalogs will be organized here.
          </p>
        </div>
      ) : (
        <LayoutGroup id="albums-layout-group">
          <motion.div
            layout
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className={layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5' : 'space-y-2'}
          >
            {sortedAlbums.map((album) => (
              <motion.div
                layout
                key={album.id}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                whileHover={layout === 'grid' ? { scale: 1.015 } : { x: 2 }}
                onClick={() => navigate(`/album/${album.id}`)}
                className={
                  layout === 'grid'
                    ? 'bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border-0 p-3 rounded-[var(--tj-radius-lg,10px)] flex flex-col justify-between group cursor-pointer select-none transition-colors'
                    : 'bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border-0 p-3 rounded-[var(--tj-radius-lg,10px)] flex items-center justify-between group gap-4 text-left cursor-pointer select-none transition-colors'
                }
              >
                {layout === 'grid' ? (
                  <>
                    <motion.div
                      layoutId={`album-cover-${album.id}`}
                      className="relative aspect-square w-full rounded-[var(--tj-radius-md,8px)] overflow-hidden mb-3 bg-[var(--tj-color-bg-secondary,#0B1424)]"
                    >
                      <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {album.isDownloaded && (
                        <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Downloaded
                        </span>
                      )}
                    </motion.div>

                    <div className="space-y-1 min-w-0">
                      <motion.h4
                        layoutId={`album-title-${album.id}`}
                        className="text-xs font-bold text-[var(--tj-color-text-primary,#F8FAFC)] leading-snug truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors"
                      >
                        {album.title}
                      </motion.h4>
                      <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate font-medium">
                        {album.artist}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--tj-color-text-muted,#7F91AA)] font-mono font-medium uppercase tracking-wider mt-1">
                        <span>{album.releaseYear}</span>
                        <span>•</span>
                        <span>{album.tracksCount} {album.tracksCount === 1 ? 'track' : 'tracks'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <motion.div
                        layoutId={`album-cover-${album.id}`}
                        className="relative w-12 h-12 rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0"
                      >
                        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {album.isDownloaded && (
                          <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-emerald-500 w-2 h-2 rounded-full" title="Downloaded" />
                          </span>
                        )}
                      </motion.div>
                      <div className="min-w-0 text-left">
                        <motion.h4
                          layoutId={`album-title-${album.id}`}
                          className="text-xs sm:text-sm font-bold text-[var(--tj-color-text-primary,#F8FAFC)] truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors"
                        >
                          {album.title}
                        </motion.h4>
                        <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate font-medium">
                          {album.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div className="text-[11px] text-[var(--tj-color-text-muted,#7F91AA)] font-mono font-medium uppercase tracking-wider">
                        {album.releaseYear} • {album.tracksCount} {album.tracksCount === 1 ? 'track' : 'tracks'}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </LayoutGroup>
      )}
    </div>
  );
};

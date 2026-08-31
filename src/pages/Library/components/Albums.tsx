import React, { useState, useMemo } from 'react';
import { Disc, ArrowUpDown, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryAlbum } from '../types';

interface AlbumsProps {
  albums: LibraryAlbum[];
  layout?: 'grid' | 'list';
}

export const Albums: React.FC<AlbumsProps> = ({ albums, layout = 'list' }) => {
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
          <Disc className="w-4 h-4 text-[#0052FF]" />
          <h2 className="section-title">Albums Collection</h2>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={localSortBy}
            onChange={(e: any) => setLocalSortBy(e.target.value)}
            className="bg-white/5 dark:bg-black/40 text-foreground text-[10px] font-bold uppercase tracking-wider border border-black/10 dark:border-white/10 rounded-md px-2 py-1 outline-none cursor-pointer focus:border-[#0052FF]"
          >
            <option value="title">Alphabetical</option>
            <option value="year">Release Year</option>
            <option value="tracks">Tracks Count</option>
          </select>
        </div>
      </div>

      {layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sortedAlbums.map((album) => (
            <motion.div
              key={album.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-[10px] flex flex-col justify-between group"
            >
              <div className="relative aspect-square w-full rounded-[10px] overflow-hidden mb-3 bg-slate-800">
                <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {album.isDownloaded && (
                  <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                    Downloaded
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                  {album.title}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate font-semibold">
                  {album.artist}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono font-bold uppercase tracking-wider mt-1 opacity-70">
                  <span>{album.releaseYear}</span>
                  <span>•</span>
                  <span>{album.tracksCount} tracks</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedAlbums.map((album) => (
            <motion.div
              key={album.id}
              whileHover={{ x: 4 }}
              className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-[10px] flex items-center justify-between group gap-4 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {album.isDownloaded && (
                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-emerald-500 w-2 h-2 rounded-full" title="Downloaded" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold">
                    {album.artist}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-right shrink-0">
                <div className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-wider">
                  {album.releaseYear} • {album.tracksCount} tracks
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

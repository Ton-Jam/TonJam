import React from 'react';
import { Play, Calendar, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Album } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface FeaturedAlbumSectionProps {
  albums: Album[];
  title?: string;
}

export const FeaturedAlbumSection: React.FC<FeaturedAlbumSectionProps> = ({ albums, title }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-pink-400 uppercase tracking-widest">Cohesive Masterpieces</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{title || "Featured Albums"}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {albums.map((album) => {
          const imageSrc = album.coverUrl || getPlaceholderImage(album.title);

          return (
            <motion.div
              key={`featured-album-${album.id}`}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/album/${album.id}`)}
              className="bg-[#0c133a] rounded-[12px] p-4 flex flex-col justify-between aspect-[4/5] cursor-pointer group transition-all"
            >
              <div className="relative aspect-square rounded-[8px] overflow-hidden bg-slate-950">
                <img
                  src={imageSrc}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = getPlaceholderImage(album.title); }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <Play className="w-8 h-8 text-white fill-current animate-in zoom-in-50 duration-300" />
                </div>
              </div>

              <div className="mt-3 space-y-1 truncate">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#00B4D8] transition-colors">
                  {album.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{album.artist}</p>
                <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500 uppercase font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    {album.releaseYear}
                  </span>
                  <span className="flex items-center gap-1">
                    <Disc className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    {album.trackIds?.length || 0} tracks
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

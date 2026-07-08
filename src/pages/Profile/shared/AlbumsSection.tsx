import React from 'react';
import { Play, Disc, Gem } from 'lucide-react';
import { motion } from 'motion/react';
import { AlbumData } from '@/pages/ArtistProfile/types';

interface AlbumsSectionProps {
  albums: AlbumData[];
  onSelectAlbum?: (albumId: string) => void;
  onPlayAlbum?: (albumId: string) => void;
}

export const AlbumsSection: React.FC<AlbumsSectionProps> = ({
  albums,
  onSelectAlbum,
  onPlayAlbum
}) => {
  if (albums.length === 0) {
    return (
      <div className="text-center py-12 bg-[#101A3B]/40 border border-white/5 rounded-2xl p-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
        No albums found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Discography — Albums ({albums.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albums.map((album) => (
          <motion.div
            key={album.id}
            onClick={() => onSelectAlbum?.(album.id)}
            className="bg-[#101A3B] border border-white/5 rounded-2xl p-3 flex flex-col group hover:bg-[#15234f] transition-all cursor-pointer relative"
          >
            {/* Cover Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay with Play Button */}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayAlbum?.(album.id);
                  }}
                  className="p-3 bg-white text-[#050A24] rounded-full hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current text-[#050A24]" />
                </button>
              </div>

              {/* Web3 / NFT Badge indicator */}
              {album.isNFT && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                  <Gem className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="min-w-0 space-y-1">
              <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-white transition-colors">
                {album.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{album.trackCount} Tracks</span>
                <span>{album.releaseYear}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AlbumsSection;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Disc3, MoreHorizontal } from 'lucide-react';
import { Album } from '@/types';
import AlbumOptionsModal from '@/components/AlbumOptionsModal';
import { cardTokens } from '@/design';

interface AlbumCardProps {
  album: Album;
  index: number;
  className?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, index, className = '' }) => {
  const navigate = useNavigate();
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/album/${album.id}`)}
      style={{
        width: 'var(--card-width, 168px)',
        borderRadius: 'var(--card-radius, 12px)',
        padding: 'var(--card-padding, 10px)',
      }}
      className={`group relative cursor-pointer p-[10px] rounded-[12px] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between w-[168px] shrink-0 select-none ${className}`}
    >
      <div 
        className="relative aspect-square rounded-[10px] overflow-hidden bg-neutral-900 flex-shrink-0"
        style={{ borderRadius: 'var(--card-image-radius, 10px)' }}
      >
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all shadow-lg">
            <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
          </button>
        </div>
        <button 
            onClick={(e) => { e.stopPropagation(); setIsOptionsModalOpen(true); }}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
      <div 
        className="flex flex-col w-full min-w-0 mt-[6px]"
        style={{ marginTop: 'var(--card-content-gap, 6px)' }}
      >
        <div>
          <h3 
            className="text-white font-semibold text-[14px] leading-[20px] tracking-tight truncate group-hover:text-blue-400 transition-colors"
            style={{
              fontSize: 'var(--card-title-size, 14px)',
              lineHeight: 'var(--card-title-line-height, 20px)',
            }}
          >
            {album.title}
          </h3>
          <p 
            className="text-white/70 font-normal text-[12px] leading-[17px] mt-0.5 truncate"
            style={{
              fontSize: 'var(--card-meta-size, 12px)',
              lineHeight: 'var(--card-meta-line-height, 17px)',
            }}
          >
            {album.artist}
          </p>
        </div>
        <p className="text-white/40 text-[10px] font-mono mt-1">
          {album.trackIds?.length || 0} tracks
        </p>
      </div>
    </motion.div>
    <AnimatePresence>
        {isOptionsModalOpen && (
            <AlbumOptionsModal album={album} onClose={() => setIsOptionsModalOpen(false)} />
        )}
    </AnimatePresence>
    </>
  );
};

export default AlbumCard;

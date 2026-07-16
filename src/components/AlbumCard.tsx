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
      whileHover={{ y: -4, scale: cardTokens.animation.hoverScale }}
      whileTap={{ scale: cardTokens.animation.tapScale }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/album/${album.id}`)}
      style={{ width: cardTokens.album.width, padding: cardTokens.global.padding, borderRadius: cardTokens.global.borderRadius }}
      className={`group relative cursor-pointer bg-[#0A113A]/50 hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between overflow-hidden ${className}`}
    >
      <div className="relative aspect-square rounded-[6px] overflow-hidden mb-3 bg-white/[0.05] border border-white/5 group-hover:border-blue-500/30 transition-all shadow-md flex-shrink-0">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
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
      <div className="px-0.5 flex flex-col justify-between flex-grow">
        <div>
          <h3 style={{ fontSize: cardTokens.album.titleSize }} className="text-white font-black uppercase tracking-tighter truncate group-hover:text-blue-400 transition-colors leading-tight">
            {album.title}
          </h3>
          <p style={{ fontSize: cardTokens.album.artistSize }} className="text-white/70 font-bold uppercase tracking-wide mt-0.5 truncate">
            {album.artist}
          </p>
        </div>
        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1.5">
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

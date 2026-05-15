import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Disc3, MoreHorizontal } from 'lucide-react';
import { Album } from '@/types';
import AlbumOptionsModal from '@/components/AlbumOptionsModal';

interface AlbumCardProps {
  album: Album;
  index: number;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, index }) => {
  const navigate = useNavigate();
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/album/${album.id}`)}
      className="group relative w-full cursor-pointer"
    >
      <div className="relative aspect-square rounded-[4px] overflow-hidden mb-4 bg-white/[0.05] border border-white/5 group-hover:border-blue-500/30 transition-all shadow-2xl">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="w-12 h-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all shadow-2xl">
            <Play className="w-6 h-6 fill-current ml-1" />
          </button>
        </div>
        <button 
            onClick={(e) => { e.stopPropagation(); setIsOptionsModalOpen(true); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="px-1">
        <h3 className="text-white font-black text-xs uppercase tracking-tighter truncate group-hover:text-blue-400 transition-colors">
          {album.title}
        </h3>
        <p className="text-white/70 font-bold text-[10px] uppercase tracking-wide mt-0.5 truncate">
          {album.artist}
        </p>
        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">
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

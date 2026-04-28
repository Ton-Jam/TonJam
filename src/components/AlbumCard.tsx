import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Disc3 } from 'lucide-react';
import { Playlist } from '@/types';

interface AlbumCardProps {
  playlist: Playlist;
  index: number;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ playlist, index }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/album/${playlist.id}`)}
      className="group relative min-w-[180px] max-w-[180px] sm:min-w-[200px] sm:max-w-[200px] cursor-pointer"
    >
      <div className="relative aspect-square rounded-[2px] overflow-hidden mb-3 bg-white/[0.05]">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="w-12 h-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all shadow-lg shadow-blue-500/30">
            <Play className="w-5 h-5 fill-current ml-1" />
          </button>
        </div>
      </div>
      <h3 className="text-white font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">
        {playlist.title}
      </h3>
      <p className="text-white/50 text-xs truncate mt-1">
        Album • {playlist.trackIds?.length || 0} tracks
      </p>
    </motion.div>
  );
};

export default AlbumCard;

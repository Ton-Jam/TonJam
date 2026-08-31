import React from 'react';
import { Library, Disc, ArrowRight, Heart, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface LibraryCardProps {
  tracksCount: number;
  playlistsCount: number;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({
  tracksCount,
  playlistsCount
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#101A3B] rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Personal Collection Nodes
            </span>
            <h4 className="text-sm font-bold text-slate-200">Decentralized Library</h4>
          </div>
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Library className="w-5 h-5" />
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mb-4">
          Access your saved tracks, favorite audio, and custom playlists inside TonJam.
        </p>

        {/* Counts Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl p-3.5 flex items-center gap-3">
            <Heart className="w-5 h-5 text-red-400 fill-current" />
            <div>
              <span className="text-lg font-bold font-mono block leading-none">{tracksCount}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Saved Tracks</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 flex items-center gap-3">
            <Disc className="w-5 h-5 text-[#0052FF]" />
            <div>
              <span className="text-lg font-bold font-mono block leading-none">{playlistsCount}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Playlists</span>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/library')}
        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Open Full Library</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default LibraryCard;

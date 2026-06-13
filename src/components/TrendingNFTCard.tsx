import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS } from '@/constants';
import { NFTItem } from '@/types';
import { ShoppingCart } from 'lucide-react';

interface TrendingNFTCardProps {
  nft: NFTItem;
  onClick?: () => void;
}

const TrendingNFTCard: React.FC<TrendingNFTCardProps> = ({ nft, onClick }) => {
  const navigate = useNavigate();
  const { allTracks, playTrack } = useAudio();

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }

    const track = allTracks.find(t => t.id === nft.trackId) || MOCK_TRACKS.find(t => t.id === nft.trackId);
    if (track) {
      playTrack(track);
    } else {
      const fallbackTrack = {
        id: nft.trackId || nft.id,
        title: nft.title,
        artist: nft.artist || nft.creator,
        coverUrl: nft.imageUrl,
        audioUrl: nft.audioUrl || (MOCK_TRACKS[0]?.audioUrl ?? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
      };
      playTrack(fallbackTrack as any);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/nft/${nft.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="w-[160px] h-[240px] rounded-[4px] bg-gradient-to-br from-blue-900 via-blue-900 to-slate-950 relative shadow-2xl flex flex-col items-center p-3 border border-white/5 cursor-pointer hover:scale-[1.05] transition-transform duration-300"
    >
      {/* Premium Badge */}
      <div className="absolute top-[-8px] left-[-8px] w-[100px] h-[100px] overflow-hidden flex items-center justify-center pointer-events-none">
        <div className="absolute w-[150%] h-[30px] bg-gradient-to-br from-[#ff6547] via-[#ffb144] to-[#ff7053] rotate-[-45deg] translate-y-[-15px] flex items-center justify-center text-white font-semibold text-[8px] tracking-[0.1em] uppercase shadow-md">
            Premium
        </div>
      </div>
      
      {/* Content */}
      <img 
        src={nft.imageUrl || 'https://via.placeholder.com/150'} 
        alt={nft.title} 
        className="w-24 h-24 object-cover rounded-[4px] mt-4 mb-2 shadow-lg" 
      />
      
      <div className="text-center px-1 flex-grow">
        <h4 className="text-white font-semibold text-[10px] truncate max-w-[120px]">{nft.title}</h4>
        <p className="text-gray-400 text-[9px] font-medium truncate mb-1">{nft.creator || nft.artist}</p>
        <p className="text-blue-400 font-bold text-[11px] tracking-tight">
          <motion.span
            key={nft.price}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="inline-block"
          >
            {nft.price}
          </motion.span> TON
        </p>
      </div>

      <button 
        onClick={handleBuyClick}
        className="cursor-pointer transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-1.5 rounded-[4px] border border-[#C0C0C0]/50 shadow-[0_0_8px_rgba(59,130,246,0.15)] text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mt-1 w-full justify-center active:scale-95"
      >
        <ShoppingCart className="w-3 h-3" /> Buy
      </button>

    </div>
  );
};

export default TrendingNFTCard;

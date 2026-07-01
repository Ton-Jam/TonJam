import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { NFTItem } from '@/types';
import { ShoppingCart, BadgeCheck, Layers } from 'lucide-react';
import { MarqueeTitle } from './MarqueeTitle';

interface TrendingNFTCardProps {
  nft: NFTItem;
  onClick?: () => void;
}

const TrendingNFTCard: React.FC<TrendingNFTCardProps> = ({ nft, onClick }) => {
  const navigate = useNavigate();
  const { allTracks, playTrack, collections } = useAudio();

  const artist = MOCK_ARTISTS.find(a => a.name.toLowerCase() === (nft.creator || nft.artist || '').toLowerCase());
  const isVerified = nft.artistVerified || artist?.verified || artist?.isVerifiedArtist;

  const nftCollection = collections?.find(c => c.nftIds?.includes(nft.id));
  const traitCollection = nft.traits?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string ||
                          nft.attributes?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string;
  const collectionName = nftCollection?.name || traitCollection || (nft.title.includes(':') ? nft.title.split(':')[0] : null);

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
    <motion.div 
      whileHover={{ y: -6, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={handleCardClick}
      className="w-[160px] h-[240px] rounded-[4px] bg-gradient-to-br from-blue-900 via-blue-900 to-slate-950 relative shadow-2xl flex flex-col items-center p-3 border border-white/5 hover:border-blue-500/50 hover:shadow-[0_12px_35px_rgba(59,130,246,0.3)] transition-all duration-300 cursor-pointer"
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
      
      <div className="text-center px-1 flex-grow w-full min-w-0">
        <h4 className="text-white font-semibold text-[10px] truncate max-w-[120px] mx-auto">{nft.title}</h4>
        <div className="flex items-center justify-center gap-1 min-w-0 max-w-[130px] mx-auto mt-0.5">
          <div className="flex-1 min-w-0">
            <MarqueeTitle text={nft.creator || nft.artist || ''} className="text-gray-400 text-[9px] font-medium uppercase" />
          </div>
          {isVerified && <BadgeCheck className="w-2.5 h-2.5 text-blue-400 fill-current inline-block flex-shrink-0" />}
        </div>
        {collectionName && (
          <p className="text-indigo-400 text-[8px] font-bold uppercase tracking-wider truncate max-w-[130px] mx-auto flex items-center justify-center gap-0.5 mt-0.5">
            <Layers className="w-2 h-2 inline-block flex-shrink-0" /> {collectionName}
          </p>
        )}
        <p className="text-blue-400 font-bold text-[11px] tracking-tight mt-1">
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

    </motion.div>
  );
};

export default TrendingNFTCard;

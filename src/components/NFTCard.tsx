import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, CheckCircle2, Eye } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import NFTQuickViewModal from './NFTQuickViewModal';

interface NFTCardProps {
  nft: NFTItem;
  onAction?: (nft: NFTItem) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onAction }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack } = useAudio();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const associatedTrack = MOCK_TRACKS.find(t => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const isOwner = nft.owner === MOCK_USER.walletAddress;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedTrack) {
      playTrack(associatedTrack);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedTrack) {
      setOptionsTrack(associatedTrack);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(nft);
    } else {
      navigate(`/nft/${nft.id}`);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/nft/${nft.id}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative cursor-pointer"
      >
        {/* Image Container - 1:1 Aspect Ratio */}
        <div className="relative aspect-square rounded-[10px] overflow-hidden bg-neutral-900 shadow-lg mb-2">
          <img
            src={nft.imageUrl}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
            alt={nft.title}
          />
          
          {/* Overlay for Play Button & Badges */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
             {/* Top Row */}
             <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-[4px] text-[8px] font-bold uppercase tracking-widest text-white shadow-lg">
                  {nft.edition}
                </span>
             </div>
  
             {/* Center Play Button (if associated track) */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`transition-all duration-300 transform ${isActive || isPlaying ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                   <button 
                     onClick={handlePlayClick} 
                     className="w-10 h-10 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center shadow-xl shadow-blue-600/40 pointer-events-auto hover:bg-blue-500 transition-colors"
                   >
                     {isActive && isPlaying ? (
                       <Pause className="h-4 w-4 text-white fill-white" />
                     ) : (
                       <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                     )}
                   </button>
                </div>
             </div>
          </div>
        </div>
  
        {/* Content Below Card */}
        <div className="px-0.5">
           <div className="flex justify-between items-start gap-1.5">
              <h3 className={`text-xs font-bold uppercase tracking-tight truncate leading-tight flex-1 ${isActive ? 'text-blue-400' : 'text-white'}`}>
                {nft.title}
              </h3>
              {nft.listingType === 'auction' && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mt-1 shadow-lg shadow-amber-500/50 flex-shrink-0"></div>
              )}
           </div>
  
           <div className="flex items-center gap-1 mt-0.5 mb-1.5">
              <p 
                className="text-[9px] font-bold uppercase tracking-widest text-white/40 truncate hover:text-white hover:underline cursor-pointer inline-block"
                onClick={(e) => {
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                  if (artist) {
                    navigate(`/artist/${artist.id}`);
                  }
                }}
              >
                @{nft.creator}
              </p>
              {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                <CheckCircle2 className="h-2.5 w-2.5 text-blue-500" />
              )}
           </div>
  
           {/* Price and Action */}
           <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
              <div className="flex items-center gap-1">
                 <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
                 <span className="text-xs font-bold text-white tracking-tighter">{nft.price}</span>
              </div>
              
              <button 
                onClick={handleActionClick} 
                className={`px-3 py-1.5 rounded-[4px] text-[8px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg
                  ${isOwner 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'}
                `}
              >
                {isOwner ? (nft.listingType ? 'Manage' : 'List') : nft.listingType === 'auction' ? 'Bid' : 'Buy'}
              </button>
           </div>
        </div>
      </div>

      <NFTQuickViewModal 
        nft={nft} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
};

export default NFTCard;
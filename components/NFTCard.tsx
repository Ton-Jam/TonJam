
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NFTItem } from '../types';
import { TON_LOGO, MOCK_TRACKS, MOCK_USER } from '../constants';
import { useAudio } from '../context/AudioContext';

interface NFTCardProps {
  nft: NFTItem;
  onSell?: (nft: NFTItem) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onSell }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack } = useAudio();
  
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

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/nft/${nft.id}`);
  };

  return (
    <div 
      onClick={handleActionClick}
      className="relative cursor-pointer group w-full bg-[#050505] rounded-xl p-2.5 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 overflow-hidden shadow-2xl"
    >
      {/* Artwork Area */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3 border border-white/5 bg-[#080808]">
        <img 
          src={nft.imageUrl} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-105" 
          alt={nft.title} 
        />
        
        {/* Play Overlay */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? 'opacity-100' : ''}`}>
           <button 
             onClick={handlePlayClick}
             className="w-11 h-11 rounded-full electric-blue-bg flex items-center justify-center shadow-2xl border border-white/20 active:scale-90 transition-all"
           >
              <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-white text-[10px]`}></i>
           </button>
        </div>

        <div className="absolute top-2 left-2">
          <span className="px-2.5 py-1 glass backdrop-blur-3xl border border-white/10 rounded-md text-[7px] font-black uppercase tracking-widest text-white/90">
            {nft.edition}
          </span>
        </div>

        <button 
          onClick={handleOptionsClick}
          className="absolute top-2 right-2 w-7 h-7 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10"
        >
          <i className="fas fa-ellipsis-v text-[9px] text-white/50"></i>
        </button>
      </div>

      {/* Enhanced Info Area */}
      <div className="px-1 flex flex-col gap-1 pb-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className={`text-[11px] font-black uppercase tracking-tighter truncate italic leading-tight flex-1 ${isActive ? 'text-blue-400' : 'text-white'}`}>
            {nft.title}
          </h3>
          {nft.listingType === 'auction' && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mt-1"></div>
          )}
        </div>
        <p className="text-[8px] font-black uppercase tracking-widest italic text-white/20 mb-2 truncate">@{nft.creator}</p>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-white/10 uppercase tracking-widest mb-0.5">Price</span>
            <div className="flex items-center gap-1.5">
              <img src={TON_LOGO} className="w-3.5 h-3.5" alt="TON" />
              <span className="text-sm font-black italic text-white tracking-tighter">
                {nft.price}
              </span>
            </div>
          </div>
          <button 
            className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-white shadow-lg active:scale-95 transition-all border ${isOwner ? 'bg-white/5 border-white/10 text-white/30' : 'electric-blue-bg border-white/10 shadow-blue-500/10'}`}
          >
            {isOwner ? 'MANAGE' : nft.listingType === 'auction' ? 'BID' : 'BUY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;

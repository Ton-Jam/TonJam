import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, CheckCircle2, Eye, Send } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import NFTQuickViewModal from './NFTQuickViewModal';
import SendNFTModal from './SendNFTModal';

interface NFTCardProps {
  nft: NFTItem;
  variant?: 'default' | 'row';
  onAction?: (nft: NFTItem) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, variant = 'default', onAction }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack } = useAudio();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
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

  const handleSendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSendModalOpen(true);
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

  if (variant === 'row') {
    return (
      <div 
        className="group flex items-center gap-4 p-2 rounded-[12px] hover:bg-muted/50 transition-all cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 glass bg-foreground/[0.02]"
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/nft/${nft.id}`);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View NFT ${nft.title}`}
      >
        <div className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0">
          <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-500' : 'text-foreground'}`}>{nft.title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            {MOCK_ARTISTS.find(a => a.name === nft.creator) && (
              <img 
                src={MOCK_ARTISTS.find(a => a.name === nft.creator)?.avatarUrl} 
                alt={nft.creator} 
                className="w-3.5 h-3.5 rounded-full object-cover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                  if (artist) navigate(`/artist/${artist.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                    if (artist) navigate(`/artist/${artist.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${nft.creator}'s profile`}
              />
            )}
            <p 
              className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate hover:text-foreground hover:underline cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              onClick={(e) => {
                e.stopPropagation();
                const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                if (artist) navigate(`/artist/${artist.id}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                  if (artist) navigate(`/artist/${artist.id}`);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View ${nft.creator}'s profile`}
            >
              @{nft.creator}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1">
             <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
             <span className="text-xs font-bold text-foreground tracking-tighter">{nft.price}</span>
           </div>
           <button onClick={handleOptionsClick} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="NFT Options">
             <MoreVertical className="h-4 w-4" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-[12px] glass p-3 bg-foreground/[0.02]"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/nft/${nft.id}`);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View NFT ${nft.title}`}
      >
        {/* Image Container - 1:1 Aspect Ratio */}
        <div className="relative aspect-square rounded-[8px] overflow-hidden bg-neutral-900 shadow-lg mb-1">
          <img
            src={nft.imageUrl}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
            alt={nft.title}
          />
          
          {/* Overlay for Play Button & Badges */}
          <div className="absolute inset-0 bg-background/20 group-hover:bg-background/40 transition-colors duration-300">
             {/* Top Row */}
             <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                <span className="px-2 py-1 bg-background/60 backdrop-blur-md border border-blue-500/30 rounded-[4px] text-[8px] font-bold uppercase tracking-widest text-foreground shadow-lg">
                  {nft.edition}
                </span>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <button 
                      onClick={handleSendClick} 
                      className={`p-1.5 rounded-full bg-background/40 backdrop-blur-md text-muted-foreground/90 hover:text-blue-400 hover:bg-background/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      title="Send Asset"
                      aria-label="Send NFT"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={handleOptionsClick} 
                    className={`p-1.5 rounded-full bg-background/40 backdrop-blur-md text-muted-foreground/90 hover:text-foreground hover:bg-background/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    aria-label="NFT Options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
             </div>
  
             {/* Center Play Button (if associated track) */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`transition-all duration-300 transform ${isActive || isPlaying ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                   <button 
                     onClick={handlePlayClick} 
                     className="w-10 h-10 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center shadow-xl shadow-blue-600/40 pointer-events-auto hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                     aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
                   >
                     {isActive && isPlaying ? (
                       <Pause className="h-4 w-4 text-foreground fill-white" />
                     ) : (
                       <Play className="h-4 w-4 text-foreground fill-white ml-0.5" />
                     )}
                   </button>
                </div>
             </div>
          </div>
        </div>
  
        {/* Content Below Card */}
        <div className="px-0.5">
           <div className="flex justify-between items-start gap-1.5">
              <h3 className={`text-[11px] font-bold uppercase tracking-tight truncate leading-tight flex-1 ${isActive ? 'text-blue-400' : 'text-foreground'}`}>
                {nft.title}
              </h3>
              {nft.listingType === 'auction' && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mt-1 shadow-lg shadow-amber-500/50 flex-shrink-0"></div>
              )}
           </div>
  
           <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
              {MOCK_ARTISTS.find(a => a.name === nft.creator) && (
                <img 
                  src={MOCK_ARTISTS.find(a => a.name === nft.creator)?.avatarUrl} 
                  alt={nft.creator} 
                  className="w-3.5 h-3.5 rounded-full object-cover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                    if (artist) navigate(`/artist/${artist.id}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                      if (artist) navigate(`/artist/${artist.id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${nft.creator}'s profile`}
                />
              )}
              <p 
                className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground truncate hover:text-foreground hover:underline cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                  if (artist) {
                    navigate(`/artist/${artist.id}`);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                    if (artist) navigate(`/artist/${artist.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${nft.creator}'s profile`}
              >
                @{nft.creator}
              </p>
              {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                <CheckCircle2 className="h-2.5 w-2.5 text-blue-500" />
              )}
           </div>
  
           {/* Price and Action */}
           <div className="flex items-center justify-between border-t border-blue-500/30 pt-2 mt-2">
              <div className="flex items-center gap-1">
                 <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
                 <span className="text-xs font-bold text-foreground tracking-tighter">{nft.price}</span>
              </div>
              
              <button 
                onClick={handleActionClick} 
                className={`px-3 py-1.5 rounded-[4px] text-[8px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${isOwner 
                    ? 'bg-muted text-foreground hover:bg-muted/80' 
                    : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-blue-600/20'}
                `}
                aria-label={isOwner ? (nft.listingType ? 'Manage NFT' : 'List NFT') : nft.listingType === 'auction' ? 'Bid on NFT' : 'Buy NFT'}
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

      <SendNFTModal
        nft={nft}
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />
    </>
  );
};

export default NFTCard;
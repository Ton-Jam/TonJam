import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, CheckCircle2, Eye, Send, Star, Clock } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import NFTQuickViewModal from './NFTQuickViewModal';
import SendNFTModal from './SendNFTModal';
import BuyNFTModal from './BuyNFTModal';
import SellNFTModal from './SellNFTModal';
import SkeletonCard from './SkeletonCard';
import NFTOptionsModal from './NFTOptionsModal';
import ManageNFTModal from './ManageNFTModal';

interface NFTCardProps {
  nft: NFTItem;
  variant?: 'default' | 'row';
  onAction?: (nft: NFTItem) => void;
  isLoading?: boolean;
  className?: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, variant = 'default', onAction, isLoading = false, className = '' }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack, userProfile, setAnthem } = useAudio();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (nft.listingType !== 'auction' || !nft.auctionEndTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(nft.auctionEndTime!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('ENDED');
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nft.listingType, nft.auctionEndTime]);
  
  if (isLoading) {
    return <SkeletonCard variant={variant} />;
  }
  const associatedTrack = MOCK_TRACKS.find(t => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const isOwner = nft.owner === userProfile.walletAddress;
  const isAnthem = userProfile.anthemId === nft.id;
  const ownerProfile = MOCK_ARTISTS.find(a => a.walletAddress === nft.owner) || (nft.owner === userProfile.walletAddress ? userProfile : null);

  const handleSetAnthem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnthem(isAnthem ? null : nft.id);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedTrack) {
      playTrack(associatedTrack);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsOpen(true);
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
    } else if (isOwner && nft.listingType) {
      setIsManageModalOpen(true);
    } else if (isOwner && !nft.listingType) {
      setIsSellModalOpen(true);
    } else if (!isOwner && nft.listingType !== 'auction') {
      setIsBuyModalOpen(true);
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
        className={`group flex items-center gap-4 p-3 rounded-sm hover:bg-muted/50 transition-all cursor-pointer w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-card/30 ${className}`}
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
        <div className="relative w-14 h-14 rounded-sm overflow-hidden flex-shrink-0">
          <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} alt={nft.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-[11px] font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-500' : 'text-foreground'}`}>{nft.title}</h4>
          <div className="flex items-center gap-3 mt-1">
            <p 
              className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate hover:text-foreground hover:underline cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              onClick={(e) => {
                e.stopPropagation();
                const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                if (artist) navigate(`/artist/${artist.uid}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                  if (artist) navigate(`/artist/${artist.uid}`);
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
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2">
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
        className={`group relative cursor-pointer transition-all duration-300 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-2 bg-card/30 w-full ${className}`}
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
        <div className="relative aspect-square rounded-sm overflow-hidden bg-neutral-900 mb-2">
          <img
            src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            alt={nft.title}
          />
          
          {/* Overlay for Play Button & Badges */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
             {/* Top Row */}
             <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                <div className="flex flex-col gap-1">
                  <span className="px-2 py-0.5 bg-background/60 rounded-sm text-[8px] font-bold uppercase tracking-widest text-foreground">
                    {nft.edition}
                  </span>
                  {isOwner && (
                    <span className="px-2 py-0.5 bg-blue-600/80 rounded-sm text-[7px] font-bold uppercase tracking-widest text-white flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Owned
                    </span>
                  )}
                  {isOwner && !nft.listingType && (
                    <span className="px-2 py-0.5 bg-amber-500/80 rounded-sm text-[7px] font-bold uppercase tracking-widest text-black flex items-center gap-1">
                      Unlisted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isOwner && (
                    <button 
                      onClick={handleSetAnthem} 
                      className={`p-2 rounded-sm bg-background/40 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isAnthem ? 'text-amber-400 opacity-100' : 'text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:text-amber-400'} ${isActive ? 'opacity-100' : ''}`}
                      title={isAnthem ? "Remove Anthem" : "Set as Anthem"}
                      aria-label={isAnthem ? "Remove Anthem" : "Set as Anthem"}
                    >
                      <Star className={`h-3 w-3 ${isAnthem ? 'fill-amber-400' : ''}`} />
                    </button>
                  )}
                  {isOwner && (
                    <button 
                      onClick={handleSendClick} 
                      className={`p-2 rounded-sm bg-background/40 text-muted-foreground/60 hover:text-primary hover:bg-background/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      title="Send Asset"
                      aria-label="Send NFT"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  )}
                  <button 
                    onClick={handleOptionsClick} 
                    className={`p-2 rounded-sm bg-background/40 text-muted-foreground/60 hover:text-foreground hover:bg-background/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    aria-label="NFT Options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
             </div>

             {/* Timer Overlay for Auctions */}
             {nft.listingType === 'auction' && timeLeft && (
               <div className="absolute bottom-2 left-2 right-2 z-10">
                 <div className="bg-black/60 backdrop-blur-md rounded-sm px-2 py-1 flex items-center justify-between border border-white/10">
                   <div className="flex items-center gap-1.5">
                     <Clock className="w-3 h-3 text-amber-500" />
                     <span className="text-[9px] font-bold text-white uppercase tracking-wider">{timeLeft}</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></div>
                     <span className="text-[7px] font-bold text-amber-500 uppercase tracking-widest">LIVE</span>
                   </div>
                 </div>
               </div>
             )}
   
             {/* Center Play Button (if associated track) */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`transition-all duration-300 transform ${isActive || isPlaying ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                   <button 
                     onClick={handlePlayClick} 
                     className="w-10 h-10 rounded-sm bg-primary/90 flex items-center justify-center pointer-events-auto hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                     aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
                   >
                     {isActive && isPlaying ? (
                       <Pause className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                     ) : (
                       <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground ml-2" />
                     )}
                   </button>
                </div>
             </div>
          </div>
        </div>
  
        {/* Content Below Card */}
        <div className="px-1">
           <div className="flex justify-between items-start gap-1">
              <h3 className={`text-[11px] font-bold uppercase tracking-tight truncate leading-tight flex-1 ${isActive ? 'text-blue-400' : 'text-foreground'}`}>
                {nft.title}
              </h3>
              {nft.listingType === 'auction' && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mt-1 flex-shrink-0"></div>
              )}
           </div>
   
           <div className="flex items-center gap-1 mt-1 mb-1">
              <div className="flex flex-col min-w-0">
                <p 
                  className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground truncate hover:text-foreground hover:underline cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                    if (artist) {
                      navigate(`/artist/${artist.uid}`);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                      if (artist) navigate(`/artist/${artist.uid}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${nft.creator}'s profile`}
                >
                  @{nft.creator}
                </p>
                {!isOwner && ownerProfile && (
                  <p className="text-[7px] font-bold uppercase tracking-widest text-blue-400/50 truncate">
                    Owned by {ownerProfile.name}
                  </p>
                )}
              </div>
              {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
              )}
           </div>
   
           {/* Price and Action */}
           <div className="flex items-center justify-between pt-1 mt-1">
              <div className="flex items-center gap-1">
                 <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
                 <span className="text-[10px] font-bold text-foreground tracking-tighter">{nft.price}</span>
              </div>
              
              <button 
                onClick={handleActionClick} 
                className={`px-3 py-1.5 rounded-sm text-[8px] font-bold uppercase tracking-widest transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                  ${isOwner 
                    ? 'bg-muted text-foreground hover:bg-muted/80' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'}
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

      {isBuyModalOpen && (
        <BuyNFTModal
          nft={nft}
          onClose={() => setIsBuyModalOpen(false)}
        />
      )}

      {isOptionsOpen && (
        <NFTOptionsModal 
          nft={nft} 
          onClose={() => setIsOptionsOpen(false)} 
          onSend={() => setIsSendModalOpen(true)}
          onBuy={() => setIsBuyModalOpen(true)}
          onList={() => setIsSellModalOpen(true)}
        />
      )}

      {isManageModalOpen && (
        <ManageNFTModal
          nft={nft}
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
        />
      )}

      {isSellModalOpen && (
        <SellNFTModal
          nft={nft}
          onClose={() => setIsSellModalOpen(false)}
        />
      )}
    </>
  );
};

export default NFTCard;
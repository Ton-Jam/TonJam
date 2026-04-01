import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, CheckCircle2, Eye, Send, Star } from 'lucide-react';
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
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, variant = 'default', onAction, isLoading = false }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack, userProfile, setAnthem } = useAudio();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  
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
        className="group flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 transition-all cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 glass bg-card/50"
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
        <div className="relative w-12 h-12 rounded-[3px] overflow-hidden flex-shrink-0">
          <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} alt={nft.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-500' : 'text-foreground'}`}>{nft.title}</h4>
          <div className="flex items-center gap-3 mt-3">
            {MOCK_ARTISTS.find(a => a.name === nft.creator) && (
              <img 
                src={MOCK_ARTISTS.find(a => a.name === nft.creator)?.avatarUrl || getPlaceholderImage(`artist-${MOCK_ARTISTS.find(a => a.name === nft.creator)?.id}`)} 
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
        className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[10px] bg-muted/50 backdrop-blur-md border border-border dark:border-transparent p-1.5 hover:bg-muted hover:border-border/80"
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
        <div className="relative aspect-square rounded-[6px] overflow-hidden bg-neutral-900 shadow-lg mb-1.5">
          <img
            src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            alt={nft.title}
          />
          
          {/* Overlay for Play Button & Badges */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
             {/* Top Row */}
             <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                <div className="flex flex-col gap-2">
                  <span className="px-2 py-2 bg-background/60 backdrop-blur-md border border-border/50 dark:border-transparent rounded-[4px] text-[8px] font-bold uppercase tracking-widest text-foreground shadow-lg">
                    {nft.edition}
                  </span>
                  {isOwner && (
                    <span className="px-2 py-2 bg-blue-600/80 backdrop-blur-md border border-blue-400/30 rounded-[4px] text-[7px] font-bold uppercase tracking-widest text-white shadow-lg flex items-center gap-2">
                      <CheckCircle2 className="h-2 w-2" /> Owned By You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <button 
                      onClick={handleSetAnthem} 
                      className={`p-3 rounded-full bg-background/40 backdrop-blur-md transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isAnthem ? 'text-amber-400 opacity-100' : 'text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:text-amber-400'} ${isActive ? 'opacity-100' : ''}`}
                      title={isAnthem ? "Remove Anthem" : "Set as Anthem"}
                      aria-label={isAnthem ? "Remove Anthem" : "Set as Anthem"}
                    >
                      <Star className={`h-3.5 w-3.5 ${isAnthem ? 'fill-amber-400' : ''}`} />
                    </button>
                  )}
                  {isOwner && (
                    <button 
                      onClick={handleSendClick} 
                      className={`p-3 rounded-full bg-background/40 backdrop-blur-md text-muted-foreground/60 hover:text-primary hover:bg-background/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      title="Send Asset"
                      aria-label="Send NFT"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={handleOptionsClick} 
                    className={`p-3 rounded-full bg-background/40 backdrop-blur-md text-muted-foreground/60 hover:text-foreground hover:bg-background/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
                     className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-xl shadow-primary/40 pointer-events-auto hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                     aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
                   >
                     {isActive && isPlaying ? (
                       <Pause className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
                     ) : (
                       <Play className="h-4 w-4 text-primary-foreground fill-primary-foreground ml-3" />
                     )}
                   </button>
                </div>
             </div>
          </div>
        </div>
  
        {/* Content Below Card */}
        <div className="px-2">
           <div className="flex justify-between items-start gap-2">
              <h3 className={`text-[10px] font-bold uppercase tracking-tight truncate leading-tight flex-1 ${isActive ? 'text-blue-400' : 'text-foreground'}`}>
                {nft.title}
              </h3>
              {nft.listingType === 'auction' && (
                <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse mt-1.5 shadow-lg shadow-amber-500/50 flex-shrink-0"></div>
              )}
           </div>
   
           <div className="flex items-center gap-2 mt-2 mb-2">
              {MOCK_ARTISTS.find(a => a.name === nft.creator) && (
                <img 
                  src={MOCK_ARTISTS.find(a => a.name === nft.creator)?.avatarUrl || getPlaceholderImage(`artist-${MOCK_ARTISTS.find(a => a.name === nft.creator)?.id}`)} 
                  alt={nft.creator} 
                  className="w-3 h-3 rounded-full object-cover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
              <div className="flex flex-col min-w-0">
                <p 
                  className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground truncate hover:text-foreground hover:underline cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
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
                {!isOwner && ownerProfile && (
                  <p className="text-[5px] font-bold uppercase tracking-widest text-blue-400/50 truncate">
                    Owned by {ownerProfile.name}
                  </p>
                )}
              </div>
              {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                <CheckCircle2 className="h-2.5 w-2.5 text-blue-500" />
              )}
           </div>
   
           {/* Price and Action */}
           <div className="flex items-center justify-between pt-1.5 mt-1.5">
              <div className="flex items-center gap-1.5">
                 <img src={TON_LOGO} className="w-2.5 h-2.5" alt="TON" />
                 <span className="text-[10px] font-bold text-foreground tracking-tighter">{nft.price}</span>
              </div>
              
              <button 
                onClick={handleActionClick} 
                className={`px-3 py-1.5 rounded-full text-[7px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                  ${isOwner 
                    ? 'bg-muted text-foreground hover:bg-muted/80' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'}
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
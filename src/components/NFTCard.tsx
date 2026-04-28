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

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'mythic': return 'from-pink-500 to-purple-600';
      case 'legendary': return 'from-amber-400 to-orange-600';
      case 'epic': return 'from-purple-500 to-indigo-600';
      case 'rare': return 'from-blue-500 to-cyan-600';
      case 'uncommon': return 'from-emerald-400 to-green-600';
      default: return 'from-neutral-500 to-neutral-700';
    }
  };

  const rarity = nft.traits?.find(t => t.trait_type === 'Rarity')?.value as string || 
                 nft.attributes?.find(t => t.trait_type === 'Rarity')?.value as string;

  if (variant === 'row') {
    return (
      <div 
        className={`group flex items-center gap-4 p-4 rounded-[2px] hover:bg-muted/50 transition-all cursor-pointer w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-muted/20 border border-border/50 ${className}`}
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
        <div className="relative w-14 h-14 rounded-[2px] overflow-hidden flex-shrink-0 bg-neutral-900 shadow-md">
          <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} alt={nft.title} className="w-full h-full object-cover" />
          {rarity && (
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r ${getRarityColor(rarity)} h-1`}></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-[11px] font-black uppercase tracking-widest truncate ${isActive ? 'text-blue-500' : 'text-neutral-800'}`}>{nft.title}</h4>
            {rarity && (
              <span className={`text-[7px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-sm text-white bg-gradient-to-r ${getRarityColor(rarity)} shadow-sm`}>
                {rarity}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p 
              className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate hover:text-foreground transition-colors cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm"
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
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-full">
             <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
             <span className="text-[11px] font-black text-blue-500 tracking-tighter">{nft.price}</span>
           </div>
           <button onClick={handleOptionsClick} className="p-2 rounded-full hover:bg-muted text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="NFT Options">
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
        className={`group relative cursor-pointer transition-all duration-300 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[2px] p-3 bg-muted/20 border border-border/50 w-full ${className}`}
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
        <div className="relative aspect-square rounded-[2px] overflow-hidden bg-neutral-900 mb-4 shadow-xl">
          <img
            src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
            alt={nft.title}
          />
          
          {/* Overlay for Play Button & Badges */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300">
             {/* Top Row - Status Badges */}
             <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                <div className="flex flex-col gap-2 items-start">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-[2px] text-[9px] font-black uppercase tracking-widest text-white border border-white/10 shadow-lg">
                      {nft.edition}
                    </span>
                    {rarity && (
                      <span className={`px-2.5 py-1 bg-gradient-to-r ${getRarityColor(rarity)} rounded-[2px] text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-white/10`}>
                        {rarity}
                      </span>
                    )}
                    {nft.listingType === 'auction' && (
                      <span className="px-2.5 py-1 bg-orange-500 rounded-[2px] text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-white/10 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        Auction
                      </span>
                    )}
                  </div>
                  
                  {isOwner && (
                    <div className="flex gap-1.5">
                      <span className="px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded-[2px] text-[8px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 shadow-md">
                        <CheckCircle2 className="h-3 w-3" /> Owned
                      </span>
                      {!nft.listingType && (
                        <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-sm rounded-[2px] text-[8px] font-black uppercase tracking-widest text-black flex items-center gap-1.5 shadow-md">
                          Unlisted
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {isOwner && (
                    <button 
                      onClick={handleSetAnthem} 
                      className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isAnthem ? 'text-amber-400 opacity-100 ring-2 ring-amber-400/50' : 'text-white/60 opacity-0 group-hover:opacity-100 hover:text-amber-400'} ${isActive ? 'opacity-100' : ''}`}
                      title={isAnthem ? "Remove Anthem" : "Set as Anthem"}
                      aria-label={isAnthem ? "Remove Anthem" : "Set as Anthem"}
                    >
                      <Star className={`h-4 w-4 ${isAnthem ? 'fill-amber-400' : ''}`} />
                    </button>
                  )}
                  <button 
                    onClick={handleOptionsClick} 
                    className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-foreground hover:bg-black/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    aria-label="NFT Options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
             </div>

             {/* Center Play Button (if associated track) */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`transition-all duration-300 transform ${isActive || isPlaying ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                   <button 
                     onClick={handlePlayClick} 
                     className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center pointer-events-auto hover:bg-blue-500 transition-colors shadow-2xl backdrop-blur-sm"
                     aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
                   >
                     {isActive && isPlaying ? (
                       <Pause className="h-7 w-7 fill-current" />
                     ) : (
                       <Play className="h-7 w-7 fill-current ml-1" />
                     )}
                   </button>
                </div>
             </div>
          </div>
        </div>
  
        {/* Content Below Card */}
        <div className="px-1 mt-1">
           <div className="flex justify-between items-start gap-1">
              <h3 className={`text-[13px] font-black uppercase tracking-tight truncate leading-none flex-1 italic ${isActive ? 'text-blue-500' : 'text-neutral-800'}`}>
                {nft.title}
              </h3>
              {nft.listingType === 'auction' && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">BIDDING</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                </div>
              )}
           </div>
    
           <div className="flex items-center gap-2 mt-2 mb-4">
              <div className="flex flex-col min-w-0">
                <p 
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 truncate hover:text-foreground transition-colors cursor-pointer inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                    if (artist) {
                      navigate(`/artist/${artist.uid}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${nft.creator}'s profile`}
                >
                  {nft.creator}
                </p>
              </div>
              {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
              )}
           </div>
    
           {/* Price and Action */}
           <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex flex-col">
                 <span className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest leading-none mb-1.5">
                   {nft.listingType === 'auction' ? 'Current Bid' : 'Valuation'}
                 </span>
                 <div className="flex items-center gap-1.5">
                    <img src={TON_LOGO} className="w-4 h-4" alt="TON" />
                    <span className="text-[14px] font-black text-foreground tracking-tighter leading-none">{nft.price}</span>
                 </div>
              </div>
              
              <button 
                onClick={handleActionClick} 
                className={`px-5 py-2.5 rounded-[2px] text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-xl
                  ${isOwner 
                    ? 'bg-muted text-foreground hover:bg-muted/80' 
                    : nft.listingType === 'auction' 
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20' 
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'}
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Eye, Send, Star, Clock, User, Share2, Info, Gem, Trash2, ArrowUp, ArrowDown, ExternalLink, Heart, ListMusic, Plus, LayoutGrid, Settings, Wallet, Tag } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { cn, getPlaceholderImage, shareContent } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import NFTQuickViewModal from './NFTQuickViewModal';
import SendNFTModal from './SendNFTModal';
import SellNFTModal from './SellNFTModal';
import SkeletonCard from './SkeletonCard';
import NFTOptionsModal from './NFTOptionsModal';
import ManageNFTModal from './ManageNFTModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { motion } from 'motion/react';

interface NFTCardProps {
  nft: NFTItem;
  variant?: 'default' | 'row';
  onAction?: (nft: NFTItem) => void;
  isLoading?: boolean;
  className?: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, variant = 'default', onAction, isLoading = false, className = '' }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack, userProfile, setAnthem, addNotification } = useAudio();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
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
  
  const handleSetAnthem = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAnthem(isAnthem ? null : nft.id);
    addNotification(isAnthem ? 'Anthem removed' : 'Anthem set successfully', 'success');
  };

  const handlePlayClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (associatedTrack) {
      playTrack(associatedTrack);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.innerWidth < 1024) {
      setIsOptionsOpen(true);
    }
  };

  const handleQuickViewClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleSendClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsSendModalOpen(true);
  };

  const handleSellClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsSellModalOpen(true);
  };

  const handleManageClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsManageModalOpen(true);
  };

  const handleBuyClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/nft/${nft.id}`);
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
      navigate(`/nft/${nft.id}`);
    } else {
      navigate(`/nft/${nft.id}`);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/nft/${nft.id}`);
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/#/nft/${nft.id}`;
    const result = await shareContent({
      title: `NFT: ${nft.title} by ${nft.creator}`,
      text: `Check out this NFT on TonJam: ${nft.title}`,
      url: shareUrl,
    });

    if (result.success) {
      addNotification(result.method === 'clipboard' ? 'Link copied!' : 'Shared!', 'success');
    }
  };

  const NFTMenuContent = () => (
    <>
      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">Artifact Actions</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={handlePlayClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">Play Associated Track</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleQuickViewClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Eye className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Rapid Analysis</span>
      </DropdownMenuItem>
      
      {isOwner && (
        <>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem onClick={handleSetAnthem} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
            <Star className={cn("h-4 w-4", isAnthem && "fill-current text-yellow-500")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{isAnthem ? "Deactivate Anthem" : "Synchronize Anthem"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
            <Send className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Transit Asset</span>
          </DropdownMenuItem>
          {nft.listingType ? (
            <DropdownMenuItem onClick={handleManageClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
              <Settings className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Configure Listing</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleSellClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
              <Tag className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Initialize Listing</span>
            </DropdownMenuItem>
          )}
        </>
      )}

      {!isOwner && nft.listingType && (
        <>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem onClick={handleBuyClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
            <Wallet className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Acquire Asset</span>
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={() => navigate(`/nft/${nft.id}`)} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <ExternalLink className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Neural Link</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Distribute Signal</span>
      </DropdownMenuItem>
    </>
  );

  const ContextMenuContentRefined = () => (
    <ContextMenuContent className="bg-[#0A0A0B] border-white/5 text-white shadow-2xl min-w-[200px] p-1 rounded-xl backdrop-blur-3xl">
      <ContextMenuLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">Neural Context</ContextMenuLabel>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handlePlayClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-black uppercase tracking-widest">Execute Logic</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={handleQuickViewClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <Eye className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Scan Data</span>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Broadcast Signal</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );

  const MoreOptionsButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          onClick={handleOptionsClick}
          className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-all active:scale-95"
          aria-label="NFT Options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="hidden lg:block bg-[#0A0A0B]/95 border-white/5 text-white shadow-[0_16px_60px_rgba(0,0,0,0.8)] min-w-[220px] p-1 rounded-xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200"
      >
        <NFTMenuContent />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'from-neutral-500 to-neutral-700';
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
      <ContextMenu>
        <ContextMenuTrigger>
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group flex items-center gap-4 p-3 rounded-[2px] hover:bg-white/5 transition-all cursor-pointer w-full outline-none focus-visible:ring-1 focus-visible:ring-blue-500 bg-muted/10 border border-transparent hover:border-white/5 ${className}`}
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
            <div className="relative w-12 h-12 rounded-[2px] overflow-hidden flex-shrink-0 bg-neutral-900 shadow-sm border border-white/5">
              <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} alt={nft.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              {rarity && (
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r ${getRarityColor(rarity)} h-1`}></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`text-[7.5px] font-medium uppercase tracking-tight line-clamp-2 whitespace-normal break-words ${isActive ? 'text-blue-500' : 'text-foreground'}`}>{nft.title}</h4>
                {rarity && (
                   <div className={`hidden sm:block w-1 h-1 rounded-full bg-gradient-to-r ${getRarityColor(rarity)}`}></div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p 
                  className="text-[7.5px] font-black text-foreground/80 uppercase tracking-widest truncate hover:text-blue-500 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                    if (artist) navigate(`/artist/${artist.uid}`);
                  }}
                >
                  {nft.creator}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[6px] font-bold text-muted-foreground uppercase tracking-widest">Eval</span>
                  <div className="flex items-center gap-1">
                    <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
                    <span className="text-[12px] font-bold text-foreground tracking-tighter">{nft.price}</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <button 
                    onClick={handleActionClick}
                    className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-sm flex items-center gap-1.5
                      ${isOwner 
                        ? 'bg-white/10 text-foreground hover:bg-white/20 border border-white/5' 
                        : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/20 border-none'}
                    `}
                  >
                    {isOwner ? (nft.listingType ? <Settings className="w-3 h-3" /> : 'SELL') : (nft.listingType === 'auction' ? 'BID' : 'BUY')}
                  </button>
                  <MoreOptionsButton />
               </div>
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContentRefined />
      </ContextMenu>
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Card
              onClick={handleCardClick}
              className={`group relative cursor-pointer transition-all duration-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-[2px] overflow-hidden bg-muted/10 border-white/5 w-full shadow-none ${className}`}
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
            {/* Image Container - 1:1 Aspect Ratio with NFT Gradient Border */}
            <div className="relative aspect-square overflow-hidden bg-neutral-900 transition-all">
              <img
                src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt={nft.title}
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(`nft-${nft.id}`); }}
              />

              {/* Rarity Glow Border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(rarity)}`} />
              
              {/* Top Overlays */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
                 <div className="flex flex-col gap-1">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-[2px] text-[8px] font-bold uppercase tracking-[0.1em] text-white border border-white/10 shadow-lg">
                      {nft.edition}
                    </span>
                    {nft.listingType === 'auction' && (
                      <span className="px-2 py-1 bg-amber-500 rounded-[2px] text-[8px] font-bold uppercase tracking-[0.1em] text-black shadow-lg border border-white/10">
                        AUCTION
                      </span>
                    )}
                    {rarity && (
                      <span className={`px-2 py-1 bg-gradient-to-r ${getRarityColor(rarity)} rounded-[2px] text-[8px] font-bold uppercase tracking-[0.1em] text-white shadow-lg border border-white/10`}>
                        {rarity}
                      </span>
                    )}
                 </div>
                 
                 <div className="flex gap-2 pointer-events-auto">
                    <MoreOptionsButton />
                 </div>
              </div>

              {/* Action Overlay */}
              <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                 <button 
                   onClick={handlePlayClick} 
                   className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30 border border-white/20"
                 >
                   {isActive && isPlaying ? <Pause className="h-4 w-4 fill-current animate-pulse" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                 </button>
              </div>
            </div>
      
            {/* Artifact Data Footer */}
            <CardContent className="p-2 flex flex-col gap-2">
               <div className="space-y-0.5">
                  <h3 className={`text-[7.5px] font-medium uppercase tracking-tighter line-clamp-2 whitespace-normal break-words leading-tight ${isActive ? 'text-blue-500' : 'text-foreground'}`}>
                    {nft.title}
                  </h3>
                  <div className="flex items-center gap-2">
                     <p className="text-[7.5px] font-black text-foreground/80 uppercase tracking-[0.1em]">{nft.creator}</p>
                  </div>
               </div>

               <div className="flex items-end justify-between mt-1">
                  <div className="space-y-0.5">
                     <p className="text-[6px] font-bold text-muted-foreground/20 uppercase tracking-[0.1em]">Val_Artifact</p>
                     <div className="flex items-center gap-1 bg-muted/30 py-0.5 px-2 rounded-[2px] border border-border/10">
                        <img src={TON_LOGO} className="w-2.5 h-2.5" alt="TON" />
                        <span className="text-[11px] font-bold text-foreground tracking-tighter">{nft.price}</span>
                     </div>
                  </div>
                  
                  <button 
                    onClick={handleActionClick} 
                    className={`h-[26px] px-3 rounded-full text-[8px] font-black uppercase tracking-[0.05em] transition-all active:scale-95 shadow-sm
                      ${isOwner 
                        ? 'bg-muted/50 text-foreground hover:bg-muted/80 border border-border/10' 
                        : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/20 border-none'}
                    `}
                  >
                    {isOwner ? (nft.listingType ? 'CONFIG' : 'SELL') : (nft.listingType === 'auction' ? 'BID' : 'BUY')}
                  </button>
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </ContextMenuTrigger>
        <ContextMenuContentRefined />
      </ContextMenu>

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

      {isOptionsOpen && (
        <NFTOptionsModal 
          nft={nft} 
          onClose={() => setIsOptionsOpen(false)} 
          onSend={() => setIsSendModalOpen(true)}
          onBuy={() => navigate(`/nft/${nft.id}`)}
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

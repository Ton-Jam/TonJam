import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Eye, Send, Star, Clock, User, Share2, Info, Gem, Trash2, ArrowUp, ArrowDown, ExternalLink, ListMusic, Plus, LayoutGrid, Settings, Wallet, Tag, BadgeCheck, Layers, History, RotateCw } from 'lucide-react';
import { NFTItem } from '@/types';
import { useGramPrice } from '@/contexts/GramPriceContext';
import { TON_LOGO, MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';
import { cn, getPlaceholderImage, shareContent } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import NFTQuickViewModal from './NFTQuickViewModal';
import NFT3DViewerModal from './NFT3DViewerModal';
import { NFTTransactionHistoryModal } from './NFTTransactionHistoryModal';
import { PriceSparkline } from './PriceSparkline';
import SendNFTModal from './SendNFTModal';
import SellNFTModal from './SellNFTModal';
import SkeletonCard from './SkeletonCard';
import ConfirmationModal from './ConfirmationModal';
import NFTOptionsModal from './NFTOptionsModal';
import ManageNFTModal from './ManageNFTModal';
import BidModal from './BidModal';
import AddToNFTFolderModal from './AddToNFTFolderModal';
import NFTFolderModal from './NFTFolderModal';
import ShareNFTDialog from './ShareNFTDialog';
import { AuctionCountdownTimer } from './AuctionCountdownTimer';
import { MarqueeTitle } from './MarqueeTitle';
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

import { useTonConnectUI } from '@tonconnect/ui-react';
import { buyNFT } from '@/services/tonService';
import { motion } from 'motion/react';
import { cardTokens } from '@/design';


interface NFTCardProps {
  nft: NFTItem;
  variant?: 'default' | 'row';
  onAction?: (nft: NFTItem) => void;
  isLoading?: boolean;
  className?: string;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (nft: NFTItem) => void;
  currencyMode?: 'TON' | 'USD';
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, variant = 'default', onAction, isLoading = false, className = '', isSelectedForCompare = false, onToggleCompare, currencyMode = 'TON' }) => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const { convertPrice, localCurrencyEnabled } = useGramPrice();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { playTrack, currentTrack, isPlaying, togglePlay, setOptionsTrack, userProfile, setAnthem, addNotification, collections, seek, progress } = useAudio();

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewSeconds, setPreviewSeconds] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  const formattedPrice = React.useMemo(() => {
    if (localCurrencyEnabled) {
      return convertPrice(nft?.price || '0');
    }
    if (!nft?.price) return '0';
    const num = parseFloat(nft.price.replace(' TON', '').trim());
    if (isNaN(num)) return nft.price;
    if (currencyMode === 'USD') {
      const usd = num * 5.30;
      return usd >= 1000 ? Math.round(usd).toLocaleString() : usd.toFixed(2);
    }
    return nft.price.replace(' TON', '').trim();
  }, [nft?.price, currencyMode, localCurrencyEnabled, convertPrice]);

  const basePriceNum = React.useMemo(() => {
    if (!nft?.price) return 0;
    const num = parseFloat(nft.price.replace(' TON', '').trim());
    return isNaN(num) ? 0 : num;
  }, [nft?.price]);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConfirmPurchaseOpen, setIsConfirmPurchaseOpen] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isEndingSoon, setIsEndingSoon] = useState(false);

  useEffect(() => {
    if (nft.listingType !== 'auction' || !nft.auctionEndTime) {
      setIsEndingSoon(false);
      return;
    }

    const checkEndingSoon = () => {
      const timeLeft = new Date(nft.auctionEndTime!).getTime() - Date.now();
      setIsEndingSoon(timeLeft > 0 && timeLeft <= 3600000);
    };

    checkEndingSoon();
    const interval = setInterval(checkEndingSoon, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [nft.listingType, nft.auctionEndTime]);

  const bars = React.useMemo(() => {
    const seed = nft.id || nft.title || "waveform";
    const barCount = 20;
    const result: number[] = [];
    for (let i = 0; i < barCount; i++) {
      let charCodeSum = 0;
      for (let j = 0; j < seed.length; j++) {
        charCodeSum += seed.charCodeAt(j) * (i + 1);
      }
      const height = 20 + (charCodeSum % 71); // heights between 20% and 90%
      result.push(height);
    }
    return result;
  }, [nft.id, nft.title]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!associatedTrack) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

    if (!isActive) {
      playTrack(associatedTrack);
      setTimeout(() => {
        seek(percent);
      }, 100);
    } else {
      seek(percent);
    }
  };

  if (isLoading) {
    return <SkeletonCard variant={variant} />;
  }
  const associatedTrack = MOCK_TRACKS.find(t => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const isOwner = nft.owner === userProfile.walletAddress;
  const isAnthem = userProfile.anthemId === nft.id;

  const nftCollection = collections?.find(c => c.nftIds?.includes(nft.id));
  const traitCollection = nft.traits?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string ||
                          nft.attributes?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string;
  const collectionName = nftCollection?.name || traitCollection || (nft.title.includes(':') ? nft.title.split(':')[0] : null);

  const artist = MOCK_ARTISTS.find(a => a.name.toLowerCase() === nft.creator.toLowerCase() || a.name.toLowerCase() === nft.artist?.toLowerCase());
  const isVerified = nft.artistVerified || artist?.verified || artist?.isVerifiedArtist;
  
  const isAuctionEnded = React.useMemo(() => {
    if (nft.listingType !== 'auction' || !nft.auctionEndTime) return false;
    return new Date(nft.auctionEndTime).getTime() <= Date.now();
  }, [nft.listingType, nft.auctionEndTime]);

  const handleSetAnthem = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAnthem(isAnthem ? null : nft.id);
    addNotification(isAnthem ? 'Anthem removed' : 'Anthem set successfully', 'success');
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlayingPreview(false);
    setPreviewSeconds(30);
  };

  const handlePreviewToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlayingPreview) {
      stopPreview();
      return;
    }

    // Stop any other active previews globally
    if ((window as any)._activePreviewStop) {
      try {
        (window as any)._activePreviewStop();
      } catch (err) {
        console.error("Error stopping previous preview:", err);
      }
    }

    // Pause primary audio if playing
    if (isPlaying) {
      togglePlay().catch((err) => console.error("Error pausing main audio:", err));
    }

    const audioUrl = nft.audioUrl || associatedTrack?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Register active preview stop callback globally
    (window as any)._activePreviewStop = stopPreview;

    audio.play().then(() => {
      setIsPlayingPreview(true);
      let timeLeft = 30;
      setPreviewSeconds(30);

      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          stopPreview();
        } else {
          setPreviewSeconds(timeLeft);
        }
      }, 1000);
    }).catch((err) => {
      console.error("Audio preview failed:", err);
      addNotification("Preview playback failed", "error");
      stopPreview();
    });

    audio.onended = () => {
      stopPreview();
    };
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (associatedTrack) {
      playTrack(associatedTrack);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsOpen(true);
  };

  const handleQuickViewClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleHistoryClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsHistoryModalOpen(true);
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
    if (isOwner) {
      if (nft.listingType) {
        setIsManageModalOpen(true);
      } else {
        setIsSellModalOpen(true);
      }
    } else if (nft.listingType === 'auction') {
      setIsBidModalOpen(true);
    } else if (!isAuctionEnded) {
      // BUY / COLLECT flow - trigger confirmation modal first to prevent accidental purchase
      if (!tonConnectUI.connected) {
        addNotification('Please connect your wallet first', 'error');
        tonConnectUI.openModal();
        return;
      }
      setIsConfirmPurchaseOpen(true);
    }
  };

  const executeDirectPurchase = async () => {
    setIsConfirmPurchaseOpen(false);
    try {
      setIsPurchasing(true);
      addNotification('Initiating purchase...', 'info');
      
      await buyNFT(
        tonConnectUI,
        nft.owner,
        nft.price,
        nft.title,
        nft.royaltySplits || []
      );
      
      addNotification('Purchase successful!', 'success');
    } catch (err) {
      console.error('Purchase failed', err);
      addNotification('Purchase failed or rejected', 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePlayClick(e);
  };

  const handleShare = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsShareModalOpen(true);
  };

  const NFTMenuContent = () => (
    <>
      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">NFT Options</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={() => onToggleCompare?.(nft)} className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-zinc-800 transition-colors">
        <LayoutGrid className={cn("h-4 w-4", isSelectedForCompare ? "text-emerald-400" : "text-zinc-500")} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{isSelectedForCompare ? "Remove from Compare" : "Compare"}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handlePlayClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">Play Associated Track</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleQuickViewClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Eye className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Quick View</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setIs3DModalOpen(true)} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <RotateCw className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">3D Holographic Stage</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleHistoryClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <History className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Ledger History</span>
      </DropdownMenuItem>
      
      {isOwner && (
        <>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem onClick={handleSetAnthem} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
            <Star className={cn("h-4 w-4", isAnthem && "fill-current text-yellow-500")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{isAnthem ? "Remove Anthem" : "Set as Anthem"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
            <Send className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Send NFT</span>
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
            <span className="text-[10px] font-bold uppercase tracking-widest">{nft.listingType === 'auction' ? 'Place Bid' : 'Acquire Asset'}</span>
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={() => navigate(`/nft/${nft.id}`)} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <ExternalLink className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">View Details</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Share NFT</span>
      </DropdownMenuItem>
    </>
  );

  const ContextMenuContentRefined = () => (
    <ContextMenuContent className="bg-[#0A0A0B] border-white/5 text-white shadow-2xl min-w-[200px] p-1 rounded-xl backdrop-blur-3xl">
      <ContextMenuLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">NFT Options</ContextMenuLabel>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handlePlayClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-black uppercase tracking-widest">Play Track</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={handleQuickViewClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <Eye className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Quick View</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setIs3DModalOpen(true)} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <RotateCw className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">3D Holographic Stage</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={handleHistoryClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <History className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Ledger History</span>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Share NFT</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );

  const MoreOptionsButton = () => (
    <button 
      onClick={handleOptionsClick}
      className="p-2 rounded-full text-white/60 hover:text-white transition-all active:scale-95"
      aria-label="NFT Options"
    >
      <MoreVertical className="h-4 w-4" />
    </button>
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

  const getSupplyIndicator = () => {
    const supply = nft.supply || 1;
    const editionLower = (nft.edition || "").toLowerCase();
    
    if (supply === 1 || editionLower === 'unique' || nft.edition === 'Unique') {
      return {
        label: '1/1 UNIQUE',
        className: 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white font-extrabold uppercase border border-white/20 shadow-lg animate-pulse',
        icon: 'Star'
      };
    }
    
    if (supply <= 10) {
      return {
        label: `LIMIT: ${supply} (ULTRA)`,
        className: 'bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold uppercase border border-orange-400/20 shadow-md',
        icon: 'Gem'
      };
    }

    if (supply <= 100) {
      return {
        label: `LIMIT: ${supply}`,
        className: 'bg-slate-900/90 text-amber-500 font-bold uppercase border border-amber-500/20 shadow-sm',
        icon: 'Sparkles'
      };
    }

    return {
      label: `QTY: ${supply}`,
      className: 'bg-black/60 text-zinc-300 font-medium uppercase border border-white/5',
      icon: 'Layers'
    };
  };

  const rarity = nft.traits?.find(t => t.trait_type === 'Rarity')?.value as string || 
                 nft.attributes?.find(t => t.trait_type === 'Rarity')?.value as string;

  const supplyIndicator = getSupplyIndicator();

  if (variant === 'row') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
        <motion.div 
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ 
            y: -6, 
            scale: 1.03, 
            boxShadow: "0 0 25px 2px rgba(91, 107, 255, 0.25), 0 0 10px rgba(0, 180, 216, 0.15)" 
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`group flex items-center gap-4 p-3 rounded-[4px] bg-muted/10 border border-transparent hover:border-blue-500/40 hover:bg-muted/20 transition-all duration-300 cursor-pointer w-full outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${className}`}
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
            <div className="relative w-12 h-12 rounded-[4px] overflow-hidden flex-shrink-0 bg-neutral-900 shadow-sm border border-white/5">
              <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} alt={nft.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              {rarity && (
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r ${getRarityColor(rarity)} h-1`}></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`text-[7px] font-medium uppercase tracking-tight line-clamp-2 whitespace-normal break-words ${isActive ? 'text-blue-500' : 'text-foreground'}`}>{nft.title}</h4>
                {rarity && (
                   <div className={`hidden sm:block w-1 h-1 rounded-full bg-gradient-to-r ${getRarityColor(rarity)}`}></div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 min-w-0 w-full flex-wrap">
                <div 
                  className="flex items-center gap-1 min-w-0 max-w-[120px] cursor-pointer hover:text-blue-500 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                    if (artist) navigate(`/artist/${artist.uid}`);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <MarqueeTitle text={nft.creator} className="text-[7px] font-semibold text-foreground/80 uppercase tracking-widest" />
                  </div>
                  {isVerified && (
                    <span title="Verified Creator" className="shrink-0">
                      <BadgeCheck className="w-2.5 h-2.5 text-blue-400 fill-current inline-block" />
                    </span>
                  )}
                </div>
                {collectionName && (
                  <span className="text-[6.5px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-0.5 shrink-0">
                    • <Layers className="w-1.5 h-1.5 inline" /> {collectionName}
                  </span>
                )}
                <span className={cn("text-[6px] px-1 py-0.5 rounded font-extrabold uppercase tracking-widest shrink-0 ml-1.5", supplyIndicator.className)}>
                  {supplyIndicator.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               {/* Mini Sparkline for Row layout */}
               <div className="hidden lg:block w-[100px] shrink-0 selection:bg-transparent">
                  <PriceSparkline basePrice={basePriceNum} history={nft.history} />
               </div>

               <div className="hidden md:flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[6px] font-bold text-muted-foreground uppercase tracking-widest">Price</span>
                  <div className="flex items-center gap-1">
                    {localCurrencyEnabled ? (
                      <span className="text-[12px] font-bold text-foreground tracking-tighter inline-block">
                        {convertPrice(nft.price)}
                      </span>
                    ) : (
                      <>
                        {currencyMode === 'USD' ? (
                          <span className="text-[12px] font-extrabold text-[#2BE08C]">$</span>
                        ) : (
                          <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
                        )}
                        <motion.span 
                          key={`${nft.price}-${currencyMode}`}
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="text-[12px] font-bold text-foreground tracking-tighter inline-block"
                        >
                          {formattedPrice}
                        </motion.span>
                      </>
                    )}

                    {/* Price Change Indicator */}
                    {nft.floorPriceChange !== undefined && (
                      <div className={cn(
                        "flex items-center gap-0.5 px-1 rounded-[2px]",
                        nft.floorPriceChange >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-rose-500 bg-rose-500/10"
                      )}>
                        {nft.floorPriceChange >= 0 ? (
                          <ArrowUp className="w-1.5 h-1.5 fill-current" />
                        ) : (
                          <ArrowDown className="w-1.5 h-1.5 fill-current" />
                        )}
                        <span className="text-[6px] font-black">{Math.abs(nft.floorPriceChange).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                    <motion.button 
                      onClick={handleActionClick}
                      disabled={!isOwner && isAuctionEnded}
                      animate={(!isOwner && !isAuctionEnded && isEndingSoon) ? {
                        scale: [1, 1.06, 1],
                        boxShadow: [
                          "0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 0 0 0px rgba(239, 68, 68, 0.4)",
                          "0 10px 15px -3px rgba(239, 68, 68, 0.5), 0 0 0 6px rgba(239, 68, 68, 0)",
                          "0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 0 0 0px rgba(239, 68, 68, 0.4)"
                        ]
                      } : {}}
                      transition={(!isOwner && !isAuctionEnded && isEndingSoon) ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                      className={cn(
                        "cursor-pointer transition-all rounded-full hover:scale-105 active:scale-95 px-4 py-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.1em]",
                        isOwner 
                          ? 'bg-muted text-foreground' 
                          : (isAuctionEnded 
                              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                              : (isEndingSoon 
                                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' 
                                  : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/20'))
                      )}
                    >
                      {isOwner ? (nft.listingType ? <Settings className="w-3 h-3" /> : 'SELL') : (nft.listingType === 'auction' ? (isAuctionEnded ? 'ENDED' : 'BID') : 'BUY')}
                    </motion.button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                      title="Share NFT"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handlePreviewToggle}
                      className={cn(
                        "p-2 rounded-full transition-all active:scale-95 select-none",
                        isPlayingPreview 
                          ? "bg-[#2BE08C]/20 text-[#2BE08C]" 
                          : "text-[#5B6BFF] hover:text-[#5B6BFF] hover:bg-[#5B6BFF]/10"
                      )}
                      title={isPlayingPreview ? `Previewing: ${previewSeconds}s` : "Play 30s Audio Preview"}
                    >
                      {isPlayingPreview ? (
                        <span className="flex gap-[1.5px] items-end h-3.5 pt-0.5 w-4 justify-center">
                          <span className="w-[1.5px] bg-[#2BE08C] animate-bounce h-3" style={{ animationDelay: '0.1s' }} />
                          <span className="w-[1.5px] bg-[#2BE08C] animate-bounce h-2" style={{ animationDelay: '0.3s' }} />
                          <span className="w-[1.5px] bg-[#2BE08C] animate-bounce h-2.5" style={{ animationDelay: '0.2s' }} />
                        </span>
                      ) : (
                        <Play className="h-4 w-4 fill-current text-blue-400" />
                      )}
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
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
              y: -4, 
              scale: 1.02, 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ width: cardTokens.nftTrack.width }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "group relative cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 bg-transparent transition-all duration-300 flex flex-col overflow-hidden w-[155px] shrink-0",
              className
            )}
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
            {/* Image Container - 1:1 Aspect Ratio with NFT Gradient Border */}
            <div 
              className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-neutral-950/40 transition-all flex-shrink-0"
            >
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
              <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start z-10 pointer-events-none">
                 <div className="flex flex-col gap-1">
                    <span className={cn("px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] font-bold uppercase tracking-[0.1em] text-white shadow-lg flex items-center gap-0.5", supplyIndicator.className)}>
                      {supplyIndicator.icon === 'Star' && <Star className="w-2 h-2 fill-current text-yellow-400 animate-spin-slow" />}
                      {supplyIndicator.icon === 'Gem' && <Gem className="w-2 h-2" />}
                      {supplyIndicator.label}
                    </span>
                    {nft.listingType === 'auction' && (
                      <AuctionCountdownTimer nft={nft} variant="badge" />
                    )}
                 </div>
                 
                 <div className="flex gap-1 pointer-events-auto items-center">
                    <button
                      onClick={handleShare}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white transition-all active:scale-95"
                      title="Share NFT"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <MoreOptionsButton />
                  </div>
              </div>

              {/* Action Overlay */}
              <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${isActive || isPlayingPreview ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex flex-col justify-center items-center gap-2`}>
                 {/* Dedicated 30s Preview Toggle in the overlay center */}
                 <button
                   onClick={handlePreviewToggle}
                   className={cn(
                     "py-1 px-2.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 select-none cursor-pointer border-none",
                     isPlayingPreview 
                       ? "bg-[#2BE08C] text-black shadow-lg shadow-[#2BE08C]/30 animate-pulse" 
                       : "bg-[#5B6BFF] text-white hover:bg-[#5B6BFF]/90 shadow-lg shadow-[#5B6BFF]/20"
                   )}
                 >
                   {isPlayingPreview ? (
                     <>
                       <span className="flex gap-[1px] items-end h-2 pt-0.5">
                         <span className="w-[1px] bg-black animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                         <span className="w-[1px] bg-black animate-bounce h-1" style={{ animationDelay: '0.3s' }} />
                         <span className="w-[1px] bg-black animate-bounce h-1.5" style={{ animationDelay: '0.2s' }} />
                       </span>
                       <span>{previewSeconds}s</span>
                     </>
                   ) : (
                     <>
                       <Play className="w-2.5 h-2.5 fill-current" />
                       <span>30s Preview</span>
                     </>
                   )}
                 </button>

                 <div className="flex gap-3 mt-1">
                    <button 
                      onClick={handlePlayClick} 
                      className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg border-none"
                      title="Play Full Track"
                    >
                      {isActive && isPlaying ? <Pause className="h-3.5 w-3.5 fill-current animate-pulse" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIs3DModalOpen(true);
                      }} 
                      className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg border-none"
                      title="View 3D Artwork"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                 </div>
              </div>

              {/* Interactive Waveform Visualizer for preview scrubbing */}
              {associatedTrack && (
                <motion.div
                  initial={{ y: 32, opacity: 0 }}
                  animate={{ y: (isActive || isHovered) ? 0 : 32, opacity: (isActive || isHovered) ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute bottom-1 left-1 right-1 h-8 bg-zinc-950/90 backdrop-blur-md rounded-lg flex items-center px-2 py-1 gap-1.5 z-20 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={handlePlayClick} 
                    className="w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow shrink-0"
                  >
                    {isActive && isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
                  </button>
                  <div 
                    className="flex-1 h-5 flex items-end gap-[1.5px] cursor-pointer group/wave pt-1"
                    onClick={handleWaveformClick}
                  >
                    {bars.map((barHeight, idx) => {
                      const barPercent = (idx / bars.length) * 100;
                      const isPlayed = isActive && progress >= barPercent;
                      return (
                        <div 
                          key={idx}
                          style={{ height: `${barHeight}%` }}
                          className={cn(
                            "flex-1 rounded-t-[1px] transition-all duration-200",
                            isPlayed 
                              ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                              : "bg-zinc-600/60 group-hover/wave:bg-zinc-500/80"
                          )}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
      
            {/* Artifact Data Details Section Under Cover Photo */}
            <div className="flex-1 flex flex-col pt-3 pb-1 select-none items-center text-center">
               {/* Title */}
               <h3 className={cn(
                 "text-[13px] font-bold tracking-normal leading-normal text-center text-white/95 truncate w-full max-w-full px-1 mb-1 transition-colors",
                 isActive ? 'text-blue-400' : 'text-white'
               )}>
                 {nft.title}
               </h3>

               {/* Price with centered triangle token icon */}
               <div className="flex items-center justify-center gap-1.5 text-[#9AA0AE]">
                  {/* Minimalist Downward Triangle Outline Icon (▽) to exactly match the uploaded user image */}
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    className="w-3.5 h-3.5 opacity-70 text-[#9AA0AE] select-none shrink-0"
                  >
                    <polygon points="12,21 3,5 21,5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <motion.span 
                    key={`${nft.price}-${currencyMode}`}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-[11px] font-bold text-[#9AA0AE] font-mono tracking-tight"
                  >
                    {formattedPrice}
                  </motion.span>
               </div>
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContentRefined />
      </ContextMenu>

      <NFTQuickViewModal 
        nft={nft} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />

      <NFTTransactionHistoryModal
        nft={nft}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
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
          onHistory={() => setIsHistoryModalOpen(true)}
          onAddToFolder={() => setIsAddToFolderModalOpen(true)}
          onShare={() => setIsShareModalOpen(true)}
        />
      )}

      {isShareModalOpen && (
        <ShareNFTDialog
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          nft={nft}
        />
      )}

      {isAddToFolderModalOpen && (
        <AddToNFTFolderModal
          nft={nft}
          isOpen={isAddToFolderModalOpen}
          onClose={() => setIsAddToFolderModalOpen(false)}
          onCreateNew={() => setIsCreateFolderModalOpen(true)}
        />
      )}

      {isCreateFolderModalOpen && (
        <NFTFolderModal
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
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

      {is3DModalOpen && (
        <NFT3DViewerModal
          nft={nft}
          isOpen={is3DModalOpen}
          onClose={() => setIs3DModalOpen(false)}
        />
      )}
      {isBidModalOpen && (
        <BidModal
          nft={nft}
          onClose={() => setIsBidModalOpen(false)}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmPurchaseOpen}
        onClose={() => setIsConfirmPurchaseOpen(false)}
        onConfirm={executeDirectPurchase}
        title="Confirm NFT Purchase"
        description="Verify transaction parameters before broadcasting payment to the TON blockchain relay."
        confirmText="Confirm & Purchase"
        assetName={nft.title}
        assetImage={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
        tonAmount={nft.price}
        networkFee="0.05"
        totalAmount={(parseFloat(nft.price?.replace(' TON', '') || "0") + 0.05).toFixed(2)}
        fromAddress={userProfile.walletAddress}
        recipient={nft.owner}
        transactionType="NFT Acquisition"
      />
    </>
  );
};

export default NFTCard;

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

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
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
        if (
          err?.name === "AbortError" ||
          err?.name === "NotAllowedError" ||
          err?.message?.includes("interrupted")
        ) {
          stopPreview();
          return;
        }
        console.error("Audio preview failed:", err);
        addNotification("Preview playback failed", "error");
        stopPreview();
      });
    }

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
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3.5 p-1.5 rounded-lg group bg-transparent transition-colors cursor-pointer w-full select-none ${className}`}
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
            <div 
              className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-neutral-900 shadow-sm"
              onClick={(e) => { e.stopPropagation(); handlePreviewToggle(e); }}
            >
              <img 
                src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                alt={nft.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(`nft-${nft.id}`); }}
              />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity ${isActive || isPlayingPreview ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isPlayingPreview || (isActive && isPlaying) ? (
                  <Pause className="h-4 w-4 fill-current text-blue-400" />
                ) : (
                  <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`text-[13px] font-medium leading-tight truncate ${isActive ? 'text-blue-400 font-semibold' : 'text-white/95'}`}>
                {nft.title}
              </h4>
              <p 
                className="text-[11px] text-zinc-400 truncate mt-0.5 hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                  if (artist) navigate(`/artist/${artist.uid}`);
                }}
              >
                {nft.creator}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[12px] font-medium text-white/80 font-mono">
                <img src={TON_LOGO} className="w-3 h-3 opacity-80" alt="TON" />
                <span>{formattedPrice} TON</span>
              </div>
              <motion.button 
                onClick={handleActionClick}
                disabled={!isOwner && isAuctionEnded}
                className={cn(
                  "cursor-pointer transition-all rounded-full hover:scale-105 active:scale-95 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white",
                  isOwner 
                    ? 'bg-white/10 text-white' 
                    : (isAuctionEnded ? 'bg-white/5 text-white/20' : 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20')
                )}
              >
                {isOwner ? (nft.listingType ? 'Manage' : 'Sell') : (nft.listingType === 'auction' ? (isAuctionEnded ? 'Ended' : 'Bid') : 'Buy')}
              </motion.button>
              <MoreOptionsButton />
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative cursor-pointer p-0 bg-transparent transition-all duration-200 flex flex-col w-[155px] shrink-0 select-none",
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
            {/* Artwork - 1:1 Square with Spotify-style Floating Action Button */}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900/60 shadow-md">
              <img
                src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={nft.title}
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(`nft-${nft.id}`); }}
              />

              {/* Floating Play / Preview Action Button */}
              <div className={cn(
                "absolute bottom-2 right-2 transition-all duration-200",
                (isActive || isPlayingPreview)
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0"
              )}>
                <button 
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all"
                  onClick={handlePreviewToggle}
                  aria-label={isPlayingPreview || (isActive && isPlaying) ? "Pause" : "Play preview"}
                >
                  {isPlayingPreview || (isActive && isPlaying) ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Clean NFT Meta */}
            <div className="flex flex-col w-full min-w-0 mt-2.5">
              <h3 className={cn(
                "text-[13px] font-semibold tracking-tight truncate w-full transition-colors",
                isActive ? 'text-blue-400' : 'text-white/95 group-hover:text-white'
              )}>
                {nft.title}
              </h3>
              
              <p 
                className="text-[11px] font-normal text-zinc-400 truncate w-full mt-0.5 hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                  if (artist) navigate(`/artist/${artist.uid}`);
                }}
              >
                {nft.creator}
              </p>

              {/* Price Row */}
              <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-white/70 font-mono">
                <img src={TON_LOGO} className="w-3 h-3 opacity-75 shrink-0" alt="TON" />
                <span>{formattedPrice} TON</span>
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

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Eye, Send, Star, Clock, User, Share2, Info, Gem, Trash2, ArrowUp, ArrowDown, ExternalLink, ListMusic, Plus, LayoutGrid, Settings, Wallet, Tag, BadgeCheck, Layers, History, RotateCw, Bell, Zap } from 'lucide-react';
import { AnimatedHeart } from '@/components/common/AnimatedHeart';
import { NFTItem } from '@/types';
import { useGramPrice } from '@/contexts/GramPriceContext';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';
import { cn, getPlaceholderImage, shareContent } from '@/lib/utils';
import { normalizePlayableAudioUrl } from '@/utils/audioSource';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import NFTQuickViewModal from './NFTQuickViewModal';
import NFT3DViewerModal from './NFT3DViewerModal';
import { NFTTransactionHistoryModal } from './NFTTransactionHistoryModal';
import { PriceSparkline } from './PriceSparkline';
import SendNFTModal from './SendNFTModal';
import SellNFTModal from './SellNFTModal';
import PriceAlertModal from './PriceAlertModal';
import SkeletonCard from './SkeletonCard';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import ConfirmationModal from './ConfirmationModal';
import NFTPurchaseConfirmationDialog from './NFTPurchaseConfirmationDialog';
import QuickBuyNFTModal from './QuickBuyNFTModal';
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
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cardTokens } from '@/design';
import MediaCard from '@/components/common/MediaCard';


export interface NFTCardProps {
  nft: NFTItem;
  variant?: 'default' | 'row';
  onAction?: (nft: NFTItem) => void;
  isLoading?: boolean;
  className?: string;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (nft: NFTItem) => void;
  currencyMode?: 'TON' | 'USD';
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, variant = 'default', onAction, isLoading = false, className = '', isSelectedForCompare = false, onToggleCompare, currencyMode = 'TON' }) => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const { convertPrice, localCurrencyEnabled } = useGramPrice();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { playTrack, currentTrack, isPlaying, togglePlay, setOptionsTrack, userProfile, setAnthem, addNotification, collections, seek, progress, artists, allTracks, likedTrackIds = [], toggleLikeTrack } = useAudio();

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const matched = artists?.find(a => 
      a.name.toLowerCase() === nft.creator?.toLowerCase() || 
      a.uid?.toLowerCase() === nft.creator?.toLowerCase()
    );
    const targetId = matched?.uid || nft.artistId || nft.creator?.toLowerCase().replace(/\s+/g, '-');
    if (targetId) {
      navigate(`/artist/${targetId}`);
    }
  };

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
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);

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

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isRowImageLoaded, setIsRowImageLoaded] = useState(false);

  const associatedTrack = allTracks?.find(t => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const targetFavId = nft.trackId || nft.id;
  const isFavourited = likedTrackIds.includes(targetFavId);
  const isOwner = Boolean(userProfile?.walletAddress && nft.owner && nft.owner === userProfile.walletAddress);
  const isAnthem = userProfile.anthemId === nft.id;

  const nftCollection = collections?.find(c => c.nftIds?.includes(nft.id));
  const traitCollection = nft.traits?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string ||
                          nft.attributes?.find(t => t.trait_type.toLowerCase() === 'collection' || t.trait_type.toLowerCase() === 'series')?.value as string;
  const collectionName = nftCollection?.name || traitCollection || (nft.title.includes(':') ? nft.title.split(':')[0] : null);

  const artist = artists?.find(a => a.name.toLowerCase() === nft.creator?.toLowerCase() || a.name.toLowerCase() === nft.artist?.toLowerCase());
  const isVerified = nft.artistVerified || artist?.verified || artist?.isVerifiedArtist;
  
  const isAuctionEnded = React.useMemo(() => {
    if (nft.listingType !== 'auction' || !nft.auctionEndTime) return false;
    return new Date(nft.auctionEndTime).getTime() <= Date.now();
  }, [nft.listingType, nft.auctionEndTime]);

  if (isLoading) {
    return <SkeletonCard variant={variant} className={className} />;
  }

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
    if ((window as any).__activeNFTPreviewStop) {
      try {
        (window as any).__activeNFTPreviewStop();
      } catch (err) {
        console.error("Error stopping previous preview:", err);
      }
    }

    // Pause primary audio if playing
    if (isPlaying) {
      togglePlay().catch((err) => console.error("Error pausing main audio:", err));
    }

    const rawAudioUrl = nft.audioUrl || nft.audioIpfsUrl || associatedTrack?.audioUrl || "";
    const audioUrl = normalizePlayableAudioUrl(rawAudioUrl);
    if (!audioUrl) {
      addNotification("No audio preview available for this NFT", "info");
      return;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onerror = () => {
      stopPreview();
    };

    // Register active preview stop callback globally
    (window as any)._activePreviewStop = stopPreview;
    (window as any).__activeNFTPreviewStop = stopPreview;

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
        console.warn("Audio preview failed:", err?.message || err);
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
      navigate(`/nft/${nft.id}`);
    } else if (!isAuctionEnded) {
      // BUY / COLLECT flow - trigger confirmation modal first to prevent accidental purchase
      if (!tonConnectUI.connected) {
        toast.warning('Please connect your TON wallet to purchase this NFT');
        addNotification('Please connect your wallet first', 'error');
        tonConnectUI.openModal();
        return;
      }
      setIsConfirmPurchaseOpen(true);
    }
  };

  const executeDirectPurchase = async () => {
    setIsConfirmPurchaseOpen(false);
    const toastId = toast.loading(`Purchasing "${nft.title}"...`, {
      description: "Please confirm in your TON wallet..."
    });

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
      
      toast.success(`Successfully purchased "${nft.title}"!`, {
        id: toastId,
        description: `Acquired for ${nft.price} TON. Added to your collection.`
      });
      addNotification('Purchase successful!', 'success');
    } catch (err: any) {
      console.error('Purchase failed', err);
      const msg = err?.message || 'Transaction was canceled or could not be verified on TON.';
      toast.error(`Purchase failed: ${msg}`, { id: toastId });
      addNotification('Purchase failed or rejected', 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAction) {
      onAction(nft);
    } else {
      navigate(`/nft/${nft.id}`);
    }
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
      {!isOwner && !isAuctionEnded && nft.listingType !== 'auction' && (
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-[#229ED9] focus:text-white transition-colors">
          <Zap className="h-4 w-4 text-[#229ED9]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#229ED9]">Quick Buy</span>
        </DropdownMenuItem>
      )}
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
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsPriceAlertOpen(true); }} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Bell className="h-4 w-4 text-cyan-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Price Alert</span>
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
      <DropdownMenuItem onClick={handleArtistClick} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <User className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">View Artist</span>
      </DropdownMenuItem>
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
    <ContextMenuContent className="bg-[#121824] border-0 text-white min-w-[200px] p-1 rounded-xl shadow-2xl">
      <ContextMenuLabel className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50 py-2.5 px-3">NFT Options</ContextMenuLabel>
      <ContextMenuSeparator className="bg-white/10" />
      <ContextMenuItem onClick={handlePlayClick} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#0088CC] rounded-[5px]">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-semibold uppercase tracking-wider">Play Track</span>
      </ContextMenuItem>
      {!isOwner && !isAuctionEnded && nft.listingType !== 'auction' && (
        <ContextMenuItem onClick={(e) => { e.stopPropagation(); setIsQuickBuyOpen(true); }} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#229ED9] rounded-[5px] text-[#229ED9] font-bold">
          <Zap className="h-4 w-4 fill-current" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Quick Buy</span>
        </ContextMenuItem>
      )}
      <ContextMenuItem onClick={handleArtistClick} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#0088CC] rounded-[5px]">
        <User className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">View Artist</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={handleQuickViewClick} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#0088CC] rounded-[5px]">
        <Eye className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Quick View</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setIs3DModalOpen(true)} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#0088CC] rounded-[5px]">
        <RotateCw className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">3D Holographic Stage</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={handleHistoryClick} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#0088CC] rounded-[5px]">
        <History className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Ledger History</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setIsPriceAlertOpen(true)} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#0088CC] rounded-[5px]">
        <Bell className="h-4 w-4 text-cyan-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Price Alert</span>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-white/10" />
      <ContextMenuItem onClick={handleShare} className="flex items-center gap-2.5 py-2 px-3 cursor-pointer focus:bg-[#0088CC] rounded-[5px]">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Share NFT</span>
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
        className: 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white font-extrabold uppercase',
        icon: 'Star'
      };
    }
    
    if (supply <= 10) {
      return {
        label: `LIMIT: ${supply} (ULTRA)`,
        className: 'bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold uppercase',
        icon: 'Gem'
      };
    }

    if (supply <= 100) {
      return {
        label: `LIMIT: ${supply}`,
        className: 'bg-[#182032]/90 text-amber-400 font-bold uppercase',
        icon: 'Sparkles'
      };
    }

    return {
      label: `QTY: ${supply}`,
      className: 'bg-black/60 text-zinc-300 font-medium uppercase',
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
            className={`flex items-center gap-3 p-2 rounded-[var(--tj-radius-compact,5px)] border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-border-strong)] group bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] transition-colors cursor-pointer w-full select-none ${className}`}
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
              className="relative w-12 h-12 rounded-[var(--tj-radius-compact,5px)] overflow-hidden flex-shrink-0 bg-[var(--tj-color-bg-secondary,#0B1424)] border border-[var(--tj-color-border-subtle)]"
              onClick={(e) => { e.stopPropagation(); handlePreviewToggle(e); }}
            >
              {!isRowImageLoaded && (
                <div className="absolute inset-0 bg-neutral-800/80 overflow-hidden flex items-center justify-center z-0">
                  <div className="absolute inset-0 animate-shimmer-fast" />
                  <img src={TON_LOGO} alt="TON" className="w-4 h-4 opacity-20" />
                </div>
              )}
              <LazyArtworkImage 
                src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
                alt={nft.title} 
                onLoad={() => setIsRowImageLoaded(true)}
                fadeIn={false}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-300 group-hover:scale-103",
                  isRowImageLoaded ? "opacity-100" : "opacity-0"
                )} 
                onError={() => { 
                  setIsRowImageLoaded(true);
                }}
              />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${isActive || isPlayingPreview ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isPlayingPreview || (isActive && isPlaying) ? (
                  <Pause className="h-4 w-4 fill-current text-[var(--tj-color-brand-primary,#229ED9)]" />
                ) : (
                  <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`text-xs font-medium leading-tight truncate ${isActive ? 'text-[var(--tj-color-brand-primary,#229ED9)] font-semibold' : 'text-[var(--tj-color-text-primary,#F8FAFC)]'}`}>
                {nft.title}
              </h4>
              <p 
                className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate mt-0.5 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                onClick={handleArtistClick}
              >
                <span className="truncate">{nft.creator}</span>
                <VerifiedBadge user={artist} size="sm" />
                {collectionName && (
                  <span className="text-[10px] text-[var(--tj-color-text-muted,#7F91AA)] truncate">
                    · {collectionName}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--tj-color-text-primary,#F8FAFC)] font-mono">
                <img src={TON_LOGO} className="w-3 h-3 opacity-80" alt="TON" />
                <span>{formattedPrice} TON</span>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/nft/${nft.id}`);
                }}
                disabled={!isOwner && isAuctionEnded}
                aria-label={isOwner ? `Owned by you: ${nft.title}` : (nft.listingType === 'auction' ? (isAuctionEnded ? 'Auction ended' : `Place bid on ${nft.title}`) : `Buy ${nft.title} for ${formattedPrice} TON`)}
                className={cn(
                  "cursor-pointer transition-colors rounded-[var(--tj-radius-compact,5px)] min-h-[34px] px-3 py-1 text-xs font-semibold text-white border focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tj-color-border-focus,#00B4D8)]",
                  isOwner 
                    ? 'bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#A8B7CC)] border-[var(--tj-color-border-subtle)]' 
                    : (isAuctionEnded ? 'bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-disabled,#64748B)] border-[var(--tj-color-border-subtle)] cursor-not-allowed' : 'bg-[var(--tj-color-brand-primary,#229ED9)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] border-[var(--tj-color-brand-primary,#229ED9)]')
                )}
              >
                {isOwner ? 'Owned' : (nft.listingType === 'auction' ? (isAuctionEnded ? 'Sold' : 'Bid') : 'Buy')}
              </button>
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
        <MediaCard
          type="nft"
          isActive={isActive}
          className={cn(
            "snap-start border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-border-strong)] bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)]",
            className
          )}
          style={{
            ['--card-radius' as any]: 'var(--tj-radius-compact, 5px)',
            ['--card-image-radius' as any]: 'var(--tj-radius-compact, 5px)',
            ['--card-action-radius' as any]: 'var(--tj-radius-compact, 5px)',
          }}
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
          artwork={
            <>
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-[var(--tj-color-bg-secondary,#0B1424)] overflow-hidden flex flex-col items-center justify-center z-0 select-none">
                  <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                  <div className="flex flex-col items-center gap-1 opacity-25">
                    <img src={TON_LOGO} alt="TON" className="w-5 h-5" />
                    <span className="text-[8px] font-mono font-medium tracking-wider text-[var(--tj-color-brand-primary,#229ED9)] uppercase">SYNC</span>
                  </div>
                </div>
              )}
              <LazyArtworkImage
                src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
                fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
                onLoad={() => setIsImageLoaded(true)}
                fadeIn={false}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-300 group-hover:scale-103",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                alt={nft.title}
                onError={() => { 
                  setIsImageLoaded(true);
                }}
              />

              {/* Top Right: Favourite Toggle */}
              {toggleLikeTrack && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLikeTrack(targetFavId);
                  }}
                  aria-label={isFavourited ? `Remove ${nft.title} from favourites` : `Add ${nft.title} to favourites`}
                  className={cn(
                    "absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-[var(--tj-radius-compact,5px)] flex items-center justify-center border transition-colors cursor-pointer bg-[var(--tj-color-surface-overlay,#07182BCC)]",
                    isFavourited
                      ? "border-[var(--tj-color-state-danger,#F87171)] text-[var(--tj-color-state-danger,#F87171)]"
                      : "border-[var(--tj-color-border-subtle)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white hover:border-[var(--tj-color-border-strong)]"
                  )}
                >
                  <AnimatedHeart liked={Boolean(isFavourited)} className={cn("w-3.5 h-3.5", isFavourited && "fill-current")} />
                </button>
              )}

              {/* Floating Play / Preview Action Button */}
              <div className={cn(
                "absolute bottom-1.5 right-1.5 transition-all duration-200",
                (isActive || isPlayingPreview)
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              )}>
                <button 
                  type="button"
                  className="w-8 h-8 rounded-[var(--tj-radius-compact,5px)] bg-[var(--tj-color-brand-primary,#229ED9)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer border border-[var(--tj-color-border-strong)]"
                  onClick={handlePreviewToggle}
                  aria-label={isPlayingPreview || (isActive && isPlaying) ? `Pause preview for ${nft.title}` : `Play preview for ${nft.title}`}
                >
                  {isPlayingPreview || (isActive && isPlaying) ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </>
          }
          title={nft.title}
          subtitle={
            <div className="space-y-0.5 min-w-0">
              <span onClick={handleArtistClick} className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 max-w-full truncate">
                <span className="truncate">{nft.creator}</span>
                <VerifiedBadge user={artist} size="sm" />
              </span>
              {collectionName && (
                <span className="block text-[10px] text-[var(--tj-color-text-muted,#7F91AA)] truncate">
                  {collectionName}
                </span>
              )}
            </div>
          }
          meta={
            <div className="flex items-center justify-between gap-1.5 text-[12px] leading-[17px] font-medium font-mono">
              <div className="flex items-center gap-1 text-[var(--tj-color-text-primary,#F8FAFC)] min-w-0">
                <img src={TON_LOGO} className="w-3 h-3 opacity-80 shrink-0" alt="TON" />
                <span className="truncate">{formattedPrice} TON</span>
              </div>
              {nft.listingType && (
                <span className="text-[9px] font-sans font-medium text-[var(--tj-color-text-secondary,#A8B7CC)] shrink-0">
                  {isAuctionEnded ? 'Ended' : nft.listingType === 'auction' ? 'Auction' : 'Listed'}
                </span>
              )}
            </div>
          }
          action={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/nft/${nft.id}`);
              }}
              disabled={!isOwner && isAuctionEnded}
              aria-label={
                isOwner
                  ? `Owned by you: ${nft.title}`
                  : isAuctionEnded
                  ? `Sold out: ${nft.title}`
                  : nft.listingType === 'auction'
                  ? `Place bid on ${nft.title}`
                  : `Buy ${nft.title} for ${formattedPrice} TON`
              }
              style={{
                height: 'var(--card-action-height, 34px)',
                borderRadius: 'var(--tj-radius-compact, 5px)',
              }}
              className={cn(
                "w-full h-[34px] py-1 px-3 rounded-[var(--tj-radius-compact,5px)] text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-1.5 text-center cursor-pointer border select-none",
                isOwner
                  ? "bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#A8B7CC)] border-[var(--tj-color-border-subtle)]"
                  : isAuctionEnded
                  ? "bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-disabled,#64748B)] border-[var(--tj-color-border-subtle)] cursor-not-allowed"
                  : "bg-[var(--tj-color-brand-primary,#229ED9)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] border-[var(--tj-color-brand-primary,#229ED9)] text-white"
              )}
            >
              {isOwner ? (
                "Owned"
              ) : isAuctionEnded ? (
                "Sold"
              ) : nft.listingType === 'auction' ? (
                "Bid"
              ) : (
                "Buy"
              )}
            </button>
          }
        />
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

      <NFTPurchaseConfirmationDialog
        isOpen={isConfirmPurchaseOpen}
        onClose={() => setIsConfirmPurchaseOpen(false)}
        onConfirm={executeDirectPurchase}
        title="Confirm Purchase"
        description="Verify NFT price, 5% platform fee, and network fee before signing in your TON wallet."
        confirmText="Confirm Purchase"
        nft={nft}
        networkFee="0.05"
        platformFeePercentage={0.05}
        userWalletAddress={userProfile.walletAddress}
        recipientAddress={nft.owner}
        isProcessing={isPurchasing}
      />

      {isPriceAlertOpen && (
        <PriceAlertModal
          nft={nft}
          isOpen={isPriceAlertOpen}
          onClose={() => setIsPriceAlertOpen(false)}
        />
      )}

      {/* Compact Centered Quick Buy Modal */}
      <QuickBuyNFTModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
        nft={nft as any}
      />
    </>
  );
};

export default NFTCard;

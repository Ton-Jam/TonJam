import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Play, Pause, BadgeCheck, Disc, Wallet, Eye, RotateCw, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { MOCK_TRACKS, MOCK_ARTISTS } from "@/constants";
import { cn, shareContent } from "@/lib/utils";
import { MarqueeTitle } from "../MarqueeTitle";
import { AuctionCountdownTimer } from "../AuctionCountdownTimer";
import { NFT3DViewerModal } from "../NFT3DViewerModal";
import { useGramPrice } from "@/contexts/GramPriceContext";

interface MarketplaceNFTCardProps {
  nft: {
    id: string;
    trackId: string;
    title: string;
    creator: string;
    price: string;
    imageUrl: string;
    artistVerified?: boolean;
    edition?: string;
    listingType?: 'fixed' | 'auction';
    auctionEndTime?: string;
    traits?: any[];
    attributes?: any[];
    audioUrl?: string;
  };
  className?: string;
}

export const MarketplaceNFTCard: React.FC<MarketplaceNFTCardProps> = ({
  nft,
  className,
}) => {
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const { playTrack, currentTrack, isPlaying, togglePlay, addNotification } = useAudio();
  const { convertPrice } = useGramPrice();

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewSeconds, setPreviewSeconds] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

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

    // Stop any other previews globally
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

  const associatedTrack = MOCK_TRACKS.find((t) => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const isCurrentlyPlaying = isActive && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedTrack) {
      playTrack(associatedTrack);
    } else {
      addNotification("No preview track available for this asset", "error");
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#/nft/${nft.id}`;
    const result = await shareContent({
      title: `NFT: ${nft.title} by ${nft.creator}`,
      text: `Check out this NFT on TonJam: ${nft.title}`,
      url: shareUrl,
    });

    if (result.success) {
      addNotification(result.method === 'clipboard' ? 'Link copied to clipboard!' : 'Shared!', 'success');
    } else {
      addNotification("Could not share content", "error");
    }
  };

  const handleMintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addNotification(`Minting process started for ${nft.title}!`, "success");
    navigate(`/nft/${nft.id}`);
  };

  const handleCardClick = () => {
    navigate(`/nft/${nft.id}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ 
          y: -6, 
          scale: 1.03,
          boxShadow: "0 0 25px rgba(91, 107, 255, 0.35), 0 0 12px rgba(0, 180, 216, 0.15)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={handleCardClick}
        className={cn(
          "cursor-pointer group relative flex flex-col bg-[#0A113A] rounded-2xl overflow-hidden border border-white/[0.04] hover:border-[#5B6BFF]/50 transition-all duration-300",
          className
        )}
      >
      {/* Artwork Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/40">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-neutral-900/90 overflow-hidden flex flex-col items-center justify-center z-0 select-none">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <div className="flex flex-col items-center gap-1 opacity-25 animate-blockchain-glow">
              <img src="/ton-logo.svg" onError={(e) => { e.currentTarget.style.display = 'none'; }} alt="TON" className="w-6 h-6 drop-shadow-sm" />
              <span className="text-[8px] font-mono font-bold tracking-widest text-cyan-400 uppercase">SYNCING</span>
            </div>
          </div>
        )}
        <img
          src={nft.imageUrl}
          alt={nft.title}
          referrerPolicy="no-referrer"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Hover overlay with detail look trigger */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handlePlayClick}
            className="p-3 bg-[#5B6BFF] hover:bg-[#5B6BFF]/90 text-white rounded-full transition-transform duration-200 transform hover:scale-110"
            title={isCurrentlyPlaying ? "Pause preview" : "Play preview"}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={handleMintClick}
            className="p-3 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white rounded-full transition-transform duration-200 transform hover:scale-110"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIs3DModalOpen(true);
            }}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-transform duration-200 transform hover:scale-110"
            title="3D Rotating Render"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleShareClick}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-transform duration-200 transform hover:scale-110"
            title="Share NFT"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Streaming status indicator tab */}
        {isCurrentlyPlaying && (
          <div className={cn(
            "absolute top-3 bg-[#2BE08C] text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 z-10",
            nft.listingType === 'auction' ? "right-3" : "left-3"
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Streaming
          </div>
        )}

        {/* Real-time Auction Countdown timer */}
        {nft.listingType === 'auction' && (
          <div className="absolute top-3 left-3 z-10">
            <AuctionCountdownTimer nft={nft as any} variant="badge" />
          </div>
        )}

        {/* Edition tracker watermark */}
        {nft.edition && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded z-10">
            {nft.edition}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-[13px] font-bold text-white uppercase tracking-tight line-clamp-1 mb-0.5 group-hover:text-[#5B6BFF] transition-colors">
          {nft.title}
        </h3>

        {/* Artist Line with Verified Tag */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            const artist = MOCK_ARTISTS.find(a => a.name.toLowerCase() === nft.creator.toLowerCase());
            if (artist) {
              navigate(`/artist/${artist.uid}`);
            }
          }}
          className="flex items-center gap-1 mb-3 min-w-0 w-full cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex-1 min-w-0">
            <MarqueeTitle text={nft.creator} className="text-[10px] text-[#9AA0AE] font-semibold tracking-wider uppercase" />
          </div>
          <BadgeCheck className="w-3.5 h-3.5 text-[#5B6BFF] fill-current shrink-0" />
        </div>

        {/* 30s Audio Preview Button */}
        <button
          onClick={handlePreviewToggle}
          className={cn(
            "w-full py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 mb-3 select-none",
            isPlayingPreview 
              ? "bg-[#2BE08C]/20 text-[#2BE08C] hover:bg-[#2BE08C]/35" 
              : "bg-[#5B6BFF]/10 text-[#5B6BFF] hover:bg-[#5B6BFF]/20"
          )}
        >
          {isPlayingPreview ? (
            <>
              <span className="flex gap-[2px] items-end h-3">
                <span className="w-[1.5px] bg-[#2BE08C] animate-bounce h-3" style={{ animationDelay: '0.1s' }} />
                <span className="w-[1.5px] bg-[#2BE08C] animate-bounce h-2" style={{ animationDelay: '0.3s' }} />
                <span className="w-[1.5px] bg-[#2BE08C] animate-bounce h-2.5" style={{ animationDelay: '0.2s' }} />
              </span>
              <span>Playing Preview ({previewSeconds}s)</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Audio Preview (30s)</span>
            </>
          )}
        </button>

        {/* Floor Pricing & Quick Controls Grid */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/[0.04]">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-[#9AA0AE] font-semibold">
              Floor Price
            </span>
            <span className="text-xs font-black text-[#00B4D8] flex items-center gap-0.5">
              {convertPrice(nft.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Stream trigger */}
            <button
              onClick={handlePlayClick}
              className={cn(
                "p-1.5 rounded-lg border transition-all duration-200",
                isCurrentlyPlaying
                  ? "bg-[#2BE08C]/15 border-[#2BE08C]/30 text-[#2BE08C]"
                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.08] text-[#9AA0AE]"
              )}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Disc className="w-3.5 h-3.5 animate-spin-slow" />
              )}
            </button>

            {/* Quick Mint trigger */}
            <button
              onClick={handleMintClick}
              className="px-2.5 py-1.5 bg-[#5B6BFF] hover:bg-[#5B6BFF]/90 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all"
            >
              <Wallet className="w-3 h-3" />
              Mint
            </button>
          </div>
        </div>
      </div>
    </motion.div>
    <NFT3DViewerModal
      nft={nft as any}
      isOpen={is3DModalOpen}
      onClose={() => setIs3DModalOpen(false)}
    />
    </>
  );
};

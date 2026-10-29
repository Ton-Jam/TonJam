import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  X,
  CheckCircle2,
  Wallet,
  ExternalLink,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { buyNFT } from '@/services/tonService';
import { useAudio } from '@/contexts/AudioContext';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useGramPrice } from '@/contexts/GramPriceContext';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface QuickBuyNFTData {
  id: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  price: string | number;
  imageUrl: string;
  edition?: string;
  genre?: string;
  badge?: string;
  audioUrl?: string;
  owner?: string;
  royaltySplits?: Array<{ address: string; percentage: number }>;
}

export interface QuickBuyNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: QuickBuyNFTData | null;
  onSuccess?: (nft: QuickBuyNFTData) => void;
}

export const QuickBuyNFTModal: React.FC<QuickBuyNFTModalProps> = ({
  isOpen,
  onClose,
  nft,
  onSuccess,
}) => {
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();
  const { addNotification, playTrack, allTracks } = useAudio();
  const { price: tonUsdPrice } = useTonPrice();
  const { fiatCurrency } = useGramPrice();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Reset modal state when opened/closed or NFT changes
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
      setErrorMessage(null);
      setIsPlayingAudio(false);
    } else {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
      setIsPlayingAudio(false);
    }
  }, [isOpen, nft?.id]);

  // Audio preview playback toggle
  const toggleAudioPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nft?.audioUrl) return;

    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = audioElement || new Audio(nft.audioUrl);
      audio.volume = 0.7;
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch((err) => console.warn('Preview playback failed:', err));
      setAudioElement(audio);
      setIsPlayingAudio(true);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  // Price calculations
  const numericPrice = useMemo(() => {
    if (!nft?.price) return 0;
    if (typeof nft.price === 'number') return nft.price;
    const cleaned = String(nft.price).replace(/,/g, '').replace(/ TON/gi, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, [nft?.price]);

  const networkFee = 0.05; // Standard TON gas fee estimate
  const totalPrice = numericPrice + networkFee;

  // Fiat rate calculation
  const fiatRates: Record<string, { rate: number; symbol: string }> = useMemo(
    () => ({
      USD: { rate: 1.0, symbol: '$' },
      EUR: { rate: 0.92, symbol: '€' },
      GBP: { rate: 0.78, symbol: '£' },
      RUB: { rate: 90.0, symbol: '₽' },
      AED: { rate: 3.67, symbol: 'AED ' },
    }),
    []
  );

  const activeFiat = fiatRates[fiatCurrency] || fiatRates.USD;
  const currentTonRate = tonUsdPrice || 5.3;

  const formatFiat = (tonAmt: number): string => {
    const val = tonAmt * currentTonRate * activeFiat.rate;
    return `${activeFiat.symbol}${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isWalletConnected = Boolean(tonConnectUI && tonConnectUI.connected);
  const userWalletAddress = tonConnectUI?.account?.address || '';

  const displayWalletAddress = useMemo(() => {
    if (!userWalletAddress) return '';
    return `${userWalletAddress.slice(0, 4)}...${userWalletAddress.slice(-4)}`;
  }, [userWalletAddress]);

  const handleConnectWallet = () => {
    if (tonConnectUI) {
      try {
        tonConnectUI.openModal();
      } catch (err) {
        console.warn('Failed to open TON Connect modal:', err);
      }
    }
  };

  const handleConfirmPurchase = async () => {
    if (!nft) return;

    if (!isWalletConnected) {
      handleConnectWallet();
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      addNotification(`Authorizing purchase of ${nft.title}...`, 'info');

      const ownerTarget = nft.owner || 'EQA...marketplace-custody';
      const formattedPriceStr = `${numericPrice} TON`;

      await buyNFT(
        tonConnectUI,
        ownerTarget,
        formattedPriceStr,
        nft.title,
        nft.royaltySplits || []
      );

      setIsSuccess(true);
      addNotification(`Successfully collected ${nft.title}!`, 'success');
      if (onSuccess) {
        onSuccess(nft);
      }
    } catch (err: any) {
      console.error('Quick Buy transaction error:', err);
      const msg = err?.message || 'Transaction was canceled or could not be completed on TON.';
      setErrorMessage(msg);
      addNotification('Purchase failed or canceled', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleListenNow = () => {
    if (!nft) return;
    const matched = allTracks?.find((t) => t.id === nft.id);
    if (matched) {
      playTrack(matched);
    } else {
      playTrack({
        id: nft.id,
        title: nft.title,
        artist: nft.artist,
        artwork: nft.imageUrl,
        coverUrl: nft.imageUrl,
        audioUrl: nft.audioUrl || 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3',
        duration: 180,
        isNFT: true,
        price: `${numericPrice} TON`,
      } as any);
    }
    onClose();
  };

  const handleGoToLibrary = () => {
    onClose();
    navigate('/library');
  };

  if (!isOpen || !nft) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-buy-title"
      >
        {/* Soft backdrop blur with zero border lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isProcessing && onClose()}
          className="fixed inset-0 bg-[#080D1A]/80 backdrop-blur-md"
        />

        {/* Compact Centered Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[400px] bg-[#0E1729] rounded-2xl shadow-2xl shadow-black/80 p-5 text-white z-10 overflow-hidden select-none border-none"
        >
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#229ED9]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#9B7CFF]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close Quick Buy dialog"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none z-20 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          {!isSuccess ? (
            <div className="space-y-4">
              {/* Header Title with Zap Icon */}
              <div className="flex items-center gap-2 pr-8">
                <div className="w-8 h-8 rounded-xl bg-[#229ED9]/15 flex items-center justify-center text-[#229ED9] shrink-0">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 id="quick-buy-title" className="text-base font-bold text-[#F8FAFC] leading-none">
                    Quick Buy
                  </h3>
                  <span className="text-[11px] text-[#A8B7CC] font-medium mt-0.5 block">
                    Confirm instant purchase on TON
                  </span>
                </div>
              </div>

              {/* Compact NFT Card Preview */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#142036] shadow-inner relative overflow-hidden">
                {/* Artwork Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#080D1A] shrink-0 shadow-md">
                  <img
                    src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
                    alt={nft.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderImage(nft.title);
                    }}
                    className="w-full h-full object-cover"
                  />
                  {nft.audioUrl && (
                    <button
                      type="button"
                      onClick={toggleAudioPreview}
                      aria-label={isPlayingAudio ? 'Stop audio preview' : 'Play audio preview'}
                      className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-opacity"
                    >
                      {isPlayingAudio ? (
                        <VolumeX className="w-4 h-4 text-[#229ED9]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#229ED9]">
                      {nft.badge || nft.edition || 'Music NFT'}
                    </span>
                    {isPlayingAudio && (
                      <span className="flex items-center gap-1 text-[9px] text-[#34D399] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                        Previewing
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white truncate mt-0.5">
                    {nft.title}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-[#A8B7CC] truncate mt-0.5">
                    <span className="truncate">{nft.artist}</span>
                    {nft.artistVerified !== false && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-3.5 rounded-xl bg-[#121C30] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#A8B7CC]">
                  <span>Item Price</span>
                  <div className="text-right">
                    <span className="font-bold text-[#F8FAFC] font-mono">{numericPrice.toFixed(2)} TON</span>
                    <span className="text-[10px] text-[#7F91AA] block font-mono">≈ {formatFiat(numericPrice)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[#A8B7CC]">
                  <span>Network Gas Fee</span>
                  <div className="text-right">
                    <span className="font-mono text-[#F8FAFC]">~{networkFee.toFixed(2)} TON</span>
                    <span className="text-[10px] text-[#7F91AA] block font-mono">≈ {formatFiat(networkFee)}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-sm font-bold text-white">
                  <span>Total Due</span>
                  <div className="text-right">
                    <span className="text-[#229ED9] font-mono text-base">{totalPrice.toFixed(2)} TON</span>
                    <span className="text-[11px] text-[#A8B7CC] block font-mono font-normal">≈ {formatFiat(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Wallet Status Row */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#10192C] text-xs">
                <div className="flex items-center gap-2 text-[#A8B7CC]">
                  <Wallet className="w-4 h-4 text-[#229ED9]" />
                  <span>Wallet:</span>
                </div>

                {isWalletConnected ? (
                  <div className="flex items-center gap-1.5 font-mono text-[#34D399] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                    <span>{displayWalletAddress}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="text-[#229ED9] hover:underline font-semibold cursor-pointer border-none bg-transparent"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* Error banner if purchase failed */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-slate-300 text-xs font-semibold transition-all cursor-pointer border-none disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="flex-[1.6] py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#168AC4] active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-[#229ED9]/25 flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming on TON...</span>
                    </>
                  ) : !isWalletConnected ? (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Connect & Buy</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Confirm & Buy Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Celebration Success State */
            <div className="text-center py-4 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#34D399] to-[#229ED9] mx-auto flex items-center justify-center text-white shadow-lg shadow-[#34D399]/25"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Purchase Confirmed!</h3>
                <p className="text-xs text-[#A8B7CC]">
                  <span className="text-white font-semibold">{nft.title}</span> is now stored in your TonJam library.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleListenNow}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#168AC4] active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-[#229ED9]/25"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Play Track Now</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGoToLibrary}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-slate-200 text-xs font-semibold transition-all cursor-pointer border-none"
                  >
                    View in Library
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-slate-200 text-xs font-semibold transition-all cursor-pointer border-none"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickBuyNFTModal;

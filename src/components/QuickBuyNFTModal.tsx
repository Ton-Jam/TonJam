import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  X,
  CheckCircle2,
  Wallet,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Headphones,
  RotateCcw,
} from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { buyNFT, monitorTransaction } from '@/services/tonService';
import { useAudio } from '@/contexts/AudioContext';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useGramPrice } from '@/contexts/GramPriceContext';
import { getPlaceholderImage, cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type WalletTransactionState =
  | 'connect_wallet'
  | 'wallet_connected'
  | 'confirm_purchase'
  | 'pending'
  | 'success'
  | 'failed';

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

const TX_STATE_LABELS: Record<WalletTransactionState, string> = {
  connect_wallet: 'Connect Wallet',
  wallet_connected: 'Wallet Connected',
  confirm_purchase: 'Confirm Purchase',
  pending: 'Transaction Pending',
  success: 'Transaction Successful',
  failed: 'Transaction Failed',
};

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

  const isWalletConnected = Boolean(tonConnectUI && tonConnectUI.connected);
  const userWalletAddress = tonConnectUI?.account?.address || '';

  const [txState, setTxState] = useState<WalletTransactionState>(() =>
    isWalletConnected ? 'confirm_purchase' : 'connect_wallet'
  );
  const [pendingStageText, setPendingStageText] = useState(
    'Awaiting wallet confirmation...'
  );
  const [confirmedTxHash, setConfirmedTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const isProcessing = txState === 'pending';

  // Reset modal state when opened/closed or NFT changes
  useEffect(() => {
    if (isOpen) {
      setTxState(isWalletConnected ? 'confirm_purchase' : 'connect_wallet');
      setPendingStageText('Awaiting wallet confirmation...');
      setConfirmedTxHash('');
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

  // Keep wallet connection state synchronized while modal is open before purchase starts
  useEffect(() => {
    if (!isOpen) return;
    if (txState === 'connect_wallet' && isWalletConnected) {
      setTxState('wallet_connected');
    } else if (
      (txState === 'wallet_connected' || txState === 'confirm_purchase') &&
      !isWalletConnected
    ) {
      setTxState('connect_wallet');
    }
  }, [isOpen, isWalletConnected, txState]);

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

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  // Purchase breakdown calculations
  const numericPrice = useMemo(() => {
    if (!nft?.price) return 0;
    if (typeof nft.price === 'number') return nft.price;
    const cleaned = String(nft.price).replace(/,/g, '').replace(/ TON/gi, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, [nft?.price]);

  const platformFee = useMemo(() => Number((numericPrice * 0.05).toFixed(4)), [numericPrice]);
  const networkFee = 0.05;
  const totalPayable = numericPrice + platformFee + networkFee;

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
      setTxState('connect_wallet');
      toast.warning('Please connect your TON wallet to purchase this NFT.');
      handleConnectWallet();
      return;
    }

    if (!nft.owner) {
      setTxState('failed');
      setErrorMessage('Seller wallet address is unavailable for this NFT.');
      toast.error('Seller wallet address is unavailable for this NFT.');
      return;
    }

    const toastId = toast.loading(`Authorizing purchase of "${nft.title}"...`, {
      description: 'Please confirm the transaction in your TON wallet...',
    });

    try {
      setTxState('pending');
      setPendingStageText('Awaiting TON wallet signature...');
      setErrorMessage(null);
      addNotification(`Authorizing purchase of ${nft.title}...`, 'info');

      const ownerTarget = nft.owner;
      const formattedPriceStr = `${numericPrice} TON`;

      const txHash = await buyNFT(
        tonConnectUI,
        ownerTarget,
        formattedPriceStr,
        nft.title,
        nft.royaltySplits || []
      );

      setConfirmedTxHash(txHash || '');
      setPendingStageText('Confirming transaction on TON network...');

      const confirmed = await monitorTransaction(txHash, (status) => {
        if (status === 'pending') {
          setPendingStageText('Broadcasting transaction to TON...');
        } else if (status === 'confirming') {
          setPendingStageText('Waiting for on-chain confirmation...');
        } else if (status === 'failed') {
          setPendingStageText('Transaction verification failed.');
        }
      });

      if (!confirmed) {
        throw new Error('Transaction could not be confirmed on the TON blockchain.');
      }

      setTxState('success');
      toast.success(`Successfully collected "${nft.title}"!`, {
        id: toastId,
        description: `Confirmed on TON for ${formattedPriceStr}. Added to your library.`,
      });
      addNotification(`Successfully collected ${nft.title}!`, 'success');
      if (onSuccess) {
        onSuccess(nft);
      }
    } catch (err: any) {
      console.error('Quick Buy transaction error:', err);
      const msg =
        err?.message || 'Transaction was canceled or could not be completed on TON.';
      setErrorMessage(msg);
      setTxState('failed');
      toast.error(`Purchase failed: ${msg}`, { id: toastId });
      addNotification('Purchase failed or canceled', 'error');
    }
  };

  const handleListenNow = () => {
    if (!nft) return;
    const matched = allTracks?.find((t) => t.id === nft.id);
    if (matched) {
      playTrack(matched);
    } else if (nft.audioUrl) {
      playTrack({
        id: nft.id,
        title: nft.title,
        artist: nft.artist,
        artwork: nft.imageUrl,
        coverUrl: nft.imageUrl,
        audioUrl: nft.audioUrl,
        duration: 0,
        isNFT: true,
        price: `${numericPrice} TON`,
      } as any);
    } else {
      addNotification('No audio stream attached to this NFT.', 'info');
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
        data-tonjam-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-buy-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isProcessing && onClose()}
          className="fixed inset-0 bg-[#080D1A]/80 backdrop-blur-md"
        />

        <motion.div
          data-tonjam-modal="true"
          data-tx-state={txState}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[404px] bg-[#0E1729] rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] p-4 sm:p-5 text-white z-10 overflow-hidden select-none"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close purchase dialog"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-[8px] bg-[#142036] hover:bg-[#1A2A46] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-2 border-[rgba(192,192,192,0.22)] z-20 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header & Transaction State Indicator */}
          <div className="flex items-start gap-2.5 pr-10 mb-3.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#229ED9]/15 flex items-center justify-center text-[#229ED9] shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 id="quick-buy-title" className="text-sm sm:text-base font-bold text-[#F8FAFC] leading-tight">
                {TX_STATE_LABELS[txState]}
              </h3>
              <span className="text-[11px] text-[#A8B7CC] font-medium block mt-0.5">
                TON Music NFT Checkout
              </span>
            </div>
          </div>

          {txState === 'success' ? (
            <div className="text-center py-3 space-y-4">
              <div className="w-14 h-14 rounded-[8px] bg-[#34D399]/15 border-2 border-[#34D399]/40 mx-auto flex items-center justify-center text-[#34D399]">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Transaction Successful</h4>
                <p className="text-xs text-[#A8B7CC]">
                  <span className="text-white font-semibold">{nft.title}</span> is now owned in your TonJam library.
                </p>
                {confirmedTxHash && (
                  <p className="text-[10px] font-mono text-[#7F91AA] truncate pt-1">
                    Tx: {confirmedTxHash.slice(0, 14)}...{confirmedTxHash.slice(-8)}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleListenNow}
                  className="w-full min-h-[40px] py-2 px-4 rounded-[8px] bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Play Track Now</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGoToLibrary}
                    className="flex-1 min-h-[38px] py-2 px-3 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#142036] hover:bg-[#1A2A46] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View in Library
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 min-h-[38px] py-2 px-3 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#142036] hover:bg-[#1A2A46] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ) : txState === 'failed' ? (
            <div className="py-3 space-y-4">
              <div className="p-3.5 rounded-[8px] border-2 border-red-500/40 bg-red-500/10 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-300">Transaction Failed</p>
                  <p className="mt-1 leading-relaxed">
                    {errorMessage || 'Unable to verify the transaction on the TON network.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-[40px] py-2 px-4 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#142036] hover:bg-[#1A2A46] text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setTxState(isWalletConnected ? 'confirm_purchase' : 'connect_wallet');
                  }}
                  className="flex-1 min-h-[40px] py-2 px-4 rounded-[8px] bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Compact NFT Card Preview */}
              <div className="flex items-center gap-3 p-2.5 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#142036] relative overflow-hidden">
                <div className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-[#080D1A] shrink-0">
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#229ED9]">
                      {nft.badge || nft.edition || 'Music NFT'}
                    </span>
                    {isPlayingAudio && (
                      <span className="text-[9px] text-[#34D399] font-medium">
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

              {/* Purchase Breakdown */}
              <div className="p-3 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#121C30] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#A8B7CC]">
                  <span>NFT Price</span>
                  <div className="text-right">
                    <span className="font-bold text-[#F8FAFC] font-mono tabular-nums">
                      {numericPrice.toFixed(2)} TON
                    </span>
                    <span className="text-[10px] text-[#7F91AA] block font-mono tabular-nums">
                      ≈ {formatFiat(numericPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[#A8B7CC]">
                  <span>Platform Fee (5%)</span>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-[#F8FAFC]">
                      +{platformFee.toFixed(2)} TON
                    </span>
                    <span className="text-[10px] text-[#7F91AA] block font-mono tabular-nums">
                      ≈ {formatFiat(platformFee)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[#A8B7CC]">
                  <span>Network Fee</span>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-[#F8FAFC]">
                      ~{networkFee.toFixed(2)} TON
                    </span>
                    <span className="text-[10px] text-[#7F91AA] block font-mono tabular-nums">
                      ≈ {formatFiat(networkFee)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-sm font-bold text-white">
                  <span>Total Payable</span>
                  <div className="text-right">
                    <span className="text-[#229ED9] font-mono tabular-nums text-base">
                      {totalPayable.toFixed(2)} TON
                    </span>
                    <span className="text-[11px] text-[#A8B7CC] block font-mono tabular-nums font-normal">
                      ≈ {formatFiat(totalPayable)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Connection State Row */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#10192C] text-xs">
                <div className="flex items-center gap-2 text-[#A8B7CC]">
                  <Wallet className="w-4 h-4 text-[#229ED9]" />
                  <span>{isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}</span>
                </div>

                {isWalletConnected ? (
                  <span className="font-mono text-[#34D399] font-medium">
                    {displayWalletAddress}
                  </span>
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

              {txState === 'pending' && (
                <div className="p-2.5 rounded-[8px] border-2 border-[#229ED9]/40 bg-[#229ED9]/10 text-[#F8FAFC] text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#229ED9] animate-spin shrink-0" />
                  <span>{pendingStageText}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 min-h-[40px] py-2 px-3 rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] bg-[#142036] hover:bg-[#1A2A46] text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={isWalletConnected ? handleConfirmPurchase : handleConnectWallet}
                  disabled={isProcessing}
                  className={cn(
                    'flex-[1.6] min-h-[40px] py-2 px-4 rounded-[8px] bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transaction Pending</span>
                    </>
                  ) : !isWalletConnected ? (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Confirm Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickBuyNFTModal;

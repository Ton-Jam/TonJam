import React, { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Zap, TrendingUp, X } from 'lucide-react';
import { TON_LOGO } from '@/constants';
import { NFTItem } from '@/types';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useGramPrice } from '@/contexts/GramPriceContext';
import { getPlaceholderImage } from '@/lib/utils';
import NFTAudioPreviewPlayer from './NFTAudioPreviewPlayer';

export interface NFTPurchaseConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  nft: Partial<NFTItem>;
  isProcessing?: boolean;
  networkFee?: string | number;
  platformFeePercentage?: number; // e.g. 0.05 for 5%
  userWalletAddress?: string;
  recipientAddress?: string;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export const NFTPurchaseConfirmationDialog: React.FC<NFTPurchaseConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nft,
  isProcessing = false,
  networkFee = 0.05,
  platformFeePercentage = 0.05,
  userWalletAddress,
  recipientAddress,
  title = "Confirm NFT Purchase",
  description = "Review transaction details and cost breakdown before authorizing on TON.",
  confirmText = "Authorize & Purchase",
  cancelText = "Cancel",
}) => {
  const { price: tonUsdPrice } = useTonPrice();
  const { fiatCurrency } = useGramPrice();

  // Exchange rates relative to USD
  const fiatRates: Record<string, { rate: number; symbol: string }> = useMemo(() => ({
    USD: { rate: 1.0, symbol: '$' },
    EUR: { rate: 0.92, symbol: '€' },
    GBP: { rate: 0.78, symbol: '£' },
    RUB: { rate: 90.0, symbol: '₽' },
    AED: { rate: 3.67, symbol: 'AED ' },
    TRY: { rate: 34.0, symbol: '₺' },
    INR: { rate: 84.0, symbol: '₹' },
    CNY: { rate: 7.25, symbol: '¥' },
  }), []);

  const activeFiat = fiatRates[fiatCurrency] || fiatRates.USD;
  const currentTonRateUsd = tonUsdPrice || 7.50;

  // Calculate TON amounts
  const rawPriceNum = useMemo(() => {
    if (!nft.price) return 0;
    if (typeof nft.price === 'number') return nft.price;
    const cleaned = String(nft.price).replace(/,/g, '').replace(/ TON/gi, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, [nft.price]);

  const networkFeeNum = useMemo(() => {
    if (typeof networkFee === 'number') return networkFee;
    const parsed = parseFloat(String(networkFee));
    return isNaN(parsed) ? 0.05 : parsed;
  }, [networkFee]);

  const platformFeeNum = useMemo(() => {
    return rawPriceNum * platformFeePercentage;
  }, [rawPriceNum, platformFeePercentage]);

  const totalTon = useMemo(() => {
    return rawPriceNum + platformFeeNum + networkFeeNum;
  }, [rawPriceNum, platformFeeNum, networkFeeNum]);

  // Convert TON to user's local currency
  const formatFiat = (tonAmount: number): string => {
    const usdVal = tonAmount * currentTonRateUsd;
    const localVal = usdVal * activeFiat.rate;
    const formatted = localVal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (fiatCurrency === 'RUB') {
      return `${formatted} ${activeFiat.symbol}`;
    }
    return `${activeFiat.symbol}${formatted}`;
  };

  const recipient = recipientAddress || nft.owner || '';
  const nftTitle = nft.title || 'Untitled Sonic NFT';
  const nftCreator = nft.artist || nft.creator || 'Verified Artist';
  const nftImage = nft.imageUrl || nft.coverUrl || getPlaceholderImage(`nft-${nft.id || 'preview'}`);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      {/* Mobile-friendly bottom sheet on narrow viewports, centered card on desktop */}
      <AlertDialogContent className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:-translate-x-[50%] sm:-translate-y-[50%] w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-[#0A1628] text-[#FFFFFF] p-4 sm:p-6 shadow-2xl border border-[#22374D] z-50 select-none">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-[#22374D] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <AlertDialogHeader className="space-y-1.5 text-left relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close dialog"
            className="absolute right-0 top-0 p-1.5 text-[#8C8C8C] hover:text-[#FFFFFF] rounded-lg bg-[#0F1C32] border border-[#22374D] sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pr-8 sm:pr-0">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B4D8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B4D8]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B4D8]">
                TON Blockchain
              </span>
            </div>
            
            {/* Live TON Rate Badge */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0F1C32] border border-[#22374D] text-[#C2C7CD] text-[10px] font-mono">
              <TrendingUp className="w-3 h-3 text-[#00B4D8]" />
              <span>1 TON ≈ {formatFiat(1)}</span>
            </div>
          </div>

          <AlertDialogTitle className="text-lg sm:text-xl font-bold text-[#FFFFFF] tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#C2C7CD] text-xs leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* NFT Asset Card */}
        <div className="mt-3.5 p-3 bg-[#0F1C32] rounded-xl border border-[#22374D] flex items-center gap-3">
          <img
            src={nftImage}
            alt={nftTitle}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage(nftTitle);
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-[#07111F] shrink-0 border border-[#22374D]"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#00B4D8] block mb-0.5">
              {nft.edition || 'GENESIS COLLECTIBLE'}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-[#FFFFFF] truncate">
              {nftTitle}
            </h4>
            <p className="text-[11px] text-[#C2C7CD] truncate">
              {nftCreator}
            </p>
          </div>
        </div>

        {/* Audio Preview Snippet */}
        <div className="mt-2.5">
          <NFTAudioPreviewPlayer 
            nft={nft} 
            variant="compact"
            title={nftTitle}
            artist={nftCreator}
          />
        </div>

        {/* Breakdown of Cost */}
        <div className="mt-3 p-3.5 bg-[#0F1C32] rounded-xl border border-[#22374D] space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8C8C8C]">NFT Price</span>
            <div className="text-right">
              <span className="font-mono text-[#FFFFFF] font-bold">{rawPriceNum.toFixed(2)} TON</span>
              <span className="text-[10px] text-[#8C8C8C] block font-mono">≈ {formatFiat(rawPriceNum)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8C8C8C]">Platform Fee (5%)</span>
            <div className="text-right">
              <span className="font-mono text-[#C2C7CD]">+{platformFeeNum.toFixed(2)} TON</span>
              <span className="text-[10px] text-[#8C8C8C] block font-mono">≈ {formatFiat(platformFeeNum)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#8C8C8C]">Estimated Network Fee</span>
            <div className="text-right">
              <span className="font-mono text-[#C2C7CD]">~{networkFeeNum.toFixed(2)} TON</span>
              <span className="text-[10px] text-[#8C8C8C] block font-mono">≈ {formatFiat(networkFeeNum)}</span>
            </div>
          </div>

          {(userWalletAddress || recipient) && (
            <div className="pt-2 mt-1 border-t border-[#22374D]/60 space-y-1 text-[10px] text-[#8C8C8C]">
              {userWalletAddress && (
                <div className="flex justify-between items-center">
                  <span>Paying From</span>
                  <span className="font-mono text-[#C2C7CD]">
                    {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
                  </span>
                </div>
              )}
              {recipient && (
                <div className="flex justify-between items-center">
                  <span>Seller Vault</span>
                  <span className="font-mono text-[#C2C7CD]">
                    {recipient.slice(0, 6)}...{recipient.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Total Due Highlight */}
          <div className="mt-3 p-3 bg-[#07111F] rounded-xl border border-[#00B4D8]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B4D8] block">
                Total Due
              </span>
              <span className="text-[10px] text-[#8C8C8C]">Includes network & gas fees</span>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <img src={TON_LOGO} alt="TON" className="w-4 h-4" />
                <span className="font-mono text-[#FFFFFF] font-black text-lg sm:text-xl leading-none">
                  {totalTon.toFixed(2)} TON
                </span>
              </div>
              <div className="mt-1 text-xs font-mono font-bold text-[#00B4D8]">
                ≈ {formatFiat(totalTon)} ({fiatCurrency})
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <AlertDialogFooter className="mt-4 flex flex-row gap-2.5 sm:gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-[#0F1C32] hover:bg-[#22374D] text-[#C2C7CD] hover:text-[#FFFFFF] font-medium text-xs border border-[#22374D] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="flex-1 h-11 rounded-xl bg-[#00B4D8] hover:bg-[#009CC0] text-[#07111F] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-[#00B4D8]/20 border-none cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#07111F]" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current text-[#07111F]" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NFTPurchaseConfirmationDialog;

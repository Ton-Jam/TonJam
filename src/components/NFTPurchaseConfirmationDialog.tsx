import React, { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Zap, ShieldCheck, Wallet, Sparkles, TrendingUp, Info } from 'lucide-react';
import { TON_LOGO } from '@/constants';
import { NFTItem } from '@/types';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useGramPrice } from '@/contexts/GramPriceContext';
import { cn, getPlaceholderImage } from '@/lib/utils';

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
  description = "Please review transaction details and cost breakdown before authorizing on the TON network.",
  confirmText = "Authorize & Purchase",
  cancelText = "Cancel",
}) => {
  const { price: tonUsdPrice, loading: isTonPriceLoading } = useTonPrice();
  const { fiatCurrency, fiatSymbol } = useGramPrice();

  // Exchange rates relative to USD
  const fiatRates: Record<string, { rate: number; symbol: string; decimals: number }> = useMemo(() => ({
    USD: { rate: 1.0, symbol: '$', decimals: 2 },
    EUR: { rate: 0.92, symbol: '€', decimals: 2 },
    GBP: { rate: 0.78, symbol: '£', decimals: 2 },
    RUB: { rate: 90.0, symbol: '₽', decimals: 2 },
    AED: { rate: 3.67, symbol: 'AED ', decimals: 2 },
    TRY: { rate: 34.0, symbol: '₺', decimals: 2 },
    INR: { rate: 84.0, symbol: '₹', decimals: 2 },
    CNY: { rate: 7.25, symbol: '¥', decimals: 2 },
  }), []);

  const activeFiat = fiatRates[fiatCurrency] || fiatRates.USD;
  const currentTonRateUsd = tonUsdPrice || 7.50; // Fallback to 7.50 if loading or offline

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

  // Convert TON to user's local currency using TonPriceContext
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
      <AlertDialogContent className="w-[95vw] max-w-[430px] rounded-2xl bg-[#090D24]/95 text-white p-6 shadow-2xl backdrop-blur-2xl border-none">
        <AlertDialogHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                NFT Acquisition
              </span>
            </div>
            
            {/* Live TON Price Rate Badge from TonPriceContext */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-bold">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              <span>1 TON ≈ {formatFiat(1)}</span>
            </div>
          </div>

          <AlertDialogTitle className="text-xl font-black text-white tracking-tight uppercase">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 text-xs font-normal leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* NFT Asset Card */}
        <div className="mt-4 p-3.5 bg-white/[0.04] rounded-xl flex items-center gap-3.5">
          <img
            src={nftImage}
            alt={nftTitle}
            className="w-14 h-14 rounded-xl object-cover bg-neutral-900 shadow-md shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">
                {nft.edition || 'GENESIS COLLECTIBLE'}
              </span>
            </div>
            <h4 className="text-sm font-black text-white truncate uppercase tracking-tight">
              {nftTitle}
            </h4>
            <p className="text-[11px] font-semibold text-slate-400 truncate">
              {nftCreator}
            </p>
          </div>
        </div>

        {/* Breakdown of Cost */}
        <div className="mt-3.5 p-4 bg-white/[0.03] rounded-xl space-y-2.5">
          {/* Asset Base Price */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">NFT Price</span>
            <div className="text-right">
              <span className="font-mono text-white font-bold">{rawPriceNum.toFixed(2)} TON</span>
              <span className="text-[10px] text-slate-400 block font-mono">≈ {formatFiat(rawPriceNum)}</span>
            </div>
          </div>

          {/* Platform Fee */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Platform Fee (5%)</span>
            <div className="text-right">
              <span className="font-mono text-slate-300 font-medium">+{platformFeeNum.toFixed(2)} TON</span>
              <span className="text-[10px] text-slate-400 block font-mono">≈ {formatFiat(platformFeeNum)}</span>
            </div>
          </div>

          {/* Network / Gas Fee */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Estimated Network Fee</span>
            <div className="text-right">
              <span className="font-mono text-slate-300 font-medium">~{networkFeeNum.toFixed(2)} TON</span>
              <span className="text-[10px] text-slate-400 block font-mono">≈ {formatFiat(networkFeeNum)}</span>
            </div>
          </div>

          {/* Address Information */}
          {(userWalletAddress || recipient) && (
            <div className="pt-2 mt-1 space-y-1 text-[10px] text-slate-400">
              {userWalletAddress && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Paying From</span>
                  <span className="font-mono text-slate-300">
                    {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
                  </span>
                </div>
              )}
              {recipient && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Seller Vault</span>
                  <span className="font-mono text-slate-300">
                    {recipient.slice(0, 6)}...{recipient.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Total Cost Highlight Box */}
          <div className="mt-3 p-3.5 bg-blue-600/15 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 block">
                Total Due
              </span>
              <p className="text-[10px] text-slate-400">All fees included</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <img src={TON_LOGO} alt="TON" className="w-4 h-4" />
                <span className="font-mono text-white font-black text-xl leading-none">
                  {totalTon.toFixed(2)} TON
                </span>
              </div>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  ≈ {formatFiat(totalTon)}
                </span>
                <span className="text-[9px] font-bold text-cyan-400/80 uppercase">
                  ({fiatCurrency})
                </span>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="mt-5 flex-row gap-3">
          <AlertDialogCancel
            disabled={isProcessing}
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white font-medium text-xs border-none transition-all"
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isProcessing}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-600/25 border-none transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{confirmText}</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NFTPurchaseConfirmationDialog;

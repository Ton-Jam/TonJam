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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Timer, AlertTriangle, TrendingUp } from "lucide-react";
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useGramPrice } from '@/contexts/GramPriceContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  unbondingPeriod?: string;
  penalty?: string;
  assetName?: string;
  assetImage?: string;
  tonAmount?: string;
  networkFee?: string;
  totalAmount?: string;
  fromAddress?: string;
  recipient?: string;
  transactionType?: string;
  floorPrice?: string;
  walletBalance?: string;
  currencySymbol?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default',
  unbondingPeriod,
  penalty,
  assetName,
  assetImage,
  tonAmount,
  networkFee,
  totalAmount,
  fromAddress,
  recipient,
  transactionType,
  floorPrice,
  walletBalance,
  currencySymbol = "TON",
}) => {
  const { price: tonPriceUsd } = useTonPrice();
  const { fiatCurrency } = useGramPrice();

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
  const currentTonRate = tonPriceUsd || 7.50;

  const formatLocalCurrency = (tonStr: string | undefined): string => {
    if (!tonStr) return '';
    const clean = tonStr.replace(/,/g, '').replace(/ TON/gi, '').trim();
    const num = parseFloat(clean);
    if (isNaN(num)) return '';
    const usd = num * currentTonRate;
    const local = usd * activeFiat.rate;
    const formatted = local.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return fiatCurrency === 'RUB' ? `${formatted} ${activeFiat.symbol}` : `${activeFiat.symbol}${formatted}`;
  };

  const totalLocalPrice = useMemo(() => {
    return formatLocalCurrency(totalAmount || tonAmount);
  }, [totalAmount, tonAmount, currentTonRate, activeFiat, fiatCurrency]);
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="w-[95vw] max-w-[400px] rounded-[16px] bg-[#0A0F29]/95 backdrop-blur-2xl p-6 border-none shadow-2xl">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">{transactionType || "Transaction Confirmation"}</span>
          </div>
          <AlertDialogTitle className="text-xl font-black text-white tracking-tighter uppercase leading-none">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 text-[11px] leading-relaxed tracking-wide font-medium">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {tonAmount && (
          <div className="mt-4 p-4 bg-white/[0.04] rounded-xl space-y-4 relative overflow-hidden group">
            {/* Asset Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-colors" />

            <div className="flex items-center gap-3 relative z-10 pb-3">
              {assetImage && (
                <img
                  src={assetImage}
                  alt={assetName}
                  className="w-13 h-13 rounded-lg object-cover bg-neutral-800 shadow-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400 block mb-0.5">MUSIC NFT ASSET</span>
                <h4 className="text-[13px] font-black text-white truncate uppercase tracking-tight">{assetName || "Music NFT"}</h4>
                {recipient && (
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">To: {recipient.slice(0, 10)}...{recipient.slice(-6)}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5 relative z-10 pt-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Asset Price</span>
                <span className="font-mono text-white font-black">{tonAmount} {currencySymbol}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Network Fee</span>
                <span className="font-mono text-slate-300 font-bold">~{networkFee || "0.05"} {currencySymbol}</span>
              </div>

              {floorPrice && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Floor Price</span>
                  <span className="font-mono text-cyan-400 font-bold">{floorPrice} {currencySymbol}</span>
                </div>
              )}

              {walletBalance && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Wallet Balance</span>
                  <span className="font-mono text-emerald-400 font-bold">{walletBalance} {currencySymbol}</span>
                </div>
              )}

              {fromAddress && (
                <div className="flex justify-between items-center text-[11px] pt-0.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">From Wallet</span>
                  <span className="font-mono text-slate-400 font-bold">{fromAddress.slice(0, 6)}...{fromAddress.slice(-4)}</span>
                </div>
              )}

              {totalAmount && (
                <div className="flex justify-between items-center pt-3 mt-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-white">Estimated Total</span>
                  <div className="text-right">
                    <span className="font-mono text-blue-400 font-black text-lg leading-none">{totalAmount} {currencySymbol}</span>
                    {totalLocalPrice && (
                      <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                        ≈ {totalLocalPrice} <span className="text-[9px] uppercase text-cyan-400/70">({fiatCurrency})</span>
                      </div>
                    )}
                    <p className="text-[8px] font-bold text-blue-400/60 uppercase tracking-widest mr-0.5 mt-0.5">Final Confirmation Required</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(unbondingPeriod || penalty) && (
          <div className="mt-4 p-3 bg-white/[0.03] rounded-xl space-y-2.5">
            {unbondingPeriod && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="w-3.5 h-3.5 text-orange-400" />
                  <span>Unbonding Period</span>
                </div>
                <span className="font-bold text-orange-400">{unbondingPeriod}</span>
              </div>
            )}
            {penalty && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Potential Penalty</span>
                </div>
                <span className="font-bold text-rose-400">{penalty}</span>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
          <AlertDialogCancel 
            onClick={onClose}
            className="flex-1 bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-[4px] h-11 font-medium transition-all"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={cn(
              "flex-1 h-11 rounded-[4px] font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg",
              variant === 'destructive' 
                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20" 
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle, Clock, ExternalLink, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TransactionStatus = 'idle' | 'pending' | 'confirmed' | 'failed' | 'error';

interface TransactionStatusIndicatorProps {
  status: TransactionStatus;
  txHash?: string;
  errorMessage?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  isTestnet?: boolean;
}

export const TransactionStatusIndicator: React.FC<TransactionStatusIndicatorProps> = ({
  status,
  txHash,
  errorMessage,
  title,
  description,
  onRetry,
  onDismiss,
  className,
  isTestnet = false,
}) => {
  if (status === 'idle') {
    return null;
  }

  const explorerBase = isTestnet ? 'https://testnet.tonscan.org/tx' : 'https://tonscan.org/tx';
  const isErrorState = status === 'failed' || status === 'error';

  const statusConfig = {
    pending: {
      icon: <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />,
      bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,180,216,0.2)]',
      defaultTitle: 'Transaction Pending',
      defaultDesc: 'Awaiting network confirmation via TON Connect...',
    },
    confirmed: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      defaultTitle: 'Transaction Confirmed',
      defaultDesc: 'Successfully settled on the TON blockchain.',
    },
    failed: {
      icon: <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />,
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
      defaultTitle: 'Transaction Error',
      defaultDesc: errorMessage || 'The transaction failed or was rejected. Re-trigger attempt below.',
    },
    error: {
      icon: <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />,
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
      defaultTitle: 'Transaction Error',
      defaultDesc: errorMessage || 'The transaction failed or was rejected. Re-trigger attempt below.',
    },
  };

  const current = statusConfig[status] || statusConfig.pending;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={
          status === 'pending'
            ? {
                opacity: [0.85, 1, 0.85],
                scale: [0.99, 1, 0.99],
                y: 0,
              }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          status === 'pending'
            ? {
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.2 }
        }
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        className={cn(
          "rounded-2xl border p-4 backdrop-blur-md shadow-xl flex flex-col gap-3 relative overflow-hidden bg-[#0A113A]/90",
          current.bg,
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={status === 'pending' ? { scale: [1, 1.08, 1] } : {}}
              transition={status === 'pending' ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10"
            >
              {current.icon}
            </motion.div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                {title || current.defaultTitle}
              </h4>
              <p className="text-[11px] text-zinc-300 font-medium mt-0.5 leading-relaxed">
                {description || current.defaultDesc}
              </p>
            </div>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss status indicator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(txHash || isErrorState) && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            {txHash ? (
              <a
                href={`${explorerBase}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-[10px] truncate transition-colors"
                title="View on Tonscan explorer"
              >
                <span className="truncate">Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                TON Connect Protocol
              </span>
            )}

            {isErrorState && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 ml-auto"
                title="Re-trigger original transaction attempt"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Retry Transaction</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TransactionStatusIndicator;

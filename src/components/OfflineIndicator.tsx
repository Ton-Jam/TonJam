import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!isOnline || showReconnected) && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 text-white",
            !isOnline
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/50"
              : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50",
            className
          )}
          role="status"
          aria-live="polite"
        >
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
            !isOnline ? "bg-rose-500/20 border-rose-500/30 text-rose-400" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
          )}>
            {!isOnline ? <WifiOff className="w-4 h-4 animate-pulse" /> : <Wifi className="w-4 h-4" />}
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-black uppercase tracking-wider">
              {!isOnline ? 'Network Connection Lost' : 'Connection Restored'}
            </span>
            <span className="text-[11px] font-medium text-white/80 truncate">
              {!isOnline 
                ? 'Offline mode active. TON blockchain sync paused.' 
                : 'Reconnected to TON network nodes successfully.'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;

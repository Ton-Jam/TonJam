import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Database, AlertCircle } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { indexedDbService } from '@/services/indexedDbService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export const OfflineSyncIndicator: React.FC = () => {
  const { allTracks, addNotification } = useAudio();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [tonConnection, setTonConnection] = useState<'connected' | 'intermittent' | 'offline'>('connected');
  const [isSyncing, setIsSyncing] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Sync state from navigator
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (tonConnection === 'offline') {
        setTonConnection('connected');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setTonConnection('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tonConnection]);

  // Read initial cache count
  const updateCachedCount = async () => {
    try {
      const cached = await indexedDbService.getTracks();
      setCachedCount(cached.length);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    updateCachedCount();
  }, [allTracks]);

  // Handle manual sync action
  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addNotification('Initiating music database neural sync...', 'info');

    try {
      // Simulate network request loading delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Save all matching network tracks to IndexedDB
      if (allTracks.length > 0) {
        await indexedDbService.saveTracks(allTracks);
      }
      
      await updateCachedCount();
      addNotification(`Successfully cached ${allTracks.length} tracks offline in IndexedDB!`, 'success');
    } catch (error) {
      console.error(error);
      addNotification('Neural offline database cache write failed.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle TON blockchain simulated availability
  const toggleTONState = () => {
    setTonConnection((prev) => {
      if (prev === 'connected') {
        addNotification('Simulated TON Connection state: INTERMITTENT degraded telemetry', 'info');
        return 'intermittent';
      }
      if (prev === 'intermittent') {
        addNotification('Simulated TON Connection state: OFFLINE. Running fallback IndexedDB index.', 'warning');
        return 'offline';
      }
      addNotification('Simulated TON Connection state: CONNECTED restored fully', 'success');
      return 'connected';
    });
  };

  return (
    <div className="relative select-none flex items-center">
      {/* Visual Indicator Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsTooltipOpen(!isTooltipOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all duration-300 border-none",
          tonConnection === 'connected' && "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
          tonConnection === 'intermittent' && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 animate-pulse",
          tonConnection === 'offline' && "bg-red-500/10 text-red-500 hover:bg-red-500/20"
        )}
      >
        {tonConnection === 'connected' && <Wifi className="w-3.5 h-3.5" />}
        {tonConnection === 'intermittent' && <AlertCircle className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />}
        {tonConnection === 'offline' && <WifiOff className="w-3.5 h-3.5" />}
        
        <span className="hidden sm:inline">
          {tonConnection === 'connected' ? 'TON LIVE' : tonConnection === 'intermittent' ? 'TON DEGRADED' : 'TON OFFLINE'}
        </span>
      </motion.button>

      {/* Popover Card */}
      <AnimatePresence>
        {isTooltipOpen && (
          <>
            {/* Click-away backdrop */}
            <div 
              className="fixed inset-0 z-[90]" 
              onClick={() => setIsTooltipOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-72 bg-neutral-950/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl z-[100] text-left flex flex-col gap-4 border-none"
            >
              {/* Header Status Line */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Local Music Cache</span>
                </div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  IndexedDB v1
                </span>
              </div>

              {/* Status Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Gateway Protocol</span>
                  <span className={cn(
                    "font-bold uppercase text-[10px]",
                    tonConnection === 'connected' && "text-emerald-400",
                    tonConnection === 'intermittent' && "text-amber-500",
                    tonConnection === 'offline' && "text-red-500"
                  )}>
                    {tonConnection === 'connected' ? 'Connected' : tonConnection === 'intermittent' ? 'Intermittent' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Offline Library Caches</span>
                  <span className="text-white font-mono font-bold">{cachedCount} Tracks</span>
                </div>
              </div>

              {/* Information Text */}
              <p className="text-[10px] text-zinc-400 leading-normal font-medium leading-relaxed">
                Cache your music frequencies locally so your favorite tracks remain streamable and interactive if connection is fully disconnected.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={cn(
                    "w-full py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest text-center flex items-center justify-center gap-2 cursor-pointer border-none transition-all",
                    isSyncing 
                      ? "bg-zinc-800 text-zinc-500"
                      : "bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98]"
                  )}
                >
                  <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
                  {isSyncing ? 'Writing Cache...' : 'Sync Music Library'}
                </button>

                <button
                  onClick={toggleTONState}
                  className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.09] active:scale-[0.98] transition-all rounded-full font-black text-[9px] uppercase tracking-widest text-center text-zinc-300 cursor-pointer border-none"
                >
                  Simulate Network Shift
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

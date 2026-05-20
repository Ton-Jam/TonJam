import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Music, Zap, Sparkles } from 'lucide-react';

import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  type?: 'default' | 'transaction' | 'upload' | 'mint';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Processing...', 
  type = 'default' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'transaction': return <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />;
      case 'upload': return <Music className="w-10 h-10 text-blue-400 animate-bounce" />;
      case 'mint': return <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />;
      default: return <LoadingSpinner size={48} />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-card border border-white/10 shadow-2xl max-w-xs w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <div className="relative z-10 flex items-center justify-center p-4 bg-muted/50 rounded-2xl border border-white/5">
                {getIcon()}
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">
                {message}
              </h3>
              <div className="flex items-center justify-center gap-1.5">
                <motion.div 
                  className="w-1 h-1 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="w-1 h-1 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-1 h-1 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>

            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground animate-pulse">
              Syncing with TON Blockchain
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;

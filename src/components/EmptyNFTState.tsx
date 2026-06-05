import React from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, RefreshCw, AudioLines, Music } from 'lucide-react';

interface EmptyNFTStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  actionLabel?: string;
}

export const EmptyNFTState: React.FC<EmptyNFTStateProps> = ({
  title = "No Artifacts Detected",
  description = "The neural frequency scanner returned null bits. Try adjusting your query or filters to discover other sonic collectibles.",
  onReset,
  actionLabel = "Reset Market Scanner"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 rounded-3xl bg-slate-950/40 backdrop-blur-md overflow-hidden"
    >
      {/* Visual Ambient Glows - Elegant, frameless high-contrast depth */}
      <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-500/10 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none rounded-full" />

      {/* Interactive Cyber-Archaeology Sound Scanner Illustration */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-blue-500/0 via-indigo-500/10 to-blue-500/0 p-0.5 flex items-center justify-center"
        >
          <div className="w-full h-full rounded-full bg-slate-950/80" />
        </motion.div>

        {/* Middle Pulse Ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-28 h-28 rounded-full bg-blue-500/5"
        />

        {/* Inner Static Glow Circle */}
        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center relative shadow-inner">
          {/* Audio lines in background */}
          <AudioLines className="absolute w-10 h-10 text-zinc-800/60" />

          {/* Icon overlay with animation */}
          <motion.div
            animate={{ 
              y: [0, -4, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center shadow-lg"
          >
            <Music className="w-6 h-6 text-indigo-400" />
          </motion.div>

          {/* Hovering Search Emblem */}
          <motion.div
            animate={{ 
              x: [0, 6, -4, 0],
              y: [0, -4, 4, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20"
          >
            <Search className="w-3.5 h-3.5 text-white" />
          </motion.div>

          {/* Floating Sparkle Elements */}
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-3 -left-3 text-blue-400"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Typography with clean hierarchies and zero border lines */}
      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider mb-2.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed max-w-md mx-auto mb-8">
        {description}
      </p>

      {/* Actions */}
      {onReset && (
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-2xl shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyNFTState;

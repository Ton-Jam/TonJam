import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowUp, Music, Sparkles, Coins, HelpCircle } from 'lucide-react';

interface FloatingActionsProps {
  onUploadClick?: () => void;
  onMintClick?: () => void;
  onStakingClick?: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onUploadClick,
  onMintClick,
  onStakingClick,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="fixed bottom-[148px] right-4 z-40 flex flex-col items-center gap-3 select-none">
      <AnimatePresence>
        {/* Back to Top Assisted Button */}
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="w-10 h-10 bg-[#12141C]/80 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1E2230] transition-colors"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-4.5 h-4.5" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {/* Quick Actions Radial/Vertical Menu */}
          {isMenuOpen && (
            <div className="absolute bottom-14 right-0 flex flex-col items-end gap-2">
              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                onClick={() => {
                  if (onUploadClick) onUploadClick();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#12141C] text-white rounded-xl shadow-xl text-xs font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Music className="w-4 h-4 text-blue-400" />
                <span>Upload Track</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                onClick={() => {
                  if (onMintClick) onMintClick();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#12141C] text-white rounded-xl shadow-xl text-xs font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Mint NFT</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (onStakingClick) onStakingClick();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#12141C] text-white rounded-xl shadow-xl text-xs font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Staking Portal</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        {/* Primary Interactive FAB Trigger */}
        <motion.button
          onClick={toggleMenu}
          whileTap={{ scale: 0.92 }}
          animate={{ rotate: isMenuOpen ? 135 : 0 }}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all
            ${isMenuOpen ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}
          `}
          aria-label="Quick Actions Menu"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};
export default FloatingActions;

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string; // e.g. 'max-h-[85vh]'
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[85vh]',
}) => {
  // Prevent scrolling behind bottom sheet
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Swipeable Draggable Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.8 }}
            onDragEnd={(_event, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className={`
              fixed bottom-0 left-0 right-0 z-50 bg-[#07080B]/95 backdrop-blur-2xl rounded-t-[24px] pb-safe-bottom overflow-hidden flex flex-col select-none
              ${maxHeight}
            `}
          >
            {/* Visual Touch Draggability Handle */}
            <div className="w-full flex flex-col items-center py-3 flex-shrink-0 cursor-row-resize">
              <div className="w-10 h-1 bg-[#1E2230] rounded-full" />
            </div>

            {/* Header portion */}
            {(title || onClose) && (
              <div className="px-4 pb-3 flex items-center justify-between flex-shrink-0">
                {title ? (
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">
                    {title}
                  </h3>
                ) : (
                  <div />
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white active:scale-90 transition-all"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Body portion */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default BottomSheet;

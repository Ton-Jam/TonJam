import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet panel without border */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[85vh] rounded-t-3xl bg-[#0F1C32] shadow-2xl flex flex-col z-10 overflow-hidden select-none"
          >
            {/* Grab handle */}
            <div className="w-full flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-[#91A8C5] truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="px-5 py-3 overflow-y-auto no-scrollbar flex-1 pb-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;

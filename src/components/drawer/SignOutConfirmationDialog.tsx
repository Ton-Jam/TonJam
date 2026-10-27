import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';

interface SignOutConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SignOutConfirmationDialog: React.FC<SignOutConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* DIALOG BOX - NO BORDER LINES */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-[#101A2D] p-5 sm:p-6 flex flex-col gap-4 text-center shadow-2xl overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 mx-auto flex items-center justify-center shadow-inner">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Sign Out of TonJam?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                You will need to sign in again to access your personal library, playlists, and earned TJ points.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-xs font-bold transition-colors cursor-pointer outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer outline-none shadow-md"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignOutConfirmationDialog;

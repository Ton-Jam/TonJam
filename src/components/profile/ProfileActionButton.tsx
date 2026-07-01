import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, ArrowRight, LayoutDashboard } from 'lucide-react';

interface ProfileActionButtonProps {
  isArtistVerified: boolean;
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  onBecomeArtist: () => void;
  onOpenDashboard: () => void;
}

export const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({
  isArtistVerified,
  verificationStatus,
  onBecomeArtist,
  onOpenDashboard
}) => {
  return (
    <motion.div 
      layout 
      className="w-full flex"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {isArtistVerified ? (
        <motion.button
          key="artist-dashboard-btn"
          layoutId="profile-primary-action-btn"
          onClick={onOpenDashboard}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-6 bg-[#0052FF] hover:bg-[#1a66ff] active:bg-[#0047dd] text-white font-bold text-xs uppercase tracking-wider rounded-[12px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Go to Artist Dashboard</span>
          <ArrowRight className="w-4 h-4 shrink-0 ml-1" />
        </motion.button>
      ) : verificationStatus === 'pending' ? (
        <motion.button
          key="verification-pending-btn"
          layoutId="profile-primary-action-btn"
          disabled
          className="w-full py-3.5 px-6 bg-[#101A3B] text-slate-400 font-bold text-xs uppercase tracking-wider rounded-[12px] flex items-center justify-center gap-2 border border-white/5 opacity-85 cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#0052FF]" />
          <span>Verification Pending...</span>
        </motion.button>
      ) : (
        <motion.button
          key="become-artist-btn"
          layoutId="profile-primary-action-btn"
          onClick={onBecomeArtist}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-6 bg-slate-100 hover:bg-white text-[#050A24] font-bold text-xs uppercase tracking-wider rounded-[12px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-none"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-[#0052FF]" />
          <span>Become an Artist</span>
        </motion.button>
      )}
    </motion.div>
  );
};

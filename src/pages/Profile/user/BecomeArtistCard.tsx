import React from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface BecomeArtistCardProps {
  status: 'none' | 'pending' | 'verified' | 'rejected';
  onApply: () => void;
}

export const BecomeArtistCard: React.FC<BecomeArtistCardProps> = ({
  status,
  onApply
}) => {
  const criteria = [
    'Connect verified TON address to profile node',
    'Upload at least one audio frequency track',
    'Verify primary artist ownership credentials'
  ];

  return (
    <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900/40 border border-[#0052FF]/20 rounded-2xl p-5 text-white flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-[#0052FF]/10 text-[#0052FF] rounded-lg">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Artist Verification Studio
          </span>
        </div>

        <h3 className="text-base font-bold tracking-tight uppercase">
          Become a TonJam Creator
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm">
          Join the supersonic audio era, mint digital audio collectible artifacts, and claim direct stream royalties via our decentralized TON network protocols.
        </p>

        {/* Criteria list */}
        <div className="space-y-2 mt-4">
          {criteria.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-medium">
              <Check className="w-4 h-4 text-[#0052FF] shrink-0 mt-0.5" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Status</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#0052FF] font-mono">
            {status === 'none' && 'Unverified'}
            {status === 'pending' && 'Pending Approval'}
            {status === 'verified' && 'Verified Artist'}
            {status === 'rejected' && 'Rejected'}
          </span>
        </div>

        {status === 'none' && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onApply}
            className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <span>Apply Now</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}

        {status === 'pending' && (
          <div className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Under Review</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeArtistCard;

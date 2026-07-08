import React, { useState } from 'react';
import { Trophy, Flame, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '@/components/layout/ToastProvider';
import { MOCK_ACHIEVEMENTS } from '@/components/profile/ProfileTypes';

interface RewardsCardProps {
  initialTjPoints?: number;
}

export const RewardsCard: React.FC<RewardsCardProps> = ({
  initialTjPoints = 850
}) => {
  const toast = useToast();
  const [points, setPoints] = useState<number>(initialTjPoints);
  const [dailyStreak, setDailyStreak] = useState<number>(5);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const handleClaimPoints = () => {
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      setPoints(prev => prev + 50);
      setDailyStreak(prev => prev + 1);
      toast.success(
        'Points Claimed',
        'Daily login streak updated! Received 50 TJ Points.'
      );
    }, 1200);
  };

  return (
    <div className="bg-[#101A3B] border border-white/5 rounded-2xl p-5 text-white flex flex-col justify-between">
      {/* Header Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ecosystem Loyalty Node
          </span>
          <h4 className="text-sm font-bold text-slate-200">Rewards & Achievements</h4>
        </div>
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 my-2.5">
        <div className="bg-slate-950/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block leading-none">TJ Points</span>
            <span className="text-lg font-black font-mono tracking-tight">{points}</span>
          </div>
        </div>

        <div className="bg-slate-950/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block leading-none">Daily Streak</span>
            <span className="text-lg font-black font-mono tracking-tight">{dailyStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Grid of badges */}
      <div className="space-y-1.5 mt-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Badges</span>
        <div className="grid grid-cols-2 gap-2">
          {MOCK_ACHIEVEMENTS.slice(0, 2).map((ach) => (
            <div key={ach.id} className="p-2 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0052FF]" />
              <span className="text-[10px] font-bold text-slate-200 truncate">{ach.title}</span>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={isClaiming}
        onClick={handleClaimPoints}
        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Flame className="w-4 h-4 text-white fill-current animate-bounce" />
        <span>Claim Daily 50 Points</span>
      </motion.button>
    </div>
  );
};

export default RewardsCard;

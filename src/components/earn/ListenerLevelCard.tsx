import React, { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Headphones, Zap, Sparkles, Flame, Crown, Trophy, ChevronRight, Gift } from 'lucide-react';
import LevelUpModal from './LevelUpModal';

export interface ListenerLevelTier {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  badgeColor: string;
  bgTint: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  bonusPoints: number;
  perks: string[];
}

export const LISTENER_LEVELS: ListenerLevelTier[] = [
  {
    level: 1,
    title: 'Rookie Listener',
    minPoints: 0,
    maxPoints: 499,
    badgeColor: 'text-[#229ED9]',
    bgTint: 'bg-[#229ED9]/15',
    borderColor: 'border-[#229ED9]/30',
    icon: Headphones,
    description: 'Starting your Web3 music journey on TonJam',
    bonusPoints: 0,
    perks: ['Stream Listening Access', 'Discovery XP Rewards'],
  },
  {
    level: 2,
    title: 'Beat Enthusiast',
    minPoints: 500,
    maxPoints: 1499,
    badgeColor: 'text-[#2DD4BF]',
    bgTint: 'bg-[#2DD4BF]/15',
    borderColor: 'border-[#2DD4BF]/30',
    icon: Zap,
    description: 'Regularly streaming & discovering soundscapes',
    bonusPoints: 100,
    perks: ['+10% Stream XP Boost', 'Beat Enthusiast Badge', 'JamSpace Highlighting'],
  },
  {
    level: 3,
    title: 'Groove Collector',
    minPoints: 1500,
    maxPoints: 4999,
    badgeColor: 'text-[#9B7CFF]',
    bgTint: 'bg-[#9B7CFF]/15',
    borderColor: 'border-[#9B7CFF]/30',
    icon: Sparkles,
    description: 'Supporting creators & collecting music NFTs',
    bonusPoints: 250,
    perks: ['+15% Stream XP Boost', 'Groove Collector Badge', 'Exclusive NFT Previews'],
  },
  {
    level: 4,
    title: 'Vibe Curator',
    minPoints: 5000,
    maxPoints: 14999,
    badgeColor: 'text-[#FFC857]',
    bgTint: 'bg-[#FFC857]/15',
    borderColor: 'border-[#FFC857]/30',
    icon: Flame,
    description: 'Top community influencer & playlist curator',
    bonusPoints: 600,
    perks: ['+20% Stream XP Boost', 'Curator Spotlight', 'Custom Audio Themes'],
  },
  {
    level: 5,
    title: 'Sonic Legend',
    minPoints: 15000,
    maxPoints: Infinity,
    badgeColor: 'text-[#F472B6]',
    bgTint: 'bg-[#F472B6]/15',
    borderColor: 'border-[#F472B6]/30',
    icon: Crown,
    description: 'Elite TonJam audio pioneer & community legend',
    bonusPoints: 1500,
    perks: ['+25% Stream XP Boost', 'Legendary Profile Aura', 'VIP Drops Access'],
  },
];

export const getListenerLevel = (totalPoints: number): ListenerLevelTier => {
  const current = LISTENER_LEVELS.find(
    (lvl) => totalPoints >= lvl.minPoints && totalPoints <= lvl.maxPoints
  );
  return current || LISTENER_LEVELS[LISTENER_LEVELS.length - 1];
};

interface ListenerLevelCardProps {
  totalPoints: number;
}

export const ListenerLevelCard: React.FC<ListenerLevelCardProps> = ({ totalPoints }) => {
  const currentLevel = useMemo(() => getListenerLevel(totalPoints), [totalPoints]);
  const prevLevelRef = useRef<number | null>(null);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);

  useEffect(() => {
    if (prevLevelRef.current !== null && currentLevel.level > prevLevelRef.current) {
      // Trigger level-up modal & multi-burst level up celebration
      setIsLevelUpModalOpen(true);

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#229ED9', '#2DD4BF', '#9B7CFF', '#FFC857', '#F472B6'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#229ED9', '#9B7CFF', '#F472B6'],
        });
        confetti({
          particleCount: 75,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#2DD4BF', '#FFC857', '#34D399'],
        });
      }, 250);

      toast.success(`LEVEL UP! Level ${currentLevel.level}: ${currentLevel.title}!`, {
        description: currentLevel.description,
      });
    }

    prevLevelRef.current = currentLevel.level;
  }, [currentLevel]);

  const nextLevel = useMemo(() => {
    const nextIdx = LISTENER_LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
    return LISTENER_LEVELS[nextIdx] || null;
  }, [currentLevel]);

  const LevelIcon = currentLevel.icon;

  // Calculate progress percent to next tier
  const progressPercent = useMemo(() => {
    if (!nextLevel) return 100;
    const pointsInCurrentTier = totalPoints - currentLevel.minPoints;
    const tierSpan = nextLevel.minPoints - currentLevel.minPoints;
    return Math.min(100, Math.max(0, Math.round((pointsInCurrentTier / tierSpan) * 100)));
  }, [totalPoints, currentLevel, nextLevel]);

  return (
    <div className={`w-full rounded-2xl bg-[#111C30] border ${currentLevel.borderColor} p-4 flex flex-col gap-3 text-left shadow-lg select-none relative overflow-hidden`}>
      {/* AMBIENT LEVEL GLOW */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${currentLevel.bgTint} rounded-full blur-3xl pointer-events-none`} />

      {/* TOP ROW: LEVEL BADGE & TITLE */}
      <div className="flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${currentLevel.bgTint} border ${currentLevel.borderColor} ${currentLevel.badgeColor} flex items-center justify-center shrink-0 shadow-md`}>
            <LevelIcon className="w-5 h-5" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${currentLevel.badgeColor}`}>
                Level {currentLevel.level}
              </span>
              <span className="text-[9px] font-bold text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
                Listener Rank
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
              {currentLevel.title}
            </h3>
          </div>
        </div>

        {/* CURRENT TOTAL POINTS TAG & MILESTONE REWARDS BUTTON */}
        <div className="text-right shrink-0 flex flex-col items-end">
          <span className="text-xs font-mono font-black text-white">{totalPoints.toLocaleString()} TJ</span>
          <span className="text-[9px] text-slate-400 block">Total Earned</span>
          <button
            type="button"
            onClick={() => setIsLevelUpModalOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[9px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer outline-none mt-1"
          >
            <Gift className="w-2.5 h-2.5 text-[#FFC857]" />
            <span>Milestone Rewards</span>
          </button>
        </div>
      </div>

      {/* TIER PROGRESS BAR TO NEXT LEVEL */}
      <div className="flex flex-col gap-1.5 z-10 pt-0.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>{currentLevel.description}</span>
          {nextLevel && (
            <span className="text-slate-300 font-mono">
              {totalPoints.toLocaleString()} / {nextLevel.minPoints.toLocaleString()} TJ
            </span>
          )}
        </div>

        {nextLevel ? (
          <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#229ED9] via-[#9B7CFF] to-[#FFC857] rounded-full"
            />
          </div>
        ) : (
          <div className="text-[10px] font-bold text-[#F472B6] flex items-center gap-1">
            <Crown className="w-3 h-3 text-[#F472B6]" />
            <span>Highest Listener Rank Achieved!</span>
          </div>
        )}
      </div>

      {/* MINI LEVEL ROADMAP BADGE NODES */}
      <div className="grid grid-cols-5 gap-1.5 pt-1.5 z-10 border-t border-white/5">
        {LISTENER_LEVELS.map((tier) => {
          const TierIcon = tier.icon;
          const isAchieved = currentLevel.level >= tier.level;
          const isCurrent = currentLevel.level === tier.level;

          return (
            <button
              type="button"
              key={tier.level}
              onClick={() => setIsLevelUpModalOpen(true)}
              className={`
                flex flex-col items-center justify-center p-1.5 rounded-xl transition-all text-center cursor-pointer outline-none
                ${isCurrent 
                  ? `${tier.bgTint} border ${tier.borderColor} scale-105 shadow-sm` 
                  : isAchieved 
                    ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]' 
                    : 'bg-white/[0.01] text-slate-600 opacity-60'
                }
              `}
              title={`${tier.title} (${tier.minPoints.toLocaleString()} TJ) - View Milestone`}
            >
              <TierIcon className={`w-3.5 h-3.5 ${isAchieved ? tier.badgeColor : 'text-slate-600'}`} />
              <span className={`text-[8px] font-black uppercase tracking-wider mt-1 truncate w-full ${isCurrent ? tier.badgeColor : isAchieved ? 'text-slate-300' : 'text-slate-600'}`}>
                Lvl {tier.level}
              </span>
            </button>
          );
        })}
      </div>

      {/* LEVEL UP CELEBRATION & MILESTONE BREAKDOWN MODAL */}
      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        currentLevel={currentLevel}
        totalPoints={totalPoints}
      />
    </div>
  );
};

export default ListenerLevelCard;

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, ChevronRight, CheckCircle2, ArrowRight, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ListenerLevelTier, LISTENER_LEVELS } from './ListenerLevelCard';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: ListenerLevelTier;
  totalPoints: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  totalPoints,
}) => {
  const nextLevel = React.useMemo(() => {
    const nextIdx = LISTENER_LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
    return LISTENER_LEVELS[nextIdx] || null;
  }, [currentLevel]);

  // Points needed to reach next tier
  const pointsRemaining = React.useMemo(() => {
    if (!nextLevel) return 0;
    return Math.max(0, nextLevel.minPoints - totalPoints);
  }, [nextLevel, totalPoints]);

  // Tier progress percentage
  const progressPercent = React.useMemo(() => {
    if (!nextLevel) return 100;
    const pointsInTier = totalPoints - currentLevel.minPoints;
    const tierRange = nextLevel.minPoints - currentLevel.minPoints;
    return Math.min(100, Math.max(0, Math.round((pointsInTier / tierRange) * 100)));
  }, [nextLevel, totalPoints, currentLevel]);

  // Fire celebratory confetti bursts upon opening modal
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#229ED9', '#2DD4BF', '#9B7CFF', '#FFC857', '#F472B6'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.6 },
          colors: ['#229ED9', '#9B7CFF', '#F472B6'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.6 },
          colors: ['#2DD4BF', '#FFC857', '#34D399'],
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const LevelIcon = currentLevel.icon;
  const NextLevelIcon = nextLevel?.icon;

  const milestoneBonus = currentLevel.bonusPoints || 100;
  const rankPerkBonus = Math.round(milestoneBonus * 0.4);
  const totalBonusCredited = milestoneBonus + rankPerkBonus;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none overflow-y-auto">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* MODAL DIALOG CONTAINER - NO BORDER LINES */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-[#101A2D] p-5 sm:p-6 flex flex-col gap-4 text-center shadow-2xl overflow-hidden my-auto"
          >
            {/* AMBIENT GLOW ACCENT */}
            <div
              className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 ${currentLevel.bgTint} rounded-full blur-3xl pointer-events-none opacity-90`}
            />

            {/* TOP BAR / CLOSE BUTTON */}
            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06]">
                <Sparkles className="w-3.5 h-3.5 text-[#229ED9]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#229ED9]">
                  Level Up Achieved!
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer outline-none"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LEVEL ICON & BADGE HERO */}
            <div className="flex flex-col items-center gap-2 relative z-10 pt-1">
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className={`w-20 h-20 rounded-3xl ${currentLevel.bgTint} ${currentLevel.badgeColor} flex items-center justify-center shadow-xl relative`}
              >
                <LevelIcon className="w-10 h-10" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FFC857] text-[#080D1A] flex items-center justify-center font-black text-[11px] shadow-md">
                  ★
                </div>
              </motion.div>

              <div className="space-y-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Listener Milestone
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Level {currentLevel.level}: {currentLevel.title}
                </h2>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  {currentLevel.description}
                </p>
              </div>
            </div>

            {/* SECTION: BONUS POINTS BREAKDOWN - NO BORDERS */}
            <div className="rounded-2xl bg-white/[0.04] p-3.5 flex flex-col gap-2.5 text-left relative z-10 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white font-extrabold text-xs">
                  <Trophy className="w-3.5 h-3.5 text-[#FFC857]" />
                  <span>Bonus Rewards Breakdown</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#229ED9]/20 text-[#229ED9] font-mono font-black text-xs">
                  +{totalBonusCredited} TJ Total
                </span>
              </div>

              {/* POINTS ITEMS LIST */}
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white/[0.03]">
                  <span className="text-slate-300">Milestone Unlock Bonus</span>
                  <span className="font-mono font-extrabold text-[#34D399]">+{milestoneBonus} TJ</span>
                </div>

                <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white/[0.03]">
                  <span className="text-slate-300">Rank Progression Bonus</span>
                  <span className="font-mono font-extrabold text-[#229ED9]">+{rankPerkBonus} TJ</span>
                </div>

                <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white/[0.03]">
                  <span className="text-slate-300">Audio Stream Multiplier</span>
                  <span className="font-mono font-extrabold text-[#FFC857]">
                    +{currentLevel.level * 5}% XP Boost
                  </span>
                </div>
              </div>

              {/* PERKS TAGS */}
              {currentLevel.perks && currentLevel.perks.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {currentLevel.perks.map((perk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] font-bold text-slate-300"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#34D399]" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION: NEXT LISTENER LEVEL REQUIREMENTS - NO BORDERS */}
            <div className="rounded-2xl bg-white/[0.04] p-3.5 flex flex-col gap-2.5 text-left relative z-10 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Next Milestone
                </div>
                {nextLevel && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                    <span className={nextLevel.badgeColor}>Level {nextLevel.level}</span>
                    <span className="text-slate-400">({nextLevel.title})</span>
                  </div>
                )}
              </div>

              {nextLevel ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-sans text-[11px]">Milestone Requirement</span>
                    <span className="font-extrabold text-white">
                      {nextLevel.minPoints.toLocaleString()} TJ
                    </span>
                  </div>

                  {/* PROGRESS BAR - NO BORDERS */}
                  <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#229ED9] via-[#9B7CFF] to-[#FFC857] rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{pointsRemaining.toLocaleString()} TJ needed</span>
                    <span>{progressPercent}% towards milestone</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.02] text-[10px] text-slate-300 leading-relaxed flex items-start gap-1.5 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-[#229ED9] shrink-0 mt-0.5" />
                    <span>
                      Stream new releases on Discover, complete daily check-ins, or collect Music NFTs to reach{' '}
                      <strong className="text-white">{nextLevel.title}</strong> and unlock{' '}
                      <span className="text-[#FFC857]">+{nextLevel.bonusPoints || 250} TJ bonus</span>!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2 text-xs text-[#F472B6] font-bold">
                  <Trophy className="w-4 h-4 text-[#F472B6]" />
                  <span>Apex Listener Rank! You hold TonJam's highest achievement tier.</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTON - NO BORDER LINES */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg active:scale-[0.98] cursor-pointer outline-none relative z-10 flex items-center justify-center gap-2"
            >
              <span>Awesome, Keep Jamming</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;

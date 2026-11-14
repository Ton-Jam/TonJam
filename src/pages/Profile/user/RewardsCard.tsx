import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTJ } from '@/contexts/TJContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface RewardsCardProps {
  initialTjPoints?: number;
}

interface EarnedBadge {
  id: string;
  title: string;
}

export const RewardsCard: React.FC<RewardsCardProps> = ({
  initialTjPoints,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile } = useAudio();
  const { dailyStreak, dailyMissions, claimDailyMissionReward } = useTJ();
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const points = Number(userProfile?.tjBalance ?? userProfile?.jamBalance ?? initialTjPoints ?? 0);

  useEffect(() => {
    let active = true;
    if (!user?.uid) {
      setBadges([]);
      return;
    }

    const loadAchievements = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'users', user.uid, 'achievements'), limit(4))
        );
        if (!active) return;
        setBadges(
          snap.docs.map((d) => ({
            id: d.id,
            title: (d.data() as any).title || (d.data() as any).achievementId || 'Badge',
          }))
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/achievements`);
      }
    };

    loadAchievements();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const claimableMission = dailyMissions.find((m) => m.completed && !m.claimed);

  const handleAction = async () => {
    if (claimableMission) {
      setIsClaiming(true);
      await claimDailyMissionReward(claimableMission.id);
      setIsClaiming(false);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <div className="bg-[#101A3B] rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
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

      <div className="grid grid-cols-2 gap-4 my-2.5">
        <div className="bg-slate-950/30 p-3 rounded-xl flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block leading-none">TJ Points</span>
            <span className="text-lg font-black font-mono tracking-tight">{points}</span>
          </div>
        </div>

        <div className="bg-slate-950/30 p-3 rounded-xl flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block leading-none">Daily Streak</span>
            <span className="text-lg font-black font-mono tracking-tight">{dailyStreak} Days</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mt-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Badges</span>
        {badges.length === 0 ? (
          <div className="p-2 bg-white/5 rounded-lg text-[10px] text-slate-400">
            No unlocked badges yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {badges.slice(0, 2).map((ach) => (
              <div key={ach.id} className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0052FF]" />
                <span className="text-[10px] font-bold text-slate-200 truncate">{ach.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={isClaiming}
        onClick={handleAction}
        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
      >
        <Flame className="w-4 h-4 text-white fill-current" />
        <span>
          {claimableMission
            ? `Claim +${claimableMission.reward} TJ`
            : 'Open Daily Missions'}
        </span>
      </motion.button>
    </div>
  );
};

export default RewardsCard;

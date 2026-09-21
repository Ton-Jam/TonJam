import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DailyMission } from '@/types';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/haptics';

export interface TJContextType {
  dailyMissions: DailyMission[];
  activeDateKey: string;
  timeUntilReset: string;
  claimDailyMissionReward: (missionId: string) => Promise<boolean>;
  recordMissionProgress: (type: string, amount?: number, entityId?: string) => Promise<void>;
  dailyStreak: number;
  dailyCompletedCount: number;
  allDailyCompleted: boolean;
  hasClaimedDailyBonus: boolean;
  claimDailyBonus: () => Promise<boolean>;
  dailyBonusReward: number;
  isSyncing: boolean;
}

const TJContext = createContext<TJContextType | null>(null);

export const useTJ = () => {
  const context = useContext(TJContext);
  if (!context) {
    return {
      dailyMissions: [],
      activeDateKey: '',
      timeUntilReset: '',
      claimDailyMissionReward: async () => false,
      recordMissionProgress: async () => {},
      dailyStreak: 1,
      dailyCompletedCount: 0,
      allDailyCompleted: false,
      hasClaimedDailyBonus: false,
      claimDailyBonus: async () => false,
      dailyBonusReward: 100,
      isSyncing: false,
    };
  }
  return context;
};

// Helper: Get deterministic UTC date key (YYYY-MM-DD)
export const getUTCDateKey = (date: Date = new Date()): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper: Get end of UTC day timestamp (midnight UTC)
export const getUTCDayEndTimestamp = (date: Date = new Date()): number => {
  const end = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));
  return end.getTime();
};

// Standard Deterministic Daily Missions Definition
export const createDefaultDailyMissions = (dateKey: string): DailyMission[] => {
  const expiresAt = getUTCDayEndTimestamp();

  return [
    {
      id: `daily-stream-${dateKey}`,
      title: 'Stream 3 Tracks',
      description: 'Stream music from the catalog for genuine listening experience',
      reward: 50,
      type: 'listen_new_track',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      expiresAt,
      iconName: 'play',
      category: 'Streaming',
    },
    {
      id: `daily-follow-${dateKey}`,
      title: 'Follow an Artist',
      description: 'Support creators by connecting with their profile',
      reward: 40,
      type: 'follow_artist',
      target: 1,
      progress: 0,
      completed: false,
      claimed: false,
      expiresAt,
      iconName: 'users',
      category: 'Social',
    },
    {
      id: `daily-like-${dateKey}`,
      title: 'Like 2 Tracks',
      description: 'Show appreciation to artist tracks across the network',
      reward: 30,
      type: 'like_track',
      target: 2,
      progress: 0,
      completed: false,
      claimed: false,
      expiresAt,
      iconName: 'music',
      category: 'Social',
    },
    {
      id: `daily-explore-${dateKey}`,
      title: 'Explore 2 NFTs',
      description: 'Inspect unique digital collectibles in the TonJam marketplace',
      reward: 35,
      type: 'explore_nft',
      target: 2,
      progress: 0,
      completed: false,
      claimed: false,
      expiresAt,
      iconName: 'zap',
      category: 'NFT',
    },
    {
      id: `daily-space-${dateKey}`,
      title: 'Enter a Jam Space',
      description: 'Join an active room or community node session',
      reward: 45,
      type: 'join_jam_space',
      target: 1,
      progress: 0,
      completed: false,
      claimed: false,
      expiresAt,
      iconName: 'flame',
      category: 'Community',
    },
  ];
};

export const TJProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDateKey, setActiveDateKey] = useState<string>(() => getUTCDateKey());
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [hasClaimedDailyBonus, setHasClaimedDailyBonus] = useState<boolean>(false);
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    const saved = localStorage.getItem('tonjam_daily_streak');
    return saved ? parseInt(saved, 10) || 7 : 7;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Track actions per day to prevent duplicate spam (e.g. liking same track multiple times)
  const trackedEntitiesRef = useRef<Record<string, Set<string>>>({});

  const dailyBonusReward = 100;

  // Countdown timer to midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentDateKey = getUTCDateKey(now);
      if (currentDateKey !== activeDateKey) {
        setActiveDateKey(currentDateKey);
      }

      const end = getUTCDayEndTimestamp(now);
      const diff = Math.max(0, end - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeDateKey]);

  // Load / Initialize Missions for current activeDateKey
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const storageKey = `tonjam_daily_missions_${activeDateKey}`;
    const bonusStorageKey = `tonjam_daily_bonus_${activeDateKey}`;

    // 1. Initial local fallback load
    const cachedMissionsStr = localStorage.getItem(storageKey);
    const cachedBonus = localStorage.getItem(bonusStorageKey) === 'true';
    setHasClaimedDailyBonus(cachedBonus);

    let initialMissions: DailyMission[] = [];
    if (cachedMissionsStr) {
      try {
        initialMissions = JSON.parse(cachedMissionsStr);
      } catch (e) {
        console.error('Error parsing cached daily missions', e);
      }
    }

    if (!initialMissions || initialMissions.length === 0) {
      initialMissions = createDefaultDailyMissions(activeDateKey);
      localStorage.setItem(storageKey, JSON.stringify(initialMissions));
    }
    setDailyMissions(initialMissions);

    // 2. Real-time Firestore sync if authenticated
    const currentUser = auth.currentUser;
    if (currentUser) {
      setIsSyncing(true);
      const missionDocRef = doc(db, 'users', currentUser.uid, 'dailyMissions', activeDateKey);

      unsubscribe = onSnapshot(
        missionDocRef,
        (snap) => {
          setIsSyncing(false);
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.missions) && data.missions.length > 0) {
              setDailyMissions(data.missions);
              localStorage.setItem(storageKey, JSON.stringify(data.missions));
            }
            if (data.bonusClaimed !== undefined) {
              setHasClaimedDailyBonus(!!data.bonusClaimed);
              localStorage.setItem(bonusStorageKey, String(!!data.bonusClaimed));
            }
          } else {
            // Write initial state to Firestore
            setDoc(missionDocRef, {
              dateKey: activeDateKey,
              missions: initialMissions,
              bonusClaimed: false,
              updatedAt: new Date().toISOString(),
            }).catch((err) => {
              console.warn('Error creating daily missions doc in Firestore:', err);
            });
          }
        },
        (error) => {
          setIsSyncing(false);
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}/dailyMissions/${activeDateKey}`);
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeDateKey]);

  // Save changes locally and sync with Firestore
  const persistMissions = useCallback(
    async (updated: DailyMission[], bonusClaimed?: boolean) => {
      const storageKey = `tonjam_daily_missions_${activeDateKey}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setDailyMissions(updated);

      if (bonusClaimed !== undefined) {
        const bonusStorageKey = `tonjam_daily_bonus_${activeDateKey}`;
        localStorage.setItem(bonusStorageKey, String(bonusClaimed));
        setHasClaimedDailyBonus(bonusClaimed);
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const missionDocRef = doc(db, 'users', currentUser.uid, 'dailyMissions', activeDateKey);
          await setDoc(
            missionDocRef,
            {
              dateKey: activeDateKey,
              missions: updated,
              bonusClaimed: bonusClaimed !== undefined ? bonusClaimed : hasClaimedDailyBonus,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          console.warn('Failed to sync missions to Firestore:', error);
        }
      }
    },
    [activeDateKey, hasClaimedDailyBonus]
  );

  // Record progress for genuine user interaction
  const recordMissionProgress = useCallback(
    async (type: string, amount: number = 1, entityId?: string) => {
      if (!type) return;

      // Entity deduplication check per day
      if (entityId) {
        if (!trackedEntitiesRef.current[type]) {
          trackedEntitiesRef.current[type] = new Set();
        }
        if (trackedEntitiesRef.current[type].has(entityId)) {
          // Already counted this specific track/artist/NFT today
          return;
        }
        trackedEntitiesRef.current[type].add(entityId);
      }

      setDailyMissions((prevMissions) => {
        let hasChanges = false;
        const updated = prevMissions.map((mission) => {
          if (mission.type === type && !mission.completed) {
            const nextProgress = Math.min(mission.target, mission.progress + amount);
            const isCompleted = nextProgress >= mission.target;
            hasChanges = true;

            if (isCompleted && !mission.completed) {
              triggerHaptic('success');
              toast.success(`Mission Complete: ${mission.title}`, {
                description: `Reward: +${mission.reward} TJ ready to claim!`,
              });
            }

            return {
              ...mission,
              progress: nextProgress,
              completed: isCompleted,
            };
          }
          return mission;
        });

        if (hasChanges) {
          persistMissions(updated);
        }

        return updated;
      });
    },
    [persistMissions]
  );

  // Claim individual mission reward
  const claimDailyMissionReward = useCallback(
    async (missionId: string): Promise<boolean> => {
      const mission = dailyMissions.find((m) => m.id === missionId);
      if (!mission || !mission.completed || mission.claimed) {
        return false;
      }

      triggerHaptic('medium');
      const updated = dailyMissions.map((m) =>
        m.id === missionId ? { ...m, claimed: true } : m
      );

      await persistMissions(updated);

      // Award TJ points
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            tjBalance: increment(mission.reward),
            jamBalance: increment(mission.reward),
          });
        } catch (error) {
          console.warn('Failed to increment TJ in Firestore:', error);
        }
      }

      // Dispatch local balance change event
      window.dispatchEvent(
        new CustomEvent('tonjam_tj_reward_claimed', {
          detail: { amount: mission.reward, missionId },
        })
      );

      toast.success(`Claimed +${mission.reward} TJ!`, {
        description: `Mission "${mission.title}" rewarded to your balance.`,
      });

      return true;
    },
    [dailyMissions, persistMissions]
  );

  // Claim all-completed daily bonus
  const claimDailyBonus = useCallback(async (): Promise<boolean> => {
    const allCompleted = dailyMissions.length > 0 && dailyMissions.every((m) => m.completed);
    if (!allCompleted || hasClaimedDailyBonus) {
      return false;
    }

    triggerHaptic('heavy');
    await persistMissions(dailyMissions, true);

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          tjBalance: increment(dailyBonusReward),
          jamBalance: increment(dailyBonusReward),
        });
      } catch (error) {
        console.warn('Failed to update daily bonus in Firestore:', error);
      }
    }

    window.dispatchEvent(
      new CustomEvent('tonjam_tj_reward_claimed', {
        detail: { amount: dailyBonusReward, missionId: 'daily-bonus' },
      })
    );

    toast.success(`Daily Completion Bonus: +${dailyBonusReward} TJ!`, {
      description: 'You completed all daily missions today!',
    });

    return true;
  }, [dailyMissions, hasClaimedDailyBonus, persistMissions, dailyBonusReward]);

  // Global event listener for missions
  useEffect(() => {
    const handleMissionEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; amount?: number; entityId?: string }>;
      if (customEvent.detail && customEvent.detail.type) {
        recordMissionProgress(customEvent.detail.type, customEvent.detail.amount || 1, customEvent.detail.entityId);
      }
    };

    window.addEventListener('tonjam_mission_event', handleMissionEvent);
    return () => {
      window.removeEventListener('tonjam_mission_event', handleMissionEvent);
    };
  }, [recordMissionProgress]);

  const dailyCompletedCount = useMemo(
    () => dailyMissions.filter((m) => m.completed).length,
    [dailyMissions]
  );

  const allDailyCompleted = useMemo(
    () => dailyMissions.length > 0 && dailyMissions.every((m) => m.completed),
    [dailyMissions]
  );

  const value = useMemo(
    () => ({
      dailyMissions,
      activeDateKey,
      timeUntilReset,
      claimDailyMissionReward,
      recordMissionProgress,
      dailyStreak,
      dailyCompletedCount,
      allDailyCompleted,
      hasClaimedDailyBonus,
      claimDailyBonus,
      dailyBonusReward,
      isSyncing,
    }),
    [
      dailyMissions,
      activeDateKey,
      timeUntilReset,
      claimDailyMissionReward,
      recordMissionProgress,
      dailyStreak,
      dailyCompletedCount,
      allDailyCompleted,
      hasClaimedDailyBonus,
      claimDailyBonus,
      dailyBonusReward,
      isSyncing,
    ]
  );

  return <TJContext.Provider value={value}>{children}</TJContext.Provider>;
};

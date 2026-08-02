// Utility & storage manager for User Listen Streak & Reward NFT Badges

export interface ListenStreakBadge {
  id: string;
  name: string;
  streakRequired: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  description: string;
  perk: string;
  badgeImageUrl: string;
  color: string;
  gradient: string;
  accentBorder: string;
  glowColor: string;
}

export interface ListenStreakData {
  currentStreak: number;
  longestStreak: number;
  lastListenDate: string; // YYYY-MM-DD
  historyDates: string[]; // List of YYYY-MM-DD dates
  claimedBadgeIds: string[];
  streakFrozen: boolean;
  totalDaysListened: number;
}

export const STREAK_BADGES: ListenStreakBadge[] = [
  {
    id: 'streak-3',
    name: 'Spark Listener',
    streakRequired: 3,
    tier: 'bronze',
    rarity: 'Common',
    description: 'Awarded for tuning into TON JAM audio frequencies for 3 consecutive days.',
    perk: '+5% JamPoints Multiplier & Bronze Profile Aura',
    badgeImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    color: '#D97706',
    gradient: 'from-amber-600 via-orange-500 to-yellow-600',
    accentBorder: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/20'
  },
  {
    id: 'streak-7',
    name: 'Flame Collector',
    streakRequired: 7,
    tier: 'silver',
    rarity: 'Rare',
    description: 'Maintained a full 1-week continuous listening loop on TON JAM on-chain soundscapes.',
    perk: '+15% JamPoints Multiplier & Early Access to Drops',
    badgeImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    color: '#38BDF8',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    accentBorder: 'border-cyan-400/40',
    glowColor: 'shadow-cyan-500/25'
  },
  {
    id: 'streak-14',
    name: 'Sonic Blaze',
    streakRequired: 14,
    tier: 'gold',
    rarity: 'Epic',
    description: 'Achieved a 2-week uninterrupted audio streak across active community broadcasts.',
    perk: '+25% JamPoints Multiplier & Gold Halo Badge',
    badgeImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    color: '#EAB308',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    accentBorder: 'border-yellow-400/40',
    glowColor: 'shadow-yellow-500/30'
  },
  {
    id: 'streak-30',
    name: 'Sound Wave Titan',
    streakRequired: 30,
    tier: 'platinum',
    rarity: 'Legendary',
    description: 'A legendary 1-month continuous music journey. Your listening node is unbreakable.',
    perk: '+50% JamPoints Multiplier & Zero Gas Marketplace Mint Fee',
    badgeImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
    color: '#A855F7',
    gradient: 'from-purple-500 via-fuchsia-600 to-pink-600',
    accentBorder: 'border-purple-400/40',
    glowColor: 'shadow-purple-500/35'
  },
  {
    id: 'streak-60',
    name: 'TON JAM Legend',
    streakRequired: 60,
    tier: 'mythic',
    rarity: 'Mythic',
    description: 'The highest acoustic honor on TON JAM. 60 consecutive days of unwavering audio passion.',
    perk: '+100% JamPoints Multiplier & Mythic Crown Avatar Effect',
    badgeImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop',
    color: '#F43F5E',
    gradient: 'from-rose-500 via-red-600 to-amber-500',
    accentBorder: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/40'
  }
];

const STORAGE_KEY = 'tonjam_listen_streak_v1';

export function getTodayIsoDate(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getYesterdayIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getInitialListenStreakData(): ListenStreakData {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 5,
      longestStreak: 12,
      lastListenDate: getTodayIsoDate(),
      historyDates: [getTodayIsoDate(), getYesterdayIsoDate()],
      claimedBadgeIds: ['streak-3'],
      streakFrozen: false,
      totalDaysListened: 18
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: ListenStreakData = JSON.parse(raw);
      
      // Calculate date difference from last listen date
      const today = getTodayIsoDate();
      const yesterday = getYesterdayIsoDate();

      if (parsed.lastListenDate !== today && parsed.lastListenDate !== yesterday) {
        // If more than 1 day missed and not frozen, reset current streak to 0
        if (!parsed.streakFrozen) {
          parsed.currentStreak = 0;
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse listen streak data:', err);
  }

  // Default seed data for immediate vibrant preview
  const defaultData: ListenStreakData = {
    currentStreak: 5,
    longestStreak: 12,
    lastListenDate: getTodayIsoDate(),
    historyDates: generateRecentDates(5),
    claimedBadgeIds: ['streak-3'],
    streakFrozen: false,
    totalDaysListened: 18
  };

  saveListenStreakData(defaultData);
  return defaultData;
}

function generateRecentDates(daysCount: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function saveListenStreakData(data: ListenStreakData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save listen streak data:', err);
  }
}

export function recordListenActivity(): { data: ListenStreakData; newlyUnlockedBadge?: ListenStreakBadge } {
  const current = getInitialListenStreakData();
  const today = getTodayIsoDate();
  const yesterday = getYesterdayIsoDate();

  if (current.lastListenDate === today) {
    // Already listened today!
    return { data: current };
  }

  let nextStreak = current.currentStreak;
  if (current.lastListenDate === yesterday) {
    nextStreak += 1;
  } else {
    // Break or new streak
    nextStreak = 1;
  }

  const newHistory = Array.from(new Set([today, ...current.historyDates]));
  const updatedData: ListenStreakData = {
    ...current,
    currentStreak: nextStreak,
    longestStreak: Math.max(nextStreak, current.longestStreak),
    lastListenDate: today,
    historyDates: newHistory,
    totalDaysListened: current.totalDaysListened + 1
  };

  saveListenStreakData(updatedData);

  // Check if any badge was unlocked
  const newlyUnlocked = STREAK_BADGES.find(
    badge => nextStreak >= badge.streakRequired && !current.claimedBadgeIds.includes(badge.id)
  );

  return { data: updatedData, newlyUnlockedBadge: newlyUnlocked };
}

export function claimBadge(badgeId: string): ListenStreakData {
  const current = getInitialListenStreakData();
  if (!current.claimedBadgeIds.includes(badgeId)) {
    const updated = {
      ...current,
      claimedBadgeIds: [...current.claimedBadgeIds, badgeId]
    };
    saveListenStreakData(updated);
    return updated;
  }
  return current;
}

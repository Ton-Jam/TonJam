export type TaskCategory = 'All Tasks' | 'Daily' | 'Music' | 'Community' | 'Social' | 'History';

export type TaskStatus = 'available' | 'in_progress' | 'completed' | 'locked' | 'claimable';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  rewardAmount: number;
  category: TaskCategory;
  status: TaskStatus;
  progress?: number;
  total?: number;
  iconName?: 'music' | 'profile' | 'community' | 'artist' | 'daily' | 'zap' | 'crown' | 'share' | 'check' | 'clock';
  actionLabel?: string;
  prerequisite?: string;
  isFeatured?: boolean;
  actionTarget?: string;
  eligibility?: string;
  completedAt?: string;
}

export interface TaskFilterProps {
  activeCategory: TaskCategory;
  onSelectCategory: (category: TaskCategory) => void;
}

export interface CategoryColorTheme {
  bgTint: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  accentHex: string;
}

export const CATEGORY_COLORS: Record<TaskCategory, CategoryColorTheme> = {
  'All Tasks': {
    bgTint: 'bg-[#229ED9]/15',
    textColor: 'text-[#229ED9]',
    borderColor: 'border-[#229ED9]/30',
    glowColor: 'shadow-[#229ED9]/20',
    accentHex: '#229ED9',
  },
  'Music': {
    bgTint: 'bg-[#9B7CFF]/15',
    textColor: 'text-[#9B7CFF]',
    borderColor: 'border-[#9B7CFF]/30',
    glowColor: 'shadow-[#9B7CFF]/20',
    accentHex: '#9B7CFF',
  },
  'Daily': {
    bgTint: 'bg-[#FFC857]/15',
    textColor: 'text-[#FFC857]',
    borderColor: 'border-[#FFC857]/30',
    glowColor: 'shadow-[#FFC857]/20',
    accentHex: '#FFC857',
  },
  'Community': {
    bgTint: 'bg-[#2DD4BF]/15',
    textColor: 'text-[#2DD4BF]',
    borderColor: 'border-[#2DD4BF]/30',
    glowColor: 'shadow-[#2DD4BF]/20',
    accentHex: '#2DD4BF',
  },
  'Social': {
    bgTint: 'bg-[#229ED9]/15',
    textColor: 'text-[#229ED9]',
    borderColor: 'border-[#229ED9]/30',
    glowColor: 'shadow-[#229ED9]/20',
    accentHex: '#229ED9',
  },
  'History': {
    bgTint: 'bg-emerald-500/15',
    textColor: 'text-[#34D399]',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
    accentHex: '#34D399',
  },
};

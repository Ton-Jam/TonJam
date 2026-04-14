import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Users, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Sparkles
} from 'lucide-react';
import { TJ_COIN_ICON } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  earnings: number;
  change: 'up' | 'down' | 'stable';
  isPartner?: boolean;
}

const Leaderboard: React.FC = () => {
  const topEarners: LeaderboardEntry[] = [
    { rank: 1, name: 'Neon Voyager', avatar: 'https://picsum.photos/100/100?random=21', earnings: 124500, change: 'stable', isPartner: true },
    { rank: 2, name: 'CryptoPioneer', avatar: 'https://picsum.photos/100/100?random=50', earnings: 89200, change: 'up' },
    { rank: 3, name: 'Luna Ray', avatar: 'https://picsum.photos/100/100?random=24', earnings: 75400, change: 'down', isPartner: true },
    { rank: 4, name: 'Byte Beat', avatar: 'https://picsum.photos/100/100?random=22', earnings: 62100, change: 'up' },
    { rank: 5, name: 'Sarah Jenkins', avatar: 'https://picsum.photos/100/100?random=32', earnings: 54300, change: 'stable' },
    { rank: 6, name: 'Alex Rivera', avatar: 'https://picsum.photos/100/100?random=31', earnings: 48900, change: 'up' },
    { rank: 7, name: 'Echo Phase', avatar: 'https://picsum.photos/100/100?random=23', earnings: 42100, change: 'down' },
    { rank: 8, name: 'City Ghost', avatar: 'https://picsum.photos/100/100?random=25', earnings: 38500, change: 'up' },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-[10px] font-black text-muted-foreground/50">#{rank}</span>;
  };

  const getChangeIcon = (change: 'up' | 'down' | 'stable') => {
    if (change === 'up') return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (change === 'down') return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground/50" />;
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Hall of Fame</h2>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">The highest JAM earners in the ecosystem</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-3 rounded-lg bg-muted/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          Updated 2m ago
        </div>
      </div>

      <div className="bg-foreground/[0.02] rounded-3xl overflow-hidden">
        {/* Table Header - Hidden on small mobile */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_120px_120px] px-4 py-3 bg-muted/30 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
          <span>Rank</span>
          <span>Architect</span>
          <span className="text-right">Earnings</span>
          <span className="text-right">Status</span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/[0.02]">
          {topEarners.map((entry, idx) => (
            <motion.div 
              key={entry.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-[32px_1fr_auto] sm:grid-cols-[60px_1fr_120px_120px] px-3 sm:px-4 py-3 sm:py-4 items-center hover:bg-foreground/[0.03] transition-colors group gap-2 sm:gap-3"
            >
              <div className="flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img src={entry.avatar || getPlaceholderImage(`user-${entry.name}`)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" alt="" />
                  {entry.isPartner && (
                    <div className="absolute -right-0.5 -bottom-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <Sparkles className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-black text-foreground tracking-tight group-hover:text-blue-400 transition-colors uppercase truncate">{entry.name}</h4>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest truncate">
                      {entry.isPartner ? 'Partner' : 'Architect'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Earnings - Stacked on mobile */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                  <img src={TJ_COIN_ICON} className="w-2.5 h-2.5 sm:w-3 h-3 object-contain" alt="" />
                  <span className="text-xs sm:text-sm font-black text-foreground tracking-tighter">
                    {entry.earnings.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5 sm:hidden">
                  {getChangeIcon(entry.change)}
                  <span className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    {entry.change === 'stable' ? 'Stable' : entry.change === 'up' ? 'Rising' : 'Falling'}
                  </span>
                </div>
              </div>

              {/* Status - Hidden on mobile, shown in earnings stack */}
              <div className="hidden sm:flex items-center justify-end gap-2">
                {getChangeIcon(entry.change)}
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  {entry.change === 'stable' ? 'Stable' : entry.change === 'up' ? 'Rising' : 'Falling'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;

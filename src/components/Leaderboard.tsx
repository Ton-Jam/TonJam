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
    return <span className="text-[10px] font-black text-white/20">#{rank}</span>;
  };

  const getChangeIcon = (change: 'up' | 'down' | 'stable') => {
    if (change === 'up') return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (change === 'down') return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-white/20" />;
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Hall of Fame</h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">The highest JAM earners in the ecosystem</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
          <TrendingUp className="w-3 h-3" />
          Updated 2m ago
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[60px_1fr_120px_120px] px-8 py-4 bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/20">
          <span>Rank</span>
          <span>Architect</span>
          <span className="text-right">Earnings</span>
          <span className="text-right">Status</span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {topEarners.map((entry, idx) => (
            <motion.div 
              key={entry.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-[60px_1fr_120px_120px] px-8 py-5 items-center hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={entry.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                  {entry.isPartner && (
                    <div className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-black flex items-center justify-center">
                      <Sparkles className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase">{entry.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                      {entry.isPartner ? 'Verified Partner' : 'Sonic Architect'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <img src={TJ_COIN_ICON} className="w-3 h-3 object-contain" alt="" />
                  <span className="text-sm font-black text-white tracking-tighter">
                    {entry.earnings.toLocaleString()}
                  </span>
                </div>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">JAM</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                {getChangeIcon(entry.change)}
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
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

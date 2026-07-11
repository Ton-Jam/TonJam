import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FanLeaderboardWidgetProps {
  artistId?: string;
}

const FanLeaderboardWidget: React.FC<FanLeaderboardWidgetProps> = () => {
  // Mock fan leaderboard data
  const topFans = useMemo(() => [
    { name: 'Whale_Watcher', spent: 1250.50, items: 42, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Whale', rank: 1, color: 'from-primary/40 to-primary/10' },
    { name: 'Crypto_Queen', spent: 840.20, items: 28, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen', rank: 2, color: 'from-verified/40 to-verified/10' },
    { name: 'Bass_Drop_Don', spent: 620.00, items: 15, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bass', rank: 3, color: 'from-success/40 to-success/10' },
    { name: 'NFT_Ninja', spent: 450.80, items: 12, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja', rank: 4 },
    { name: 'Ton_Titan', spent: 380.50, items: 10, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Titan', rank: 5 },
  ], []);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={itemVariants} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Supporter Rankings
          </h3>
          <p className="text-caption uppercase mt-1">Global contribution leaderboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Alpha Season 1</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topFans.slice(0, 3).map((fan) => (
          <motion.div 
            key={fan.name}
            whileHover={{ y: -5 }}
            className="relative bg-surface border border-divider p-6 rounded-card overflow-hidden group"
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 blur-2xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity", fan.color)} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative">
                <img src={fan.avatar} className="w-16 h-16 rounded-2xl bg-background border border-divider p-1" alt="" />
                <div className={cn("absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-background shadow-xl bg-background")}>
                  {fan.rank === 1 && <Crown className="w-4 h-4 text-primary" />}
                  {fan.rank === 2 && <Medal className="w-4 h-4 text-verified" />}
                  {fan.rank === 3 && <Trophy className="w-4 h-4 text-success" />}
                </div>
              </div>
              <div className="text-right">
                <p className="text-caption uppercase">Position</p>
                <p className="text-xl font-black text-text-primary">#0{fan.rank}</p>
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-black text-text-primary mb-4 truncate">{fan.name}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption uppercase">Volume</p>
                  <p className="text-sm font-black text-success font-mono">{fan.spent.toFixed(2)} <span className="text-[10px]">TON</span></p>
                </div>
                <div>
                  <p className="text-caption uppercase">Artifacts</p>
                  <p className="text-sm font-black text-text-primary font-mono">{fan.items}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Extended List */}
      <div className="bg-surface border border-divider rounded-card overflow-hidden">
        <div className="divide-y divide-divider">
          {topFans.slice(3).map((fan) => (
            <div key={fan.name} className="flex items-center justify-between p-4 px-6 hover:bg-background/20 transition-colors group">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-text-muted w-4">#{fan.rank}</span>
                <img src={fan.avatar} className="w-10 h-10 rounded-xl bg-background border border-divider" alt="" />
                <div>
                  <p className="text-xs font-black text-text-primary">{fan.name}</p>
                  <p className="text-[10px] font-bold text-text-muted">{fan.items} items collected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-success font-mono">{fan.spent.toFixed(2)} TON</p>
                <p className="text-caption uppercase">Total Value</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FanLeaderboardWidget;

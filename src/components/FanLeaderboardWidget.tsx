import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Gem } from 'lucide-react';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface FanLeaderboardWidgetProps {
  artistId?: string;
}

interface FanRankingEntry {
  uid?: string;
  name: string;
  spent: number;
  items: number;
  avatar: string;
  rank: number;
  color?: string;
}

const FanLeaderboardWidget: React.FC<FanLeaderboardWidgetProps> = ({ artistId }) => {
  const navigate = useNavigate();
  const [topFans, setTopFans] = useState<FanRankingEntry[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'nftSales'), limit(200)),
      (snap) => {
        const totals: Record<string, { uid?: string; name: string; spent: number; items: number; avatar?: string }> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (artistId && data.artistId && data.artistId !== artistId) return;
          const key = data.buyerId || data.buyerAddress || data.buyerName;
          if (!key) return;
          const amount = parseFloat(String(data.salePrice ?? data.price ?? 0)) || 0;
          if (!totals[key]) {
            totals[key] = {
              uid: data.buyerId,
              name: data.buyerName || (String(key).length > 12 ? `${String(key).slice(0, 6)}...${String(key).slice(-4)}` : String(key)),
              spent: 0,
              items: 0,
              avatar: data.buyerAvatar,
            };
          }
          totals[key].spent += amount;
          totals[key].items += 1;
        });

        const colors = [
          'from-primary/40 to-primary/10',
          'from-verified/40 to-verified/10',
          'from-success/40 to-success/10',
        ];
        const sorted = Object.entries(totals)
          .sort((a, b) => b[1].spent - a[1].spent)
          .slice(0, 10)
          .map(([key, info], idx) => ({
            uid: info.uid,
            name: info.name,
            spent: info.spent,
            items: info.items,
            avatar: info.avatar || getPlaceholderImage(`fan-${key}`),
            rank: idx + 1,
            color: colors[idx],
          }));

        setTopFans(sorted);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'nftSales')
    );

    return () => unsubscribe();
  }, [artistId]);

  const handleFanClick = (fan: FanRankingEntry) => {
    if (fan.uid) {
      navigate(`/user/${fan.uid}`);
    }
  };

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
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live On-Chain</span>
        </div>
      </div>

      {topFans.length === 0 ? (
        <div className="bg-surface p-8 rounded-card text-center text-xs text-text-muted">
          No collector activity recorded yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topFans.slice(0, 3).map((fan) => (
              <motion.div 
                key={fan.name}
                whileHover={{ y: -5 }}
                onClick={() => handleFanClick(fan)}
                className="relative bg-surface border border-divider p-6 rounded-card overflow-hidden group cursor-pointer"
              >
                <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 blur-2xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity", fan.color)} />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="relative">
                    <img src={fan.avatar} className="w-16 h-16 rounded-2xl bg-background border border-divider p-1 object-cover" alt="" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-background shadow-xl bg-background">
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

          {topFans.length > 3 && (
            <div className="bg-surface border border-divider rounded-card overflow-hidden">
              <div className="divide-y divide-divider">
                {topFans.slice(3).map((fan) => (
                  <div 
                    key={fan.name} 
                    onClick={() => handleFanClick(fan)}
                    className="flex items-center justify-between p-4 px-6 hover:bg-background/20 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-text-muted w-4">#{fan.rank}</span>
                      <img src={fan.avatar} className="w-10 h-10 rounded-xl bg-background border border-divider object-cover" alt="" />
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
          )}
        </>
      )}
    </motion.div>
  );
};

export default FanLeaderboardWidget;

import React, { useEffect, useState } from 'react';
import { Trophy, ChevronUp } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface CommunityContributor {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isArtist: boolean;
  score: number;
  badge: string;
}

export const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<CommunityContributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadLeaders() {
      try {
        const snap = await getDocs(query(collection(db, 'users'), limit(50)));
        const rows = snap.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const score = Number(data.tjBalance || data.contributionPoints || data.followers || 0);
            const isArtist = Boolean(data.isVerifiedArtist);
            return {
              id: docSnap.id,
              name: data.name || 'TonJam Member',
              username: data.username || (data.handle ? `@${data.handle}` : ''),
              avatar: data.avatarUrl || data.avatar || '/default-avatar.png',
              isVerified: Boolean(data.isVerifiedArtist || data.isVerified),
              isArtist,
              score,
              badge: isArtist ? 'Verified Artist' : 'Community Member',
            };
          })
          .filter((item) => item.score > 0 || item.isVerified)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map((item, index) => ({ ...item, rank: index + 1 }));

        if (isMounted) setLeaders(rows);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLeaders();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white/[0.03] rounded-2xl p-5 space-y-4 border-none">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="section-title">TON Community Leaderboard</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
              Top contributors, artists & fans
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Live Firestore Ledger</span>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-400">
          No ranked contributors in Firestore yet.
        </div>
      ) : (
        <div className="space-y-1">
          {leaders.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => navigate(item.isArtist ? `/artist/${item.id}` : `/user/${item.id}`)}
              className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex items-center justify-center shrink-0 w-6">
                  {idx === 0 ? (
                    <span className="text-xl">🥇</span>
                  ) : idx === 1 ? (
                    <span className="text-xl">🥈</span>
                  ) : idx === 2 ? (
                    <span className="text-xl">🥉</span>
                  ) : (
                    <span className="text-sm font-mono font-bold text-zinc-500">#{item.rank}</span>
                  )}
                </div>

                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 bg-slate-800"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate hover:underline">
                      {item.name}
                    </span>
                    {item.isVerified && (
                      <span className="w-3 h-3 rounded-full bg-[#00B4D8] text-black flex items-center justify-center text-[7px] font-extrabold select-none shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.username && (
                      <span className="text-[10px] font-mono font-bold text-zinc-400">{item.username}</span>
                    )}
                    <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border-none">
                      {item.badge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-extrabold text-white font-mono">{item.score.toLocaleString()}</span>
                  <span className="text-[9px] text-[#00B4D8] font-bold uppercase tracking-wider">Score</span>
                </div>
                <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Trophy, Award, Sparkles, ChevronUp } from 'lucide-react';
import { MOCK_LEADERBOARD } from '../mock';

export const Leaderboard: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">TON Community Leaderboard</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Top contributors, artists & helpful fans</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Weekly Ledger resets in 2d</span>
      </div>

      <div className="divide-y divide-white/[0.02]">
        {MOCK_LEADERBOARD.map((item, idx) => {
          const isTopThree = idx < 3;
          return (
            <div 
              key={item.user.id} 
              className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1"
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
                    <span className="text-sm font-mono font-bold text-slate-500">#{item.rank}</span>
                  )}
                </div>

                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/5 shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate hover:underline cursor-pointer">
                      {item.user.name}
                    </span>
                    {item.user.isVerified && (
                      <span className="w-3 h-3 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-[7px] font-bold select-none shrink-0">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{item.user.username}</span>
                    <span className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {item.badge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-extrabold text-white font-mono">{item.score.toLocaleString()}</span>
                  <span className="text-[9px] text-[#0052FF] font-bold uppercase tracking-wider">Points</span>
                </div>
                <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

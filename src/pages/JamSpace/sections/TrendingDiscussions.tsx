import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Users, Clock, Flame } from 'lucide-react';

interface Discussion {
  id: string;
  topic: string;
  hashtag: string;
  repliesCount: number;
  participantsCount: number;
  lastActivity: string;
}

export const TrendingDiscussions: React.FC = () => {
  const discussions: Discussion[] = [
    {
      id: 'd-1',
      topic: 'Is Amapiano log drum compression getting too extreme in recent Johannesburg club releases?',
      hashtag: '#LogDrumMastery',
      repliesCount: 142,
      participantsCount: 89,
      lastActivity: '3m ago'
    },
    {
      id: 'd-2',
      topic: 'Best parameters for splitting vocal stems as audio NFTs on TON without losing transient frequencies.',
      hashtag: '#StemsNFT',
      repliesCount: 86,
      participantsCount: 45,
      lastActivity: '12m ago'
    },
    {
      id: 'd-3',
      topic: 'Synth Summer Sound Clash: Virtual Moog vs Prophet-6 for modern retrowave baseline saturation.',
      hashtag: '#SynthSummer',
      repliesCount: 64,
      participantsCount: 38,
      lastActivity: '24m ago'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#0052FF]" />
          <h2 className="section-title">Trending Discussions</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Dynamic Node Ledger</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {discussions.map((disc, idx) => (
          <motion.div
            key={disc.id}
            className="bg-transparent hover:bg-white/[0.02] p-3.5 rounded-xl flex flex-col justify-between border-none transition-colors"
            whileHover={{ y: -2 }}
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0052FF]">{disc.hashtag}</span>
              <p className="text-sm font-semibold text-white tracking-tight leading-snug line-clamp-3">
                {disc.topic}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  {disc.repliesCount}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {disc.participantsCount}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px]">
                <Clock className="w-3 h-3" />
                {disc.lastActivity}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

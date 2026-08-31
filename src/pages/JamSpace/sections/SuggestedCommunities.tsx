import React from 'react';
import { motion } from 'motion/react';
import { Compass, Users, Check, Plus } from 'lucide-react';
import { Community } from '../types';

interface SuggestedCommunitiesProps {
  communities: Community[];
  onToggleCommunity: (id: string) => void;
}

export const SuggestedCommunities: React.FC<SuggestedCommunitiesProps> = ({
  communities,
  onToggleCommunity
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <h2 className="section-title">Recommended Guilds</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Expand Collective Networks</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {communities.map((comm) => (
          <motion.div
            key={comm.id}
            className="bg-slate-900 border border-white/[0.03] rounded-[10px] overflow-hidden flex flex-col justify-between"
            whileHover={{ y: -2 }}
          >
            <div>
              <div className="relative h-24 bg-slate-950">
                <img
                  src={comm.imageUrl}
                  alt={comm.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-extrabold bg-[#0052FF] text-white rounded-[10px] uppercase tracking-wider">
                  {comm.category}
                </span>
              </div>

              <div className="p-4 space-y-1.5">
                <h4 className="text-xs font-extrabold text-white tracking-tight line-clamp-1 leading-snug">
                  {comm.name}
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-3">
                  {comm.description}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{comm.memberCount.toLocaleString()}</span>
              </div>

              <button
                onClick={() => onToggleCommunity(comm.id)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer transition-colors flex items-center gap-1 ${
                  comm.joined
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#0052FF] text-white hover:bg-[#0052FF]/95'
                }`}
              >
                {comm.joined ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    <span>JOINED</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>JOIN CLUB</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

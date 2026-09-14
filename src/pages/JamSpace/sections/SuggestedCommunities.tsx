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
            className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl overflow-hidden flex flex-col justify-between border-none transition-colors"
            whileHover={{ y: -2 }}
          >
            <div>
              <div className="relative h-24 bg-white/[0.02]">
                <img
                  src={comm.imageUrl}
                  alt={comm.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-extrabold bg-[#00B4D8] text-black rounded-md uppercase tracking-wider">
                  {comm.category}
                </span>
              </div>

              <div className="p-4 space-y-1.5">
                <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1 leading-snug">
                  {comm.name}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans line-clamp-3 font-normal">
                  {comm.description}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>{comm.memberCount.toLocaleString()}</span>
              </div>

              <button
                onClick={() => onToggleCommunity(comm.id)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors flex items-center gap-1 border-none ${
                  comm.joined
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[#00B4D8] text-black hover:bg-[#00B4D8]/90'
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
                    <span>JOIN</span>
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

import React from 'react';
import { History, ArrowRight, Heart, MessageSquare, Gem, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityEvent, MOCK_ACTIVITY_LOGS } from '@/components/profile/ProfileTypes';

export const ActivityCard: React.FC = () => {
  const logs = MOCK_ACTIVITY_LOGS.slice(0, 3);

  const getLogIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
      case 'nft_purchase':
      case 'nft_sale':
        return <Gem className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#101A3B] rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Interactive Events Audit
            </span>
            <h4 className="text-sm font-bold text-slate-200">Activity Ledger</h4>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
            <History className="w-5 h-5" />
          </div>
        </div>

        {/* Ledger logs list */}
        <div className="space-y-2.5 mb-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-white/5 rounded-md shrink-0">
                  {getLogIcon(log.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{log.title}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{log.description}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-500 shrink-0 uppercase tracking-wide">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>View Full Activity Ledger</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default ActivityCard;

import React from 'react';
import { Heart, MessageSquare, Share2, ShoppingCart, Coins, UserPlus, Clock } from 'lucide-react';
import { ActivityEvent, MOCK_ACTIVITY_LOGS } from './ProfileTypes';

export const ActivityTab: React.FC = () => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-400 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-[#0052FF]" />;
      case 'nft_purchase':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'nft_sale':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3.5 text-white font-sans pb-8">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Recent Activity Logs
      </h3>

      <div className="space-y-2.5">
        {MOCK_ACTIVITY_LOGS.map((log) => (
          <div
            key={log.id}
            className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4 flex gap-4 items-start hover:bg-[#15234f] transition-all"
          >
            {/* Round action tag */}
            <div className="p-2.5 bg-white/5 rounded-full shrink-0">
              {getEventIcon(log.type)}
            </div>

            {/* Action Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                  {log.title}
                </h4>
                <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
                  {log.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {log.description}
              </p>
              
              {log.metadata?.commentText && (
                <div className="mt-2.5 p-3 bg-white/5 rounded-[8px] text-xs font-medium italic border-l-2 border-[#0052FF] text-slate-300">
                  "{log.metadata.commentText}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

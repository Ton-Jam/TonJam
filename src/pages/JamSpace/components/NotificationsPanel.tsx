import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, MessageSquare, UserCheck, AtSign, Compass, Trash2, CheckSquare } from 'lucide-react';
import { JamSpaceNotification } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: JamSpaceNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-slate-900 border-l border-white/5 shadow-2xl flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.03]">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#0052FF]" />
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-white">Transmission Logs</h4>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Dynamic Social Notifications</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={onMarkAllRead}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-[10px] text-[10px] font-bold text-[#0052FF] uppercase tracking-wider cursor-pointer"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
            <CheckSquare className="w-12 h-12 text-slate-750 mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Node state is quiet</p>
            <p className="text-[10px] text-slate-600 mt-1">No recent social signals received</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const Icon = notif.type === 'like' ? Heart 
                : notif.type === 'reply' ? MessageSquare 
                : notif.type === 'mention' ? AtSign 
                : notif.type === 'follow' ? UserCheck 
                : Compass;

              const iconColor = notif.type === 'like' ? 'text-red-400 bg-red-400/10'
                : notif.type === 'reply' ? 'text-blue-400 bg-blue-400/10'
                : notif.type === 'mention' ? 'text-purple-400 bg-purple-400/10'
                : notif.type === 'follow' ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-amber-400 bg-amber-400/10';

              return (
                <motion.div
                  key={notif.id}
                  onClick={() => onMarkRead(notif.id)}
                  className={`p-3 rounded-[10px] border transition-all cursor-pointer flex gap-3 items-start ${
                    notif.read 
                      ? 'bg-slate-950/20 border-white/[0.01]' 
                      : 'bg-slate-950 border-[#0052FF]/20 hover:border-[#0052FF]/40'
                  }`}
                  whileHover={{ x: -2 }}
                >
                  <img
                    src={notif.user.avatar}
                    alt={notif.user.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/5"
                  />

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{notif.user.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {notif.content}
                    </p>
                  </div>

                  <div className={`p-1.5 rounded-full shrink-0 ${iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

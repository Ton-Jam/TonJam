import React from 'react';
import { motion, PanInfo, useAnimation } from 'motion/react';
import { cn } from '@/lib/utils';
import { 
  Play, 
  UserPlus, 
  MessageSquare, 
  Eye, 
  Gift, 
  HelpCircle, 
  Gavel, 
  Sparkles, 
  Trash2, 
  Check, 
  Music, 
  Heart, 
  Gem, 
  Coins, 
  Cpu, 
  Flame, 
  Send 
} from 'lucide-react';
import { TonJamNotification, NotificationCategory, NotificationQuickAction } from './types';

interface NotificationCardProps {
  notification: TonJamNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onActionClick: (action: NotificationQuickAction, notification: TonJamNotification) => void;
}

export const formatTimeAgo = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const CATEGORY_META: Record<NotificationCategory, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  music: { icon: Music, color: 'text-indigo-400 bg-indigo-500/15', label: 'Music' },
  artist_release: { icon: Flame, color: 'text-amber-400 bg-amber-500/15', label: 'Artist Drop' },
  follower: { icon: UserPlus, color: 'text-blue-400 bg-blue-500/15', label: 'Social' },
  like: { icon: Heart, color: 'text-rose-400 bg-rose-500/15', label: 'Resonance' },
  comment: { icon: MessageSquare, color: 'text-teal-400 bg-teal-500/15', label: 'Comment' },
  mention: { icon: Send, color: 'text-purple-400 bg-purple-500/15', label: 'Mention' },
  playlist_share: { icon: Music, color: 'text-pink-400 bg-pink-500/15', label: 'Playlist' },
  track_share: { icon: Play, color: 'text-violet-400 bg-violet-500/15', label: 'Track Share' },
  nft_sale: { icon: Gem, color: 'text-cyan-400 bg-cyan-500/15', label: 'NFT Sale' },
  nft_purchase: { icon: Gem, color: 'text-emerald-400 bg-emerald-500/15', label: 'NFT Acquired' },
  auction: { icon: Gavel, color: 'text-orange-400 bg-orange-500/15', label: 'Auction' },
  marketplace: { icon: Sparkles, color: 'text-yellow-400 bg-yellow-500/15', label: 'Market' },
  wallet_transaction: { icon: Coins, color: 'text-green-400 bg-green-500/15', label: 'Wallet' },
  royalty: { icon: Coins, color: 'text-sky-400 bg-sky-500/15', label: 'Royalty' },
  tj_reward: { icon: Gift, color: 'text-amber-400 bg-amber-500/15', label: 'Reward' },
  mission: { icon: Play, color: 'text-orange-400 bg-orange-500/15', label: 'Mission' },
  system: { icon: Cpu, color: 'text-slate-400 bg-slate-500/15', label: 'System' },
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  play: Play,
  follow: UserPlus,
  reply: MessageSquare,
  view: Eye,
  claim: Gift,
  join: Sparkles,
  bid: Gavel,
  mint: Gem,
  dismiss: Trash2,
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete,
  onActionClick,
}) => {
  const cardControls = useAnimation();
  const meta = CATEGORY_META[notification.category] || { icon: HelpCircle, color: 'text-slate-400 bg-white/[0.05]', label: 'Alert' };
  const CategoryIcon = meta.icon;
  const isUnread = !notification.read;

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x < -threshold) {
      // Swiped Left -> Delete
      await cardControls.start({ x: '-100%', opacity: 0, transition: { duration: 0.2 } });
      onDelete(notification.id);
    } else if (info.offset.x > threshold) {
      // Swiped Right -> Mark Read
      onMarkRead(notification.id);
      cardControls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    } else {
      cardControls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
    }
  };

  const ActionIcon = notification.quickAction ? ACTION_ICONS[notification.quickAction.type] || HelpCircle : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white/[0.02] select-none">
      {/* BACKGROUND SWIPE ACTIONS INDICATORS */}
      <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none z-0">
        <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[9px] uppercase tracking-wider">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>Read</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400 font-black text-[9px] uppercase tracking-wider">
          <span>Dismiss</span>
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
        </div>
      </div>

      {/* SWIPEABLE LAYER */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        animate={cardControls}
        style={{ x: 0 }}
        onClick={() => {
          if (isUnread) {
            onMarkRead(notification.id);
          }
        }}
        className={`
          relative z-10 w-full p-3 rounded-2xl flex items-start gap-3
          transition-colors duration-200 touch-pan-y cursor-pointer
          ${isUnread 
            ? 'bg-[#101A3B]' 
            : 'bg-white/[0.03] hover:bg-white/[0.06]'
          }
        `}
      >
        {/* AVATAR OR CATEGORY CIRCLE */}
        <div className="relative shrink-0 select-none">
          {notification.avatarUrl ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-900 shadow-md">
              <img 
                src={notification.avatarUrl} 
                alt="" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md", meta.color)}>
              <CategoryIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          )}

          {notification.avatarUrl && (
            <div className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-md", meta.color)}>
              <CategoryIcon className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* MIDDLE TEXT AREA */}
        <div className="flex-1 min-w-0 flex flex-col text-left">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn("text-[9px] font-black uppercase tracking-wider", isUnread ? 'text-[#0088CC]' : 'text-slate-400')}>
              {meta.label}
            </span>
            <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>

          <h4 className={cn("text-xs sm:text-sm font-bold tracking-tight leading-snug truncate", isUnread ? 'text-white' : 'text-slate-300')}>
            {notification.title}
          </h4>

          <p className="text-xs text-slate-400 font-normal mt-0.5 select-none line-clamp-2 leading-relaxed">
            {notification.description}
          </p>

          {/* SNAPPY QUICK ACTION BUTTONS */}
          {notification.quickAction && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (notification.quickAction) {
                    onActionClick(notification.quickAction, notification);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full h-7 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm",
                  notification.quickAction.type === 'claim'
                    ? "bg-amber-400 hover:bg-amber-300 text-black font-extrabold"
                    : "bg-[#0052FF] hover:bg-[#1a66ff] text-white"
                )}
              >
                {ActionIcon && <ActionIcon className="w-3 h-3" />}
                <span>{notification.quickAction.label}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="px-2 rounded-full h-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* OPTIONAL ALBUM ART */}
        {notification.thumbnailUrl && (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 select-none shadow-md">
            <img 
              src={notification.thumbnailUrl} 
              alt="" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* UNREAD INDICATOR DOT */}
        {isUnread && (
          <div className="absolute top-3 right-3 flex h-2 w-2 select-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0088CC] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0088CC]"></span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationCard;

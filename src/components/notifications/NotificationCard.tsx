import React, { useRef } from 'react';
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
import { TonJamButton } from '@/components/ui/buttons/TonJamButton';
import { CardTitle, Label } from '@/components/ui/typography/Typography';

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
  music: { icon: Music, color: 'text-indigo-400 bg-indigo-500/10', label: 'Vibe Match' },
  artist_release: { icon: Flame, color: 'text-amber-400 bg-amber-500/10', label: 'Release Signal' },
  follower: { icon: UserPlus, color: 'text-blue-400 bg-blue-500/10', label: 'Telemetry Link' },
  like: { icon: Heart, color: 'text-rose-400 bg-rose-500/10', label: 'Resonance' },
  comment: { icon: MessageSquare, color: 'text-teal-400 bg-teal-500/10', label: 'Comment Portal' },
  mention: { icon: Send, color: 'text-purple-400 bg-purple-500/10', label: 'Mentioned' },
  playlist_share: { icon: Music, color: 'text-pink-400 bg-pink-500/10', label: 'Share Link' },
  track_share: { icon: Play, color: 'text-violet-400 bg-violet-500/10', label: 'Track Beam' },
  nft_sale: { icon: Gem, color: 'text-cyan-400 bg-cyan-500/10', label: 'NFT Ledger Sale' },
  nft_purchase: { icon: Gem, color: 'text-emerald-400 bg-emerald-500/10', label: 'NFT Secured' },
  auction: { icon: Gavel, color: 'text-orange-400 bg-orange-500/10', label: 'Auction Bid' },
  marketplace: { icon: Sparkles, color: 'text-yellow-400 bg-yellow-500/10', label: 'Market Feed' },
  wallet_transaction: { icon: Coins, color: 'text-green-400 bg-green-500/10', label: 'Wallet Entry' },
  royalty: { icon: Coins, color: 'text-sky-400 bg-sky-500/10', label: 'Royalty Stream' },
  tj_reward: { icon: Gift, color: 'text-red-400 bg-red-500/10', label: 'TJ Protocol Reward' },
  mission: { icon: Play, color: 'text-orange-400 bg-orange-500/10', label: 'Daily Telemetry' },
  system: { icon: Cpu, color: 'text-slate-400 bg-slate-500/10', label: 'Node Relay System' },
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
  const meta = CATEGORY_META[notification.category] || { icon: HelpCircle, color: 'text-text-muted bg-surface', label: 'Alert' };
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
    <div className="relative w-full overflow-hidden rounded-card bg-surface select-none border border-divider">
      {/* BACKGROUND SWIPE ACTIONS INDICATORS */}
      <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none z-0">
        <div className="flex items-center gap-1.5 text-success font-black text-[9px] uppercase tracking-wider">
          <Check className="w-3 h-3 shrink-0" />
          <span>Read</span>
        </div>
        <div className="flex items-center gap-1.5 text-error font-black text-[9px] uppercase tracking-wider">
          <span>Delete</span>
          <Trash2 className="w-3 h-3 shrink-0" />
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
        className={`
          relative z-10 w-full p-2 sm:p-2.5 rounded-card flex items-start gap-2 sm:gap-3
          transition-all duration-300 touch-pan-y
          ${isUnread 
            ? 'bg-primary/5 border-l-2 border-primary' 
            : 'bg-surface hover:bg-background/40'
          }
        `}
      >
        {/* AVATAR OR CATEGORY CIRCLE */}
        <div className="relative shrink-0 select-none">
          {notification.avatarUrl ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-background border border-divider">
              <img 
                src={notification.avatarUrl} 
                alt="" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center", meta.color)}>
              <CategoryIcon className="w-3 h-3 sm:w-4" />
            </div>
          )}

          {notification.avatarUrl && (
            <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-md ring-1 ring-background", meta.color)}>
              <CategoryIcon className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
            </div>
          )}
        </div>

         {/* MIDDLE TEXT AREA */}
        <div className="flex-1 min-w-0 flex flex-col text-left">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn("text-[8px] font-black uppercase tracking-wider", isUnread ? 'text-primary' : 'text-text-muted')}>
              {meta.label}
            </span>
            <span className="text-[8px] font-bold text-text-muted whitespace-nowrap">
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>

          <h4 className={cn("text-[11px] sm:text-xs font-black tracking-tight uppercase truncate leading-tight", isUnread ? 'text-text-primary' : 'text-text-muted')}>
            {notification.title}
          </h4>

          <p className="text-[10px] font-medium text-text-muted mt-0.5 select-none line-clamp-1">
            {notification.description}
          </p>

          {/* SNAPPY QUICK ACTION BUTTONS */}
          {notification.quickAction && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (notification.quickAction) {
                    onActionClick(notification.quickAction, notification);
                  }
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-button h-6 text-[8px] font-black uppercase tracking-wider transition-all",
                  notification.quickAction.type === 'claim'
                    ? "bg-primary text-black hover:scale-105"
                    : "bg-background text-text-primary hover:bg-divider"
                )}
              >
                {ActionIcon && <ActionIcon className="w-2.5 h-2.5" />}
                <span>{notification.quickAction.label}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="px-1.5 rounded-button h-6 text-text-muted hover:text-error transition-colors"
                title="Dismiss"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* OPTIONAL ALBUM ART */}
        {notification.thumbnailUrl && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 bg-background select-none border border-divider">
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
          <div className="absolute top-2 right-2 flex h-1 w-1 select-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1 w-1 bg-primary"></span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationCard;

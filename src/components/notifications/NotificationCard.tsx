import React, { useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'motion/react';
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
  const meta = CATEGORY_META[notification.category] || { icon: HelpCircle, color: 'text-slate-400 bg-slate-500/10', label: 'Alert' };
  const CategoryIcon = meta.icon;
  const isUnread = !notification.read;

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x < -threshold) {
      // Swiped Left -> Delete with beautiful animation
      await cardControls.start({ x: '-100%', opacity: 0, transition: { duration: 0.2 } });
      onDelete(notification.id);
    } else if (info.offset.x > threshold) {
      // Swiped Right -> Mark Read with beautiful spring back
      onMarkRead(notification.id);
      cardControls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    } else {
      // Recoil back to center
      cardControls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
    }
  };

  const ActionIcon = notification.quickAction ? ACTION_ICONS[notification.quickAction.type] || HelpCircle : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950/40 select-none">
      {/* BACKGROUND SWIPE ACTIONS INDICATORS (NO BORDERS) */}
      <div className="absolute inset-0 flex justify-between items-center px-6 pointer-events-none z-0">
        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
          <Check className="w-5 h-5 shrink-0" />
          <span>Read</span>
        </div>
        <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-wider">
          <span>Delete</span>
          <Trash2 className="w-5 h-5 shrink-0" />
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
          relative z-10 w-full p-4 rounded-2xl flex items-start gap-3.5
          transition-all duration-300 touch-pan-y
          ${isUnread 
            ? 'bg-gradient-to-r from-blue-500/10 to-transparent shadow-[inset_4px_0_0_rgba(59,130,246,1)]' 
            : 'bg-white/[0.02] hover:bg-white/[0.04]'
          }
        `}
      >
        {/* AVATAR OR CATEGORY CIRCLE */}
        <div className="relative shrink-0 select-none">
          {notification.avatarUrl ? (
            <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800">
              <img 
                src={notification.avatarUrl} 
                alt="" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${meta.color}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
          )}

          {/* Miniature sub-icon for avatar items */}
          {notification.avatarUrl && (
            <div className={`absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full flex items-center justify-center ${meta.color} shadow-md`}>
              <CategoryIcon className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

         {/* MIDDLE TEXT AREA */}
        <div className="flex-1 min-w-0 flex flex-col text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Label className={`text-[9px] font-black uppercase tracking-[0.15em] ${isUnread ? 'text-blue-400' : 'text-slate-500'}`}>
              {meta.label}
            </Label>
            <span className="text-[10px] font-medium text-slate-500">
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>

          <CardTitle className={`text-xs font-black tracking-normal uppercase truncate ${isUnread ? 'text-white' : 'text-slate-300'} border-none`}>
            {notification.title}
          </CardTitle>

          <p className="text-xs font-semibold leading-relaxed text-slate-400 mt-1 select-none">
            {notification.description}
          </p>

          {/* SNAPPY QUICK ACTION BUTTONS */}
          {notification.quickAction && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              <TonJamButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (notification.quickAction) {
                    onActionClick(notification.quickAction, notification);
                  }
                }}
                variant="primary"
                size="sm"
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg h-8
                  ${notification.quickAction.type === 'claim'
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white hover:brightness-110 shadow-red-500/10 border-none'
                    : ''
                  }
                `}
              >
                {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                <span>{notification.quickAction.label}</span>
              </TonJamButton>

              {/* Instant dismiss shortcut */}
              <TonJamButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                variant="outline"
                size="sm"
                className="px-2.5 py-1.5 rounded-lg h-8 text-slate-400 hover:text-white"
              >
                Dismiss
              </TonJamButton>
            </div>
          )}
        </div>

        {/* OPTIONAL ALBUM ART / NFT THUMBNAIL */}
        {notification.thumbnailUrl && (
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 select-none shadow-md">
            <img 
              src={notification.thumbnailUrl} 
              alt="" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* UNREAD GLOW PULSE INDICATOR DOT */}
        {isUnread && (
          <div className="absolute top-4 right-4 flex h-2 w-2 select-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationCard;

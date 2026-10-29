import React from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Repeat, 
  Music, 
  Disc3, 
  Sparkles, 
  Radio, 
  Gem, 
  Gavel, 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  BadgeCheck, 
  ShieldAlert,
  Coins,
  Gift
} from 'lucide-react';
import { TonJamNotification, NotificationQuickAction } from './types';
import MusicNotificationPreview from './MusicNotificationPreview';
import NFTNotificationPreview from './NFTNotificationPreview';
import SocialNotificationPreview from './SocialNotificationPreview';
import NotificationOverflowMenu from './NotificationOverflowMenu';
import { formatTimeAgo } from './NotificationCard';

interface NotificationItemProps {
  notification: TonJamNotification;
  onMarkRead: (id: string) => void;
  onToggleRead?: (id: string, currentRead: boolean) => void;
  onDelete: (id: string) => void;
  onActionClick: (action: NotificationQuickAction, notification: TonJamNotification) => void;
  onItemClick?: (notification: TonJamNotification) => void;
}

interface TypeMeta {
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  label: string;
}

const getTypeMeta = (notification: TonJamNotification): TypeMeta => {
  const { category, metadata } = notification;
  const subCategory = metadata?.subCategory;

  // Social interactions
  if (category === 'like') {
    return {
      icon: Heart,
      accentColor: 'text-[#F472B6]',
      badgeBg: 'bg-[#F472B6]/15',
      label: 'Like',
    };
  }
  if (category === 'comment' || category === 'mention') {
    return {
      icon: MessageSquare,
      accentColor: 'text-[#229ED9]',
      badgeBg: 'bg-[#229ED9]/15',
      label: category === 'mention' ? 'Mention' : 'Reply',
    };
  }
  if (category === 'follower') {
    return {
      icon: UserPlus,
      accentColor: 'text-[#2DD4BF]',
      badgeBg: 'bg-[#2DD4BF]/15',
      label: 'Follower',
    };
  }
  if (category === 'playlist_share' || subCategory === 'repost') {
    return {
      icon: Repeat,
      accentColor: 'text-[#9B7CFF]',
      badgeBg: 'bg-[#9B7CFF]/15',
      label: 'Shared',
    };
  }

  // Music Activity
  if (category === 'artist_release' || subCategory === 'new_release') {
    return {
      icon: Music,
      accentColor: 'text-[#9B7CFF]',
      badgeBg: 'bg-[#9B7CFF]/15',
      label: 'New Track',
    };
  }
  if (subCategory === 'album') {
    return {
      icon: Disc3,
      accentColor: 'text-[#229ED9]',
      badgeBg: 'bg-[#229ED9]/15',
      label: 'New Album',
    };
  }
  if (subCategory === 'jamspace' || metadata?.spaceId) {
    return {
      icon: Radio,
      accentColor: 'text-[#2DD4BF]',
      badgeBg: 'bg-[#2DD4BF]/15',
      label: 'JamSpace',
    };
  }
  if (category === 'music') {
    return {
      icon: Music,
      accentColor: 'text-[#9B7CFF]',
      badgeBg: 'bg-[#9B7CFF]/15',
      label: 'Music',
    };
  }

  // NFT Marketplace
  if (category === 'nft_sale' || subCategory === 'sale') {
    return {
      icon: Gem,
      accentColor: 'text-[#34D399]',
      badgeBg: 'bg-[#34D399]/15',
      label: 'NFT Sale',
    };
  }
  if (subCategory === 'outbid') {
    return {
      icon: AlertCircle,
      accentColor: 'text-[#FFC857]',
      badgeBg: 'bg-[#FFC857]/15',
      label: 'Outbid',
    };
  }
  if (category === 'auction' || subCategory === 'new_bid') {
    return {
      icon: Gavel,
      accentColor: 'text-[#9B7CFF]',
      badgeBg: 'bg-[#9B7CFF]/15',
      label: 'Bid',
    };
  }
  if (category === 'nft_purchase') {
    return {
      icon: CheckCircle2,
      accentColor: 'text-[#34D399]',
      badgeBg: 'bg-[#34D399]/15',
      label: 'Acquired',
    };
  }
  if (category === 'wallet_transaction' || category === 'royalty') {
    return {
      icon: Coins,
      accentColor: 'text-[#34D399]',
      badgeBg: 'bg-[#34D399]/15',
      label: category === 'royalty' ? 'Royalty' : 'Wallet',
    };
  }
  if (category === 'tj_reward') {
    return {
      icon: Gift,
      accentColor: 'text-[#FFC857]',
      badgeBg: 'bg-[#FFC857]/15',
      label: 'Reward',
    };
  }

  // Account and System
  if (subCategory === 'verification') {
    return {
      icon: BadgeCheck,
      accentColor: 'text-[#2DD4BF]',
      badgeBg: 'bg-[#2DD4BF]/15',
      label: 'Verified',
    };
  }
  if (subCategory === 'security') {
    return {
      icon: ShieldAlert,
      accentColor: 'text-[#FFC857]',
      badgeBg: 'bg-[#FFC857]/15',
      label: 'Security',
    };
  }

  return {
    icon: Shield,
    accentColor: 'text-[#229ED9]',
    badgeBg: 'bg-[#229ED9]/15',
    label: 'TonJam',
  };
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onToggleRead,
  onDelete,
  onActionClick,
  onItemClick,
}) => {
  const isUnread = !notification.read;
  const meta = getTypeMeta(notification);
  const Icon = meta.icon;

  const handleClick = () => {
    if (isUnread) {
      onMarkRead(notification.id);
    }
    if (onItemClick) {
      onItemClick(notification);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative w-full p-3.5 rounded-2xl flex items-start gap-3 transition-all duration-200 cursor-pointer select-none
        ${
          isUnread
            ? 'bg-[#142340] border border-[#229ED9]/25 shadow-sm shadow-[#229ED9]/5'
            : 'bg-[#111C30] hover:bg-[#16243E] border border-white/[0.04]'
        }
      `}
    >
      {/* AVATAR OR MEDIA THUMBNAIL WITH TYPE ACCENT BADGE */}
      <div className="relative shrink-0">
        {notification.avatarUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#080D1A] border border-white/[0.06]">
            <img
              src={notification.avatarUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : notification.thumbnailUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#080D1A] border border-white/[0.06]">
            <img
              src={notification.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.badgeBg} ${meta.accentColor} border border-white/[0.04]`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Small Category Accent Badge overlapping avatar */}
        {(notification.avatarUrl || notification.thumbnailUrl) && (
          <div
            className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center ${meta.badgeBg} ${meta.accentColor} border border-[#111C30] shadow-sm`}
          >
            <Icon className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      {/* CONTENT MIDDLE AREA */}
      <div className="flex-1 min-w-0 flex flex-col text-left">
        {/* TOP ROW: CATEGORY / SOURCE + TIMESTAMP + UNREAD PIN + MENU */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {notification.senderName ? (
              <div className="flex items-center gap-1 truncate">
                <span className="text-xs font-bold text-[#F5F7FB] truncate">
                  {notification.senderName}
                </span>
                {notification.isVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                )}
              </div>
            ) : (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${meta.accentColor}`}
              >
                {meta.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-[#94A3B8] font-medium whitespace-nowrap">
              {formatTimeAgo(notification.timestamp)}
            </span>

            {isUnread && (
              <span
                className="w-2 h-2 rounded-full bg-[#229ED9] shadow-sm shadow-[#229ED9]/50 shrink-0"
                title="Unread notification"
              />
            )}

            <NotificationOverflowMenu
              isRead={notification.read}
              onToggleRead={() => {
                if (onToggleRead) {
                  onToggleRead(notification.id, notification.read);
                } else {
                  onMarkRead(notification.id);
                }
              }}
              onDelete={() => onDelete(notification.id)}
            />
          </div>
        </div>

        {/* TITLE */}
        <h4
          className={`text-xs font-bold leading-snug tracking-tight ${
            isUnread ? 'text-[#F5F7FB]' : 'text-[#E2E8F0]'
          }`}
        >
          {notification.title}
        </h4>

        {/* DESCRIPTION */}
        <p className="text-xs text-[#94A3B8] font-normal mt-0.5 leading-relaxed line-clamp-2">
          {notification.description}
        </p>

        {/* CONTEXTUAL PREVIEWS */}
        {notification.musicPreview && (
          <MusicNotificationPreview
            preview={notification.musicPreview}
            onPreviewClick={() => {
              if (onItemClick) onItemClick(notification);
            }}
          />
        )}

        {notification.nftPreview && (
          <NFTNotificationPreview
            preview={notification.nftPreview}
            onViewNFT={() => {
              if (onItemClick) onItemClick(notification);
            }}
          />
        )}

        {notification.socialPreview && (
          <SocialNotificationPreview
            preview={notification.socialPreview}
            onPreviewClick={() => {
              if (onItemClick) onItemClick(notification);
            }}
          />
        )}

        {/* QUICK ACTION BUTTON */}
        {notification.quickAction && !notification.musicPreview && !notification.nftPreview && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (notification.quickAction) {
                  onActionClick(notification.quickAction, notification);
                }
              }}
              className="px-3 py-1 rounded-full text-xs font-bold bg-[#229ED9] hover:bg-[#1e8bc2] text-white transition-all active:scale-95 cursor-pointer shadow-sm shadow-[#229ED9]/20"
            >
              {notification.quickAction.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;

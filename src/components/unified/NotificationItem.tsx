import React from 'react';
import {
  Heart,
  MessageCircle,
  AtSign,
  UserPlus,
  Music,
  Disc3,
  Gavel,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UnifiedNotification } from './types';
import NotificationPreview from './NotificationPreview';
import NotificationUnreadIndicator from './NotificationUnreadIndicator';

interface NotificationItemProps {
  notification: UnifiedNotification;
  onItemClick?: (notification: UnifiedNotification) => void;
  onActionClick?: (notification: UnifiedNotification) => void;
  onPreviewPlay?: (notification: UnifiedNotification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onItemClick,
  onActionClick,
  onPreviewPlay,
}) => {
  // Category & subType visual accent mapping
  const getSubtypeConfig = () => {
    switch (notification.subType) {
      case 'like':
        return {
          icon: Heart,
          color: 'text-[#F472B6]',
          bg: 'bg-[#F472B6]/15',
        };
      case 'reply':
        return {
          icon: MessageCircle,
          color: 'text-[#2E8CEB]',
          bg: 'bg-[#2E8CEB]/15',
        };
      case 'mention':
        return {
          icon: AtSign,
          color: 'text-[#2E8CEB]',
          bg: 'bg-[#2E8CEB]/15',
        };
      case 'follower':
        return {
          icon: UserPlus,
          color: 'text-[#2DD4BF]',
          bg: 'bg-[#2DD4BF]/15',
        };
      case 'new_track':
      case 'new_album':
      case 'announcement':
        return {
          icon: Music,
          color: 'text-[#9B7CFF]',
          bg: 'bg-[#9B7CFF]/15',
        };
      case 'bid':
        return {
          icon: Gavel,
          color: 'text-[#9B7CFF]',
          bg: 'bg-[#9B7CFF]/15',
        };
      case 'sale':
        return {
          icon: CheckCircle2,
          color: 'text-[#34D399]',
          bg: 'bg-[#34D399]/15',
        };
      case 'auction':
      case 'outbid':
        return {
          icon: Sparkles,
          color: 'text-[#FFC857]',
          bg: 'bg-[#FFC857]/15',
        };
      case 'security':
      case 'verification':
      default:
        return {
          icon: ShieldCheck,
          color: 'text-[#2E8CEB]',
          bg: 'bg-[#2E8CEB]/15',
        };
    }
  };

  const config = getSubtypeConfig();
  const SubIcon = config.icon;

  return (
    <div
      onClick={() => onItemClick?.(notification)}
      className={`w-full p-3.5 rounded-2xl flex flex-col transition-all cursor-pointer ${
        !notification.read
          ? 'bg-[#15233e] hover:bg-[#182a4c]'
          : 'bg-[#111C30] hover:bg-[#14223b]'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Avatar with category icon badge */}
        <div className="relative shrink-0">
          <img
            src={notification.senderAvatar}
            alt={notification.senderName}
            className="w-10 h-10 rounded-xl object-cover bg-[#091326]"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg ${config.bg} ${config.color} flex items-center justify-center shadow-sm`}
          >
            <SubIcon className="w-3 h-3" />
          </div>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-[#F5F7FB] truncate">
                {notification.senderName}
              </span>
              {notification.isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E8CEB] shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-medium text-[#91A8C5]">
                {notification.timestamp}
              </span>
              {!notification.read && <NotificationUnreadIndicator />}
            </div>
          </div>

          <p className="text-xs text-[#91A8C5] mt-0.5 leading-relaxed">
            <span className="font-semibold text-slate-200">
              {notification.title}:
            </span>{' '}
            {notification.description}
          </p>

          {/* Optional contextual preview */}
          {notification.previewImageUrl && (
            <NotificationPreview
              imageUrl={notification.previewImageUrl}
              title={notification.previewTitle}
              subtitle={notification.previewSubtitle}
              showPlay={notification.category === 'music'}
              onPlay={() => onPreviewPlay?.(notification)}
            />
          )}

          {/* Optional Action Button */}
          {notification.actionLabel && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClick?.(notification);
                }}
                className="px-3 py-1 bg-[#2E8CEB]/20 hover:bg-[#2E8CEB]/30 text-[#2E8CEB] text-xs font-bold rounded-lg transition-colors"
              >
                {notification.actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;

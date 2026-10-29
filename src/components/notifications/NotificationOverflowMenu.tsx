import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Check, Trash2, ExternalLink, VolumeX } from 'lucide-react';

interface NotificationOverflowMenuProps {
  isRead: boolean;
  onToggleRead: () => void;
  onDelete: () => void;
  onMuteUser?: () => void;
}

export const NotificationOverflowMenu: React.FC<NotificationOverflowMenuProps> = ({
  isRead,
  onToggleRead,
  onDelete,
  onMuteUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#F5F7FB] hover:bg-white/[0.06] transition-colors cursor-pointer"
        aria-label="Notification options"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-50 min-w-[160px] py-1.5 rounded-xl bg-[#111C30] border border-white/[0.08] shadow-xl shadow-black/50 text-xs text-[#F5F7FB] flex flex-col backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={() => {
              onToggleRead();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.06] text-[#94A3B8] hover:text-[#F5F7FB] transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-[#229ED9]" />
            <span>{isRead ? 'Mark as unread' : 'Mark as read'}</span>
          </button>

          {onMuteUser && (
            <button
              onClick={() => {
                onMuteUser();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.06] text-[#94A3B8] hover:text-[#F5F7FB] transition-colors cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>Mute notifications</span>
            </button>
          )}

          <div className="my-1 border-t border-white/[0.04]" />

          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-left hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove alert</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationOverflowMenu;

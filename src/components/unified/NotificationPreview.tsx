import React from 'react';
import { Play } from 'lucide-react';

interface NotificationPreviewProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  showPlay?: boolean;
  onPlay?: () => void;
}

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  imageUrl,
  title,
  subtitle,
  showPlay = false,
  onPlay,
}) => {
  if (!imageUrl && !title) return null;

  return (
    <div className="mt-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title || 'Preview'}
            className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#0B1626]"
          />
        )}
        <div className="flex flex-col min-w-0">
          {title && (
            <span className="text-xs font-semibold text-[#F5F7FB] truncate">
              {title}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-[#91A8C5] truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {showPlay && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
          className="w-7 h-7 rounded-full bg-[#2E8CEB] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0"
          aria-label="Play track"
        >
          <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
        </button>
      )}
    </div>
  );
};

export default NotificationPreview;

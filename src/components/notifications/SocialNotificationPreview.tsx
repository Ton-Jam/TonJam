import React from 'react';
import { SocialPreviewData } from './types';
import { MessageSquare } from 'lucide-react';

interface SocialNotificationPreviewProps {
  preview: SocialPreviewData;
  onPreviewClick?: () => void;
}

export const SocialNotificationPreview: React.FC<SocialNotificationPreviewProps> = ({
  preview,
  onPreviewClick,
}) => {
  if (!preview.postExcerpt) return null;

  return (
    <div
      onClick={onPreviewClick}
      className="mt-2 w-full p-2.5 rounded-xl bg-[#080D1A]/60 hover:bg-[#080D1A]/90 transition-colors border-l-2 border-[#229ED9] text-left cursor-pointer"
    >
      <div className="flex items-start gap-1.5 text-xs text-[#94A3B8] font-normal leading-relaxed line-clamp-2">
        <MessageSquare className="w-3 h-3 text-[#229ED9] shrink-0 mt-0.5" />
        <span className="italic">"{preview.postExcerpt}"</span>
      </div>
    </div>
  );
};

export default SocialNotificationPreview;

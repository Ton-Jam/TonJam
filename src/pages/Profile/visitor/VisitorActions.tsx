import React, { useState } from 'react';
import { Share2, MessageSquare, Heart } from 'lucide-react';
import { FollowButton } from './FollowButton';
import { SupportArtist } from './SupportArtist';
import { ProfileData } from '@/components/profile/ProfileTypes';

interface VisitorActionsProps {
  profile: ProfileData;
  onShare: () => void;
  onOpenChat?: () => void;
}

export const VisitorActions: React.FC<VisitorActionsProps> = ({
  profile,
  onShare,
  onOpenChat
}) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full bg-[#101A3B]/40 p-4 border border-white/5 rounded-[16px] backdrop-blur-sm justify-between">
      <div className="flex items-center gap-2.5">
        <FollowButton artistName={profile.name} />
        
        <button
          onClick={() => setIsSupportOpen(true)}
          className="px-4 py-2 bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#0052FF] rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <Heart className="w-4 h-4 fill-current text-[#0052FF]" />
          <span>Support</span>
        </button>

        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
            title="Send Message"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        onClick={onShare}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      <SupportArtist
        artistName={profile.name}
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
};

export default VisitorActions;

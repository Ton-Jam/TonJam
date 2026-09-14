import React from 'react';
import { motion } from 'motion/react';
import { Image, Video, BarChart2, Smile, Music, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getPlaceholderImage } from '@/lib/utils';

interface JamSpaceQuickComposeProps {
  onSubmit?: (content: string) => void;
  onClick?: () => void;
}

export const JamSpaceQuickCompose: React.FC<JamSpaceQuickComposeProps> = ({ onClick }) => {
  const { user, userProfile } = useAuth();
  const avatarUrl = userProfile?.avatar || user?.photoURL || getPlaceholderImage(`user-${userProfile?.uid || user?.uid || 'guest'}`);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all border-none select-none group"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      role="button"
      tabIndex={0}
      aria-label="Create a JamSpace post"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex gap-3.5 items-center">
        <img 
          src={avatarUrl} 
          alt="User avatar" 
          className="w-10 h-10 rounded-full shrink-0 object-cover ring-2 ring-white/5"
        />
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="bg-white/[0.04] group-hover:bg-white/[0.06] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-400 font-medium truncate flex-1 transition-colors">
            What's vibing in your space? Share tracks, drops, thoughts...
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-auto">
            <div className="flex items-center gap-0.5 text-zinc-400">
              <span className="p-1.5 hover:text-[#00B4D8] transition-colors" title="Attach image">
                <Image className="w-4 h-4" />
              </span>
              <span className="p-1.5 hover:text-emerald-400 transition-colors" title="Attach music">
                <Music className="w-4 h-4" />
              </span>
              <span className="p-1.5 hover:text-purple-400 transition-colors" title="Create poll">
                <BarChart2 className="w-4 h-4" />
              </span>
            </div>
            
            <button
              type="button"
              className="px-3.5 py-1.5 min-h-[32px] bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#00B4D8]/20 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              aria-label="Open post composer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};



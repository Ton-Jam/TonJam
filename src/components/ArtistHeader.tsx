import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge';

interface ArtistHeaderProps {
  name: string;
  avatarUrl: string;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  verified?: boolean;
  username?: string;
  genre?: string;
  className?: string;
}

export const ArtistHeader: React.FC<ArtistHeaderProps> = ({
  name,
  avatarUrl,
  isFollowing = false,
  onToggleFollow,
  verified = false,
  username,
  genre,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D153B]/80 border border-white/10 backdrop-blur-md shadow-lg w-full select-none",
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
            alt={name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-blue-500/40 shadow-md bg-slate-900"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white truncate">{name}</h3>
            {verified && <ArtistVerificationBadge isVerified={true} artistName={name} size="sm" />}
          </div>
          {username && (
            <span className="text-[11px] text-blue-400 font-mono font-medium truncate">
              {username}
            </span>
          )}
          {genre && !username && (
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
              {genre}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <Button
          onClick={onToggleFollow}
          size="sm"
          className={cn(
            "rounded-full font-bold uppercase tracking-wider text-[11px] px-4 py-2 h-9 transition-all shadow-md active:scale-95 cursor-pointer",
            isFollowing
              ? "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
          )}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-3.5 h-3.5 mr-1.5 text-green-400" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              <span>Follow</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default ArtistHeader;

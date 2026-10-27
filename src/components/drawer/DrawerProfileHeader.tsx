import React from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile } from '@/types';

interface DrawerProfileHeaderProps {
  user: any;
  userProfile?: UserProfile | null;
  onNavigate?: (path: string) => void;
}

export const DrawerProfileHeader: React.FC<DrawerProfileHeaderProps> = ({
  user,
  userProfile,
  onNavigate,
}) => {
  const displayName = userProfile?.name || user?.displayName || 'TonJam Listener';
  const username = userProfile?.username
    ? userProfile.username.startsWith('@')
      ? userProfile.username
      : `@${userProfile.username}`
    : user?.email
    ? `@${user.email.split('@')[0]}`
    : '@listener';

  const avatarUrl = userProfile?.avatar || user?.photoURL || '';
  const isVerified = Boolean(userProfile?.isVerified || userProfile?.isVerifiedArtist);
  const bio = userProfile?.bio || '';
  const followersCount = userProfile?.followers ?? 0;
  const followingCount = userProfile?.following ?? 0;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TJ';

  return (
    <div
      onClick={() => onNavigate?.('/profile')}
      className="w-full rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] p-3.5 flex flex-col gap-3 transition-colors cursor-pointer group text-left select-none relative"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate?.('/profile');
        }
      }}
      aria-label={`View ${displayName}'s profile`}
    >
      {/* TOP ROW: AVATAR + NAMES + CHEVRON */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="w-12 h-12 rounded-full ring-2 ring-[#229ED9]/30 group-hover:ring-[#229ED9] transition-all">
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover rounded-full" />
              <AvatarFallback className="bg-[#229ED9]/20 text-[#229ED9] font-black text-sm rounded-full">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-white tracking-tight truncate group-hover:text-[#229ED9] transition-colors">
                {displayName}
              </h2>
              {isVerified && (
                <span className="text-[9px] font-black uppercase tracking-wider text-[#229ED9] bg-[#229ED9]/15 px-1.5 py-0.2 rounded-full shrink-0">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-400 truncate">{username}</p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>

      {/* OPTIONAL BIO */}
      {bio && (
        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
          {bio}
        </p>
      )}

      {/* METRICS ROW: FOLLOWING & FOLLOWERS */}
      <div className="flex items-center gap-4 text-xs pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-white font-mono">{followingCount.toLocaleString()}</span>
          <span className="text-slate-400 text-[11px]">Following</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-white font-mono">{followersCount.toLocaleString()}</span>
          <span className="text-slate-400 text-[11px]">Followers</span>
        </div>
      </div>
    </div>
  );
};

export default DrawerProfileHeader;

import React from 'react';
import { ShieldCheck, Sparkles, ChevronRight, User } from 'lucide-react';
import { ProfileData } from './types';

interface ProfileSummaryCardProps {
  profile?: ProfileData | null;
  isGuest?: boolean;
  onEditProfile?: () => void;
  onSignIn?: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profile,
  isGuest = false,
  onEditProfile,
  onSignIn,
}) => {
  if (isGuest || !profile) {
    return (
      <div className="relative w-full rounded-2xl bg-gradient-to-r from-[#111C30] to-[#162039] p-4 flex items-center justify-between gap-3 shadow-md select-none overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#2E8CEB]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3.5 z-10 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-400 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#F5F7FB]">Guest Listener</span>
            <span className="text-xs text-[#91A8C5] truncate">Sign in to sync your library & earnings</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignIn}
          className="px-4 py-2 bg-[#2E8CEB] hover:bg-[#2577c9] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 z-10"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onEditProfile}
      className="group relative w-full rounded-2xl bg-gradient-to-r from-[#111C30] via-[#132038] to-[#171b38] p-4 flex items-center justify-between gap-3 shadow-md select-none cursor-pointer hover:bg-white/[0.02] transition-all overflow-hidden"
    >
      {/* Subtle blue-purple gradient ambient glow */}
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#2E8CEB]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#9B7CFF]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3.5 z-10 min-w-0">
        {/* Avatar with restrained blue-purple gradient glow ring */}
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-[#2E8CEB] to-[#9B7CFF] opacity-75 blur-[1px]" />
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
            alt={profile.name}
            className="relative w-12 h-12 rounded-2xl object-cover bg-[#091326]"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-bold text-[#F5F7FB] truncate">
              {profile.name}
            </span>
            {profile.isVerified && (
              <ShieldCheck className="w-4 h-4 text-[#2E8CEB] shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-medium text-[#91A8C5] truncate">
              {profile.username.startsWith('@') ? profile.username : `@${profile.username}`}
            </span>
            {profile.role && (
              <>
                <span className="text-slate-600 text-[10px]">·</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9B7CFF] bg-[#9B7CFF]/15 px-1.5 py-0.5 rounded-md">
                  {profile.role}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 z-10 shrink-0">
        <span className="text-xs font-semibold text-[#2E8CEB] group-hover:text-blue-300 transition-colors hidden xs:inline">
          Edit Profile
        </span>
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default ProfileSummaryCard;

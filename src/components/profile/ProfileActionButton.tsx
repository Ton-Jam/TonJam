import React from 'react';
import { Sparkles, LayoutDashboard } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileActionButtonProps {
  user: UserProfile;
}

export const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({ user }) => {
  if (user.isVerifiedArtist) {
    return (
      <button className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold uppercase tracking-widest text-sm">
        <LayoutDashboard size={16} />
        Artist Dashboard
      </button>
    );
  }

  if (user.verificationStatus === 'pending') {
    return (
      <button disabled className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--border)] text-[var(--text-muted)] rounded-xl font-bold uppercase tracking-widest text-sm">
        Verification Pending
      </button>
    );
  }

  return (
    <button className="flex items-center justify-center gap-2 w-full py-3 border border-[var(--primary)] text-[var(--primary)] rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[var(--primary)]/10">
      <Sparkles size={16} />
      Become an Artist
    </button>
  );
};

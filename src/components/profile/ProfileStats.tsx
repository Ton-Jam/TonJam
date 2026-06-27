import React from 'react';
import { UserProfile } from '../../types';

interface ProfileStatsProps {
  user: UserProfile;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  const stats = [
    { label: 'Followers', value: user.followers },
    { label: 'Following', value: user.following },
    { label: 'NFTs Owned', value: user.ownedNftIds?.length || 0 },
    { label: 'Playlists', value: user.createdPlaylistIds?.length || 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] flex flex-col items-center justify-center gap-1">
          <span className="text-xl font-bold font-mono">{stat.value}</span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

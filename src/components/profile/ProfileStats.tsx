import React from 'react';
import { Users, UserCheck, Radio, Play, Disc, Gem, Library, Trophy } from 'lucide-react';
import { ProfileData } from './ProfileTypes';

interface ProfileStatsProps {
  profile: ProfileData;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
  const statItems = [
    {
      id: 'followers',
      label: 'Followers',
      value: profile.followers.toLocaleString(),
      icon: <Users className="w-4 h-4 text-[#0052FF]" />,
    },
    {
      id: 'following',
      label: 'Following',
      value: profile.following.toLocaleString(),
      icon: <UserCheck className="w-4 h-4 text-slate-400" />,
    },
    {
      id: 'listeners',
      label: 'Monthly Listeners',
      value: profile.monthlyListeners.toLocaleString(),
      icon: <Radio className="w-4 h-4 text-[#0052FF]" />,
    },
    {
      id: 'streams',
      label: 'Total Streams',
      value: profile.totalStreams.toLocaleString(),
      icon: <Play className="w-4 h-4 text-[#0052FF]" />,
    },
    {
      id: 'nfts-owned',
      label: 'NFTs Owned',
      value: profile.nftsOwned.toString(),
      icon: <Gem className="w-4 h-4 text-slate-300" />,
    },
    {
      id: 'nfts-sold',
      label: 'NFTs Sold',
      value: profile.nftsSold.toString(),
      icon: <Disc className="w-4 h-4 text-[#0052FF]" />,
    },
    {
      id: 'playlists',
      label: 'Playlists',
      value: profile.playlistsCount.toString(),
      icon: <Library className="w-4 h-4 text-slate-400" />,
    },
    {
      id: 'tj-points',
      label: 'TJ Points',
      value: profile.tjPoints.toString(),
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((stat) => (
        <div
          key={stat.id}
          className="bg-[#101A3B] border border-white/5 rounded-[12px] p-3.5 flex flex-col justify-between hover:bg-[#15234f] transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              {stat.label}
            </span>
            <div className="shrink-0 p-1 bg-white/5 rounded-md">
              {stat.icon}
            </div>
          </div>
          
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

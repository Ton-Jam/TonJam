import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Radio, Play, Disc, Gem, Library, Trophy, Flame } from 'lucide-react';
import { ProfileData } from '../../components/profile/ProfileTypes';
import { getInitialListenStreakData } from '@/lib/listenStreak';

interface ProfileStatsProps {
  profile: ProfileData;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [streakDays, setStreakDays] = useState(5);

  useEffect(() => {
    const data = getInitialListenStreakData();
    setStreakDays(data.currentStreak);
  }, []);

  const statItems = [
    {
      id: 'listen-streak',
      label: 'Listen Streak',
      value: `${streakDays} Days 🔥`,
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      path: '#streak-section',
      highlight: true
    },
    {
      id: 'followers',
      label: 'Followers',
      value: profile.followers.toLocaleString(),
      icon: <Users className="w-4 h-4 text-[#0052FF]" />,
      path: '/followers'
    },
    {
      id: 'following',
      label: 'Following',
      value: profile.following.toLocaleString(),
      icon: <UserCheck className="w-4 h-4 text-slate-400" />,
      path: '/following'
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
      path: '/my-nfts'
    },
    {
      id: 'playlists',
      label: 'Playlists',
      value: profile.playlistsCount.toString(),
      icon: <Library className="w-4 h-4 text-slate-400" />,
      path: '/library'
    },
    {
      id: 'tj-points',
      label: 'TJ Points',
      value: profile.tjPoints.toString(),
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
      path: '/tasks'
    },
  ];

  const handleClick = (path?: string) => {
    if (!path) return;
    if (path === '#streak-section') {
      const el = document.getElementById('listen-streak-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/profile');
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((stat) => (
        <div
          key={stat.id}
          onClick={() => handleClick(stat.path)}
          className={`bg-[#101A3B] border rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 ${
            stat.highlight 
              ? 'border-orange-500/40 bg-gradient-to-br from-[#101A3B] to-[#1a1435] hover:border-orange-400' 
              : 'border-white/5 hover:bg-[#15234f]'
          } ${
            stat.path ? 'cursor-pointer hover:border-blue-500/30' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${stat.highlight ? 'text-orange-300' : 'text-slate-400'}`}>
              {stat.label}
            </span>
            <div className={`shrink-0 p-1 rounded-md ${stat.highlight ? 'bg-orange-500/20' : 'bg-white/5'}`}>
              {stat.icon}
            </div>
          </div>
          
          <div className="mt-1">
            <span className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${stat.highlight ? 'text-amber-300' : 'text-white'}`}>
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;

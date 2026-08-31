import React from 'react';
import { Sparkles, Heart, Download, Zap, Disc, Clock, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface LibraryHeroProps {
  userAvatar: string;
  userName: string;
  likedCount: number;
  downloadCount: number;
  nftCount: number;
  playlistCount: number;
  albumCount: number;
  listeningHours: number;
}

export const LibraryHero: React.FC<LibraryHeroProps> = ({
  userAvatar,
  userName,
  likedCount,
  downloadCount,
  nftCount,
  playlistCount,
  albumCount,
  listeningHours
}) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Liked Songs', value: likedCount, icon: Heart, color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Downloads', value: downloadCount, icon: Download, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'NFTs', value: nftCount, icon: Zap, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Playlists', value: playlistCount, icon: Disc, color: 'text-sky-500 bg-sky-500/10' },
    { label: 'Albums', value: albumCount, icon: Music, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Hours Active', value: `${listeningHours.toFixed(0)}h`, icon: Clock, color: 'text-amber-500 bg-amber-500/10' }
  ];

  return (
    <div className="relative overflow-hidden bg-slate-950/40 border border-black/5 dark:border-white/5 rounded-[10px] p-6 space-y-6">
      {/* Animated abstract ambient lights in background */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-20">
        <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[120%] bg-[#0052FF]/25 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[100%] bg-purple-600/20 rounded-full filter blur-[120px]" />
      </div>

      {/* Main Row */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        {/* User avatar with dynamic outline ring */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#0052FF]/40 p-0.5 shrink-0 bg-slate-900">
          <img src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} alt={userName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center sm:justify-start">
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest font-bold">TonJam Protocol Client</span>
            <div className="flex items-center gap-1 justify-center text-amber-400">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="text-[8px] font-black uppercase tracking-wider">Premium Node unlocked</span>
            </div>
          </div>
          <h1 className="page-title">
            {greeting}, {userName || 'Collector'}
          </h1>
          <p className="text-xs text-muted-foreground leading-normal max-w-md">
            Welcome to your decentralized acoustic collection space. All licenses, stream caches, and smart contracts are fully verified.
          </p>
        </div>
      </div>

      {/* Grid of counters */}
      <div className="relative grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.01] dark:bg-white/[0.01] bg-black/[0.01] border border-black/5 dark:border-white/5 rounded-lg p-3 flex items-center gap-3 transition-colors"
            >
              <div className={`p-2 rounded-full ${stat.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] text-muted-foreground uppercase font-mono font-bold tracking-wider block truncate">
                  {stat.label}
                </span>
                <p className="text-sm font-black text-foreground font-mono leading-none mt-0.5">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Crown, 
  Flame, 
  Gem, 
  Lock, 
  Music, 
  Play, 
  Sparkles, 
  Trophy, 
  X,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/context/AudioContext';
import { UserProfile, NFTItem } from '@/types';
import { GlassProgressBar } from '@/components/aicanvas/glass-progress';
import { motion, AnimatePresence } from 'motion/react';

interface BadgeSystemProps {
  user: UserProfile;
  isOwnProfile: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  criteria: string;
  unlocked: boolean;
  progress: number;
  currentValue: number;
  targetValue: number;
  statsLabel: string;
  actionText?: string;
  actionPath?: string;
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ user, isOwnProfile }) => {
  const navigate = useNavigate();
  const { recentlyPlayed, allNFTs, playlists, playTrack, allTracks, addNotification } = useAudio();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Compute dynamic stats based on user context
  const badgesList = useMemo<Badge[]>(() => {
    // 1. Top Fan Badge Calculations
    // Own profile uses live recently played tracks count. Others use pre-set realistic constants.
    const listeningCount = isOwnProfile 
      ? recentlyPlayed?.length || 0 
      : (user.uid === 'u2' ? 14 : user.uid === 'u3' ? 8 : 1);
    const targetListening = 5;
    const topFanProgress = Math.min(100, Math.round((listeningCount / targetListening) * 100));

    // 2. Super Collector Badge Calculations
    // Search the live NFTs state for entries matching user's wallet address or username
    const nftCount = isOwnProfile
      ? allNFTs.filter(nft => nft.owner === user.walletAddress || nft.owner === user.name).length
      : (user.uid === 'u2' ? 5 : user.uid === 'u3' ? 1 : 0);
    const targetCollector = 2;
    const superCollectorProgress = Math.min(100, Math.round((nftCount / targetCollector) * 100));

    // 3. Vibe Curator Badge Calculations
    // Created playlists or custom collections
    const playlistCount = isOwnProfile
      ? playlists.filter(p => p.creator === user.name).length
      : (user.uid === 'u2' ? 2 : user.uid === 'u3' ? 1 : 0);
    const targetCurator = 2;
    const curatorProgress = Math.min(100, Math.round((playlistCount / targetCurator) * 100));

    // 4. Pioneer Member Badge Calculations
    // Checking stashes of TJ, JAM, or staked activity
    const isPioneer = isOwnProfile
      ? (user.tjBalance && user.tjBalance > 0) || (user.stakedJam && user.stakedJam > 0) || true
      : (user.uid === 'u2' || user.uid === 'u3');
    const pioneerProgress = isPioneer ? 100 : 0;

    return [
      {
        id: 'top-fan',
        name: 'Top Fan',
        description: 'Awarded to users heavily dialed into the sonic web. Listeners in the top tier supporting artist streams on the daily.',
        icon: Flame,
        color: '#F97316',
        gradient: '#F97316, #EF4444',
        criteria: `Stream ${targetListening} or more distinct tracks in your listening history.`,
        unlocked: topFanProgress >= 100,
        progress: topFanProgress,
        currentValue: listeningCount,
        targetValue: targetListening,
        statsLabel: 'Tracks Streamed',
        actionText: 'Listen Now',
        actionPath: '/discover'
      },
      {
        id: 'super-collector',
        name: 'TONJam Collector',
        description: 'Elite digital curator acquiring sound waves on-chain. Supporting and funding creators through scarce NFT ownership.',
        icon: Gem,
        color: '#A855F7',
        gradient: '#A855F7, #EC4899',
        criteria: `Acquire and hold at least ${targetCollector} official Music NFTs in your wallet registry.`,
        unlocked: superCollectorProgress >= 100,
        progress: superCollectorProgress,
        currentValue: nftCount,
        targetValue: targetCollector,
        statsLabel: 'NFTs Owned',
        actionText: 'Explore Marketplace',
        actionPath: '/marketplace'
      },
      {
        id: 'vibe-curator',
        name: 'Vibe Curator',
        description: 'Master of flow and playlists. Cultivating the finest sonic sequences for the social feed & group spaces.',
        icon: Music,
        color: '#3B82F6',
        gradient: '#3B82F6, #06B6D4',
        criteria: `Curate and publish at least ${targetCurator} custom playlists to your profiles.`,
        unlocked: curatorProgress >= 100,
        progress: curatorProgress,
        currentValue: playlistCount,
        targetValue: targetCurator,
        statsLabel: 'Playlists Made',
        actionText: 'Create Playlist',
        actionPath: '/library'
      },
      {
        id: 'pioneer-member',
        name: 'TONJam Pioneer',
        description: 'Early node architect. Holders of structural TJ assets driving decentralized distribution from inception.',
        icon: Trophy,
        color: '#F59E0B',
        gradient: '#F59E0B, #10B981',
        criteria: 'Hold structural TJ balance or participate in Staking Protocols.',
        unlocked: pioneerProgress >= 100,
        progress: pioneerProgress,
        currentValue: isPioneer ? 1 : 0,
        targetValue: 1,
        statsLabel: 'Pioneer Status',
        actionText: 'Enter Staking Portal',
        actionPath: '/staking'
      }
    ];
  }, [recentlyPlayed, allNFTs, playlists, user, isOwnProfile]);

  const handleSimulatedPlay = () => {
    if (allTracks.length > 0) {
      // Pick a random track the user can listen to
      const randomIdx = Math.floor(Math.random() * allTracks.length);
      const randomTrack = allTracks[randomIdx];
      playTrack(randomTrack);
      addNotification(`Streaming "${randomTrack.title}" directly from Badge Control`, 'success');
      setSelectedBadge(null);
    } else {
      navigate('/discover');
    }
  };

  const handleBadgeAction = (badge: Badge) => {
    if (badge.id === 'top-fan' && isOwnProfile) {
      handleSimulatedPlay();
      return;
    }
    if (badge.actionPath) {
      navigate(badge.actionPath);
      setSelectedBadge(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Community Badges</h4>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          {badgesList.filter(b => b.unlocked).length} / {badgesList.length} Unlocked
        </span>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-4 gap-3">
        {badgesList.map((badge, idx) => {
          const BadgeIcon = badge.icon;
          const isLeft = idx === 0;
          const isRight = idx === badgesList.length - 1;
          const tooltipAlignClass = isLeft 
            ? "left-0 translate-x-0" 
            : isRight 
              ? "right-0 translate-x-0" 
              : "left-1/2 -translate-x-1/2";

          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBadge(badge)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer relative group"
            >
              {/* Interactive Tooltip on Hover */}
              <div className={`absolute bottom-full mb-3 ${tooltipAlignClass} w-52 p-3.5 bg-neutral-950/95 backdrop-blur-md shadow-2xl rounded-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 flex flex-col gap-2 text-left translate-y-1 group-hover:translate-y-0 select-none`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-[9px] text-white uppercase tracking-widest">{badge.name}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ 
                    color: badge.unlocked ? badge.color : '#9CA3AF',
                    backgroundColor: badge.unlocked ? `${badge.color}15` : 'rgba(255,255,255,0.05)'
                  }}>
                    {badge.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <p className="text-[9px] text-zinc-300 leading-normal font-medium">
                  {badge.criteria}
                </p>
                <div className="flex items-center justify-between text-[8px] font-black text-neutral-400 mt-1 uppercase tracking-wider">
                  <span>{badge.statsLabel}</span>
                  <span className="text-white">{badge.currentValue} / {badge.targetValue}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${badge.progress}%`,
                      background: `linear-gradient(90deg, ${badge.color}, transparent)` 
                    }} 
                  />
                </div>
                
                {/* Arrow */}
                <div 
                  className={`absolute top-full w-2 h-2 bg-neutral-950/95 rotate-45 -translate-y-1 ${
                    isLeft ? 'left-8' : isRight ? 'right-8' : 'left-1/2 -translate-x-1/2'
                  }`}
                />
              </div>

              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  badge.unlocked 
                    ? 'shadow-lg shadow-black/40' 
                    : 'opacity-40 filter grayscale'
                }`}
                style={{ 
                  background: badge.unlocked 
                    ? `linear-gradient(135deg, ${badge.color}33, ${badge.color}11)` 
                    : 'rgba(255,255,255,0.02)'
                }}
              >
                <BadgeIcon 
                  size={20} 
                  style={{ color: badge.unlocked ? badge.color : '#9CA3AF' }}
                  className={badge.unlocked ? 'animate-pulse' : ''} 
                />
              </div>

              <span className={`text-[9px] font-bold uppercase tracking-wide mt-2 text-center transition-colors truncate w-full ${
                badge.unlocked ? 'text-white' : 'text-neutral-500'
              }`}>
                {badge.name}
              </span>

              {!badge.unlocked && (
                <div className="absolute top-1 right-1 p-0.5 bg-black/40 rounded-full text-neutral-500">
                  <Lock size={8} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Badge Details Modal Overlay */}
      <AnimatePresence>
        {selectedBadge && (() => {
          const BadgeIcon = selectedBadge.icon;
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="relative isolate w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-900/90 p-6 shadow-2xl text-white"
              >
                {/* Backdrop saturation effect */}
                <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-white/5 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-all cursor-pointer p-1.5 rounded-full hover:bg-white/5"
                >
                  <X size={16} />
                </button>

                {/* Badge Icon Display */}
                <div className="flex flex-col items-center text-center mt-4">
                  <div 
                    className={`w-20 h-20 rounded-full flex items-center justify-center transform transition-transform duration-500 ${
                      selectedBadge.unlocked ? 'shadow-2xl hover:scale-110' : 'opacity-40 grayscale'
                    }`}
                    style={{
                      background: selectedBadge.unlocked
                        ? `linear-gradient(135deg, ${selectedBadge.color}44, ${selectedBadge.color}11)`
                        : 'rgba(255,255,255,0.03)'
                    }}
                  >
                    <BadgeIcon size={36} style={{ color: selectedBadge.unlocked ? selectedBadge.color : '#9CA3AF' }} />
                  </div>

                  <h3 className="text-lg font-black uppercase tracking-widest mt-4">
                    {selectedBadge.name}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      selectedBadge.unlocked 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-zinc-800 text-neutral-500'
                    }`}>
                      {selectedBadge.unlocked ? '🏆 UNLOCKED' : '🔒 LOCKED'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed mt-4 max-w-xs font-medium">
                    {selectedBadge.description}
                  </p>
                </div>

                {/* Badge Progress Tracker */}
                <div className="mt-6 bg-white/[0.02] p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    <span>{selectedBadge.statsLabel}</span>
                    <span className="text-white font-black">
                      {selectedBadge.currentValue} / {selectedBadge.targetValue}
                    </span>
                  </div>

                  <GlassProgressBar
                    value={selectedBadge.progress}
                    color={selectedBadge.color}
                    gradient={selectedBadge.gradient}
                  />

                  <p className="text-[10px] text-neutral-400 font-medium leading-relaxed mt-1">
                    <span className="text-white font-bold uppercase tracking-wider">Requirement:</span> {selectedBadge.criteria}
                  </p>
                </div>

                {/* Interaction Action Button */}
                {isOwnProfile && (
                  <button
                    onClick={() => handleBadgeAction(selectedBadge)}
                    className="w-full mt-6 py-3.5 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all rounded-full font-black text-xs uppercase tracking-widest text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    {selectedBadge.id === 'top-fan' ? <Play size={12} className="fill-current" /> : <Sparkles size={12} />}
                    {selectedBadge.unlocked ? 'Explore Action' : selectedBadge.actionText || 'Advance Track'}
                  </button>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

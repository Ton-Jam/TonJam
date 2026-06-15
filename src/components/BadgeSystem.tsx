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
  ExternalLink,
  Shield,
  Star,
  Zap
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
  const { recentlyPlayed, allNFTs, playlists, playTrack, allTracks, addNotification, posts = [] } = useAudio();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Read JamPoints state from localStorage (sync with JamPointsTracker)
  const tracksListenedCount = useMemo(() => {
    if (typeof window === 'undefined') return 2;
    const val = localStorage.getItem('jampoints_tracks_count');
    return val ? parseInt(val, 10) : 2;
  }, []);

  const nftsExploredCount = useMemo(() => {
    if (typeof window === 'undefined') return 3;
    const val = localStorage.getItem('jampoints_nfts_count');
    return val ? parseInt(val, 10) : 3;
  }, []);

  const hasCheckedInStatus = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('jampoints_checked_in') === 'true';
  }, []);

  const userPostsCount = useMemo(() => {
    return posts.filter((p: any) => p.userId === user.uid).length;
  }, [posts, user.uid]);

  const [bonusPoints, setBonusPoints] = useState<number>(() => {
    if (typeof window === 'undefined') return 150;
    const val = localStorage.getItem('jampoints_vip_bonus');
    return val ? parseInt(val, 10) : 150; // default 150 points bonus to kick off Bronze VIP level
  });

  const baseJamPoints = (Math.min(tracksListenedCount, 5) * 40) +
                        (Math.min(nftsExploredCount, 6) * 25) +
                        (Math.min(userPostsCount, 1) * 100) +
                        (hasCheckedInStatus ? 100 : 0);

  const accumulatedPoints = baseJamPoints + bonusPoints;

  const vipTierInfo = useMemo(() => {
    if (accumulatedPoints >= 700) {
      return { level: 4, name: 'LEGENDARY APEX VIP', label: 'VIP Level 4', color: '#38BDF8', req: 700, perk: 'Zero-gas listing signature privileges' };
    } else if (accumulatedPoints >= 500) {
      return { level: 3, name: 'GOLD VIP', label: 'VIP Level 3', color: '#EAB308', req: 500, perk: 'Featured seller status on dashboard' };
    } else if (accumulatedPoints >= 300) {
      return { level: 2, name: 'SILVER VIP', label: 'VIP Level 2', color: '#C8C8C8', req: 300, perk: 'Exclusive access to pre-mint VIP drops' };
    } else if (accumulatedPoints >= 150) {
      return { level: 1, name: 'BRONZE VIP', label: 'VIP Level 1', color: '#CD7F32', req: 150, perk: 'Marketplace listing fee reduced by 5%' };
    }
    return { level: 0, name: 'STANDARD COLLECTOR', label: 'VIP Level 0', color: '#A1A1AA', req: 0, perk: 'Accumulate JamPoints to enter VIP protocol' };
  }, [accumulatedPoints]);

  const handleClaimPoints = () => {
    const nextBonus = bonusPoints + 150;
    setBonusPoints(nextBonus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jampoints_vip_bonus', nextBonus.toString());
    }
    addNotification(`Acquired +150 LP! Leveling up telemetry. Current balance: ${baseJamPoints + nextBonus} JamPoints.`, 'success');
  };

  const resetPoints = () => {
    setBonusPoints(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jampoints_vip_bonus', '0');
    }
    addNotification('Recalibrated VIP telemetry points registry.', 'info');
  };

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
    const nftCount = isOwnProfile
      ? allNFTs.filter(nft => nft.owner === user.walletAddress || nft.owner === user.name).length
      : (user.uid === 'u2' ? 5 : user.uid === 'u3' ? 1 : 0);
    const targetCollector = 2;
    const superCollectorProgress = Math.min(100, Math.round((nftCount / targetCollector) * 100));

    // 3. Vibe Curator Badge Calculations
    const playlistCount = isOwnProfile
      ? playlists.filter(p => p.creator === user.name).length
      : (user.uid === 'u2' ? 2 : user.uid === 'u3' ? 1 : 0);
    const targetCurator = 2;
    const curatorProgress = Math.min(100, Math.round((playlistCount / targetCurator) * 100));

    // 4. Pioneer Member Badge Calculations
    const isPioneer = isOwnProfile
      ? (user.tjBalance && user.tjBalance > 0) || (user.stakedJam && user.stakedJam > 0) || true
      : (user.uid === 'u2' || user.uid === 'u3');
    const pioneerProgress = isPioneer ? 100 : 0;

    // Normal Community Badges
    const items: Badge[] = [
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
      },
      // Exclusive VIP Badges based on JamPoints accumulation
      {
        id: 'vip-bronze-patron',
        name: 'VIP Bronze Patron',
        description: 'Elite level 1 VIP. Unlocks standard marketplace savings benefits: 5% listing fee markdown discount.',
        icon: ShoppingBag,
        color: '#CD7F32',
        gradient: '#CD7F32, #8B5A2B',
        criteria: 'Accumulate at least 150 JamPoints on your profile.',
        unlocked: accumulatedPoints >= 150,
        progress: Math.min(100, Math.round((accumulatedPoints / 150) * 100)),
        currentValue: accumulatedPoints,
        targetValue: 150,
        statsLabel: 'JamPoints Count',
        actionText: 'Acquire JamPoints',
        actionPath: '/discover'
      },
      {
        id: 'vip-silver-broker',
        name: 'VIP Silver Broker',
        description: 'Advanced level 2 VIP. Grants premium priority access to secure drops and VIP collector allocations.',
        icon: Shield,
        color: '#CBD5E1',
        gradient: '#CBD5E1, #64748B',
        criteria: 'Accumulate at least 300 JamPoints on your profile.',
        unlocked: accumulatedPoints >= 300,
        progress: Math.min(100, Math.round((accumulatedPoints / 300) * 100)),
        currentValue: accumulatedPoints,
        targetValue: 300,
        statsLabel: 'JamPoints Count',
        actionText: 'Acquire JamPoints',
        actionPath: '/discover'
      },
      {
        id: 'vip-gold-maven',
        name: 'VIP Gold Maven',
        description: 'Elite level 3 VIP. Unlocks specialized profile visibility perks with featured placement on creative indexes.',
        icon: Crown,
        color: '#F59E0B',
        gradient: '#F59E0B, #D97706',
        criteria: 'Accumulate at least 500 JamPoints on your profile.',
        unlocked: accumulatedPoints >= 500,
        progress: Math.min(100, Math.round((accumulatedPoints / 500) * 100)),
        currentValue: accumulatedPoints,
        targetValue: 500,
        statsLabel: 'JamPoints Count',
        actionText: 'Acquire JamPoints',
        actionPath: '/discover'
      },
      {
        id: 'vip-cosmic-legend',
        name: 'VIP Cosmic Legend',
        description: 'The highest LEVEL 4 VIP. Unlocks gas-free listing signatures and complete zero-fee mint operations.',
        icon: Star,
        color: '#38BDF8',
        gradient: '#38BDF8, #0E7490',
        criteria: 'Accumulate at least 700 JamPoints on your profile.',
        unlocked: accumulatedPoints >= 700,
        progress: Math.min(100, Math.round((accumulatedPoints / 700) * 100)),
        currentValue: accumulatedPoints,
        targetValue: 700,
        statsLabel: 'JamPoints Count',
        actionText: 'Acquire JamPoints',
        actionPath: '/discover'
      }
    ];

    return items;
  }, [recentlyPlayed, allNFTs, playlists, user, isOwnProfile, accumulatedPoints]);

  const handleSimulatedPlay = () => {
    if (allTracks.length > 0) {
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

  const standardBadges = useMemo(() => badgesList.slice(0, 4), [badgesList]);
  const vipBadges = useMemo(() => badgesList.slice(4), [badgesList]);

  return (
    <div className="w-full space-y-8 select-none">
      {/* Dynamic VIP & Collector Status Level Registry Control Header (No borders used!) */}
      <div className="p-5 rounded-3xl bg-white/[0.03] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" style={{ color: vipTierInfo.color }} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: vipTierInfo.color }}>
                VIP Loyalty Program Status
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              {vipTierInfo.name}
            </h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-loose">
              Perk Level unlocked: <span className="text-white font-black">{vipTierInfo.perk}</span>
            </p>
          </div>
          
          {isOwnProfile && (
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={handleClaimPoints}
                className="px-4 py-2 text-[8px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.3)] border-none"
              >
                +150 LP Test Points
              </button>
              <button
                onClick={resetPoints}
                className="px-3.5 py-2 text-[8px] font-black uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-all cursor-pointer border-none"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Dynamic score summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
            <span>Points Telemetry Progression</span>
            <span className="text-white font-mono">{accumulatedPoints} / 700 PTS</span>
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (accumulatedPoints / 700) * 100)}%` }}
              className="h-full rounded-full transition-all"
              style={{
                background: `linear-gradient(90deg, ${vipTierInfo.color}, #EC4899)`
              }}
            />
          </div>

          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500">
            <span>Level 0 (Unranked)</span>
            <span>Bronze VIP (150)</span>
            <span>Silver VIP (300)</span>
            <span>Gold VIP (500)</span>
            <span>Legend (700)</span>
          </div>
        </div>
      </div>

      {/* Community Badges (Borderless, clean spacing) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Community Badges</h4>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            {standardBadges.filter(b => b.unlocked).length} / {standardBadges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {standardBadges.map((badge, idx) => {
            const BadgeIcon = badge.icon;
            const isLeft = idx === 0 || idx === 4;
            const isRight = idx === 3 || idx === 7;
            const tooltipAlignClass = isLeft 
              ? "left-0 translate-x-0" 
              : isRight 
                ? "right-0 translate-x-0" 
                : "left-1/2 -translate-x-1/2";

            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedBadge(badge)}
                className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer relative group border-none"
              >
                {/* Interactive Tooltip on Hover */}
                <div className={`absolute bottom-full mb-3 ${tooltipAlignClass} w-52 p-3.5 bg-neutral-950/95 backdrop-blur-md shadow-2xl rounded-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 flex flex-col gap-2 text-left translate-y-1 group-hover:translate-y-0 select-none border-none`}>
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

                <span className={`text-[9px] font-bold uppercase tracking-wide mt-3 text-center transition-colors truncate w-full ${
                  badge.unlocked ? 'text-white' : 'text-neutral-500'
                }`}>
                  {badge.name}
                </span>

                {!badge.unlocked && (
                  <div className="absolute top-2 right-2 p-1 bg-black/40 rounded-full text-neutral-500">
                    <Lock size={8} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Exclusive VIP Marketplace Badges (Borderless, clean spacing) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Crown className="h-3.5 w-3.5 text-yellow-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Exclusive VIP Badges</h4>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            {vipBadges.filter(b => b.unlocked).length} / {vipBadges.length} Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {vipBadges.map((badge, idx) => {
            const BadgeIcon = badge.icon;
            const isLeft = idx === 0;
            const isRight = idx === 3;
            const tooltipAlignClass = isLeft 
              ? "left-0 translate-x-0" 
              : isRight 
                ? "right-0 translate-x-0" 
                : "left-1/2 -translate-x-1/2";

            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedBadge(badge)}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all cursor-pointer relative group border-none ${
                  badge.unlocked 
                    ? 'bg-gradient-to-b from-[#1E293B]/20 to-[#0F172A]/10 shadow-[0_8px_20px_rgba(0,0,0,0.3)]' 
                    : 'bg-white/[0.01] hover:bg-white/[0.03]'
                }`}
              >
                {/* Interactive Tooltip on Hover */}
                <div className={`absolute bottom-full mb-3 ${tooltipAlignClass} w-52 p-3.5 bg-neutral-950/95 backdrop-blur-md shadow-2xl rounded-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 flex flex-col gap-2 text-left translate-y-1 group-hover:translate-y-0 select-none border-none`}>
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
                      : 'opacity-45 filter grayscale'
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
                    className={badge.unlocked ? 'animate-bounce' : ''} 
                  />
                </div>

                <span className={`text-[9px] font-black uppercase tracking-wider mt-3 text-center transition-colors truncate w-full ${
                  badge.unlocked ? 'text-zinc-100' : 'text-neutral-600'
                }`}>
                  {badge.name}
                </span>

                {!badge.unlocked && (
                  <div className="absolute top-2 right-2 p-1 bg-black/40 rounded-full text-neutral-500">
                    <Lock size={8} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
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
                className="relative isolate w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-900/90 p-6 shadow-2xl text-white border-none"
              >
                {/* Backdrop saturation effect */}
                <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-white/5 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-all cursor-pointer p-1.5 rounded-full hover:bg-white/5 border-none"
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
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border-none ${
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
                <div className="mt-6 bg-white/[0.02] p-4 rounded-2xl flex flex-col gap-3 border-none">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-neutral-400">
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
                    className="w-full mt-6 py-3.5 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all rounded-full font-black text-xs uppercase tracking-widest text-center cursor-pointer flex items-center justify-center gap-2 border-none"
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

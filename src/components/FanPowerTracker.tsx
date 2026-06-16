import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, Zap, Play, Volume2, Flame, TrendingUp, Coins, Music, 
  Layers, Loader2, Sparkles, Trophy, Check, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { Artist, Track, FanTokenBalance, NFTItem } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, doc, onSnapshot, getDocs } from 'firebase/firestore';
import { earnFanTokens } from '@/services/fanTokenService';
import * as RechartsPrimitive from 'recharts';

const { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip 
} = RechartsPrimitive as any;

import { toast } from 'sonner';

interface FanPowerTrackerProps {
  artist: Artist;
}

export const FanPowerTracker: React.FC<FanPowerTrackerProps> = ({ artist }) => {
  const { userProfile, refreshProfile } = useAuth();
  const { playTrack, recentlyPlayed, addNotification } = useAudio();

  // Core stats states
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [trackPlays, setTrackPlays] = useState<number>(0);
  const [ownedNFTCount, setOwnedNFTCount] = useState<number>(0);
  const [ownedNFTs, setOwnedNFTs] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [boosting, setBoosting] = useState<string | null>(null);

  // Derive Token Ticker symbol
  const tokenTicker = useMemo(() => {
    const cleanName = artist.name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return cleanName.substring(0, 4) + 'T';
  }, [artist]);

  // Read relevant tracks for this artist to give quick streaming access
  const artistTracks = useMemo(() => {
    // If we have local or context tracks, let's filter them
    const cachedTracksString = localStorage.getItem('tonjam_tracks');
    if (cachedTracksString) {
      try {
        const parsed = JSON.parse(cachedTracksString) as Track[];
        return parsed.filter(t => t.artistId === artist.uid || t.artist === artist.name);
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [artist]);

  // Hook up real-time listener to Firestore stats
  useEffect(() => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Fan token balance listener
    const balanceDocId = `${userProfile.uid}_${artist.uid}`;
    const tokenRef = doc(db, 'fanTokens', balanceDocId);
    const unsubBalance = onSnapshot(tokenRef, (docSnap) => {
      if (docSnap.exists()) {
        setTokenBalance((docSnap.data() as FanTokenBalance).balance || 0);
      } else {
        setTokenBalance(0);
      }
    }, (error) => {
      console.warn("Could not fetch fan token balance dynamically:", error);
    });

    // 2. Query actual owned NFTs from Firestore collection
    const nftsQuery = query(
      collection(db, 'nfts'),
      where('ownerId', '==', userProfile.uid)
    );

    const unsubNFTs = onSnapshot(nftsQuery, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NFTItem));
      // Filter items matching current artist name or artistId
      const artistSpecificNFTs = items.filter(n => n.artistId === artist.uid || n.creator === artist.name);
      setOwnedNFTListings(artistSpecificNFTs);
    }, (error) => {
      console.warn("Could not watch NFTs dynamically:", error);
    });

    // 3. Listening plays count state (load/simulate play tracking count)
    const localPlayKey = `fan_power_plays_${userProfile.uid}_${artist.uid}`;
    const savedPlays = localStorage.getItem(localPlayKey);
    if (savedPlays) {
      setTrackPlays(parseInt(savedPlays, 10));
    } else {
      // Calculate from recentlyPlayed context list matching artist
      const matchHistoryCount = recentlyPlayed.filter(t => t.artistId === artist.uid || t.artist === artist.name).length;
      // Seed initial engagement if they have some listens
      const initialSeedPlays = matchHistoryCount > 0 ? matchHistoryCount : Math.floor(Math.random() * 4);
      setTrackPlays(initialSeedPlays);
      localStorage.setItem(localPlayKey, initialSeedPlays.toString());
    }

    setLoading(false);

    return () => {
      unsubBalance();
      unsubNFTs();
    };
  }, [userProfile?.uid, artist.uid, recentlyPlayed]);

  const setOwnedNFTListings = (list: NFTItem[]) => {
    setOwnedNFTs(list);
    setOwnedNFTCount(list.length);
  };

  // Score weights definitions
  const TOKEN_MULTIPLIER = 2; // 2 points per Fan Token
  const PLAY_MULTIPLIER = 50;  // 50 points per stream play
  const NFT_MULTIPLIER = 500;  // 500 points per NFT owned

  // Compute overall Fan Power details
  const scoreDetails = useMemo(() => {
    const tokenPoints = tokenBalance * TOKEN_MULTIPLIER;
    const playPoints = trackPlays * PLAY_MULTIPLIER;
    const nftPoints = ownedNFTCount * NFT_MULTIPLIER;
    const totalScore = tokenPoints + playPoints + nftPoints;

    // Define tiers
    let tier = 'Bronze Initiate';
    let nextTier = 'Silver Soundwave';
    let nextTierMin = 500;
    let currentTierMin = 0;
    let badgeColor = 'text-amber-600 bg-amber-500/10';
    let gradientStyle = 'from-amber-600/20 to-orange-600/5';

    if (totalScore >= 3000) {
      tier = 'Obsidian Vanguard';
      nextTier = 'Cosmic Legend';
      nextTierMin = 5000;
      currentTierMin = 3000;
      badgeColor = 'text-indigo-400 bg-indigo-500/10';
      gradientStyle = 'from-indigo-600/20 to-violet-900/10';
    } else if (totalScore >= 1800) {
      tier = 'Platinum Amplifier';
      nextTier = 'Obsidian Vanguard';
      nextTierMin = 3000;
      currentTierMin = 1800;
      badgeColor = 'text-cyan-400 bg-cyan-500/10';
      gradientStyle = 'from-cyan-600/20 to-blue-900/10';
    } else if (totalScore >= 1000) {
      tier = 'Gold Decibel';
      nextTier = 'Platinum Amplifier';
      nextTierMin = 1800;
      currentTierMin = 1000;
      badgeColor = 'text-yellow-400 bg-yellow-500/10';
      gradientStyle = 'from-yellow-600/20 to-amber-900/10';
    } else if (totalScore >= 500) {
      tier = 'Silver Soundwave';
      nextTier = 'Gold Decibel';
      nextTierMin = 1000;
      currentTierMin = 500;
      badgeColor = 'text-slate-300 bg-slate-100/10';
      gradientStyle = 'from-slate-500/20 to-zinc-900/10';
    }

    const progressPercent = Math.min(
      100,
      Math.max(0, ((totalScore - currentTierMin) / (nextTierMin - currentTierMin)) * 100)
    );

    return {
      tokenPoints,
      playPoints,
      nftPoints,
      totalScore,
      tier,
      nextTier,
      nextTierMin,
      currentTierMin,
      progressPercent,
      badgeColor,
      gradientStyle
    };
  }, [tokenBalance, trackPlays, ownedNFTCount]);

  // Recharts Radar Chart Formatter
  const chartData = useMemo(() => {
    // Normalize data between 0 and 100 for a perfectly proportioned spider chart
    return [
      {
        subject: 'Fan Tokens',
        value: Math.min(100, (tokenBalance / 400) * 100),
        raw: `${tokenBalance} ${tokenTicker}`,
        color: '#3b82f6'
      },
      {
        subject: 'Music Streams',
        value: Math.min(100, (trackPlays / 20) * 100),
        raw: `${trackPlays} Streams`,
        color: '#10b981'
      },
      {
        subject: 'NFT Collectibles',
        value: Math.min(100, (ownedNFTCount / 3) * 100),
        raw: `${ownedNFTCount} NFTs`,
        color: '#ec4899'
      }
    ];
  }, [tokenBalance, trackPlays, ownedNFTCount, tokenTicker]);

  // Recharts Bar Data breakdown
  const barData = useMemo(() => {
    return [
      { name: 'Tokens', points: scoreDetails.tokenPoints, fill: '#3b82f6' },
      { name: 'Streams', points: scoreDetails.playPoints, fill: '#10b981' },
      { name: 'NFTs', points: scoreDetails.nftPoints, fill: '#ec4899' }
    ];
  }, [scoreDetails]);

  // Sonic play handler (Simulate playing and earning real-time metrics value)
  const handleBoostListening = async (track: Track) => {
    if (!userProfile?.uid) {
      toast.error('Please register/login to track your fan engagement history');
      return;
    }

    try {
      setBoosting(track.id);
      // Play the track in audio player
      await playTrack(track);

      // Increment local count & save
      const current = trackPlays + 1;
      setTrackPlays(current);
      const localPlayKey = `fan_power_plays_${userProfile.uid}_${artist.uid}`;
      localStorage.setItem(localPlayKey, current.toString());

      // Reward fan tokens randomly or statically for listening engagement
      await earnFanTokens(userProfile.uid, artist.uid, 15, `streaming "${track.title}"`);
      if (refreshProfile) await refreshProfile();
      
      toast.success(`Engagement reported! Fan power boosted by +50 XP and earned +15 ${tokenTicker}!`);
    } catch (err) {
      console.warn("Failed engagement tracking:", err);
    } finally {
      setBoosting(null);
    }
  };

  const handleTestLevelUp = () => {
    if (!userProfile?.uid) {
      toast.error('Please sign in first');
      return;
    }
    // Boost tracks played metric statically
    const current = trackPlays + 5;
    setTrackPlays(current);
    const localPlayKey = `fan_power_plays_${userProfile.uid}_${artist.uid}`;
    localStorage.setItem(localPlayKey, current.toString());
    addNotification("Engagement power boosted!", "success");
    toast.success("Engagement multiplier applied! Added +250 XP total impact points.");
  };

  if (!userProfile?.uid) {
    return (
      <div className="bg-[#1c1c1e]/40 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-sans text-white">Unlock Your Fan Power</h3>
        <p className="text-xs text-muted-foreground leading-normal max-w-md mx-auto">
          Sign in/Register or sync your wallet to track fan tokens, streaming plays, and collectible counts. Discover your standing on {artist.name}'s verified community tier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in pb-12">
      
      {/* HEADER TIER PANEL */}
      <div className={`bg-gradient-to-br ${scoreDetails.gradientStyle} rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${scoreDetails.badgeColor}`}>
              {scoreDetails.tier}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Verified Fan Status</span>
          </div>
          <h2 className="text-3xl font-black text-white font-sans tracking-tight">
            {scoreDetails.totalScore.toLocaleString()} <span className="text-sm text-muted-foreground uppercase font-semibold">Impact XP</span>
          </h2>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            Your cumulative impact is calibrated dynamically across blockchain token holds, unique track plays, and digital physical pressings.
          </p>
        </div>

        {/* Circular Radial Gauge */}
        <div className="flex flex-col items-end w-full md:w-auto space-y-2">
          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-white">Next Tier: {scoreDetails.nextTier}</span>
              <span className="text-muted-foreground font-mono">{scoreDetails.totalScore} / {scoreDetails.nextTierMin} XP</span>
            </div>
            {/* Smooth progress track bar without borders */}
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scoreDetails.progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground block text-right font-medium">
              {(scoreDetails.nextTierMin - scoreDetails.totalScore).toLocaleString()} XP to unlock next standing tier
            </span>
          </div>
        </div>
      </div>

      {/* THREE PILLAR IMPACT BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Token stats */}
        <div className="bg-[#1c1c1e]/40 rounded-2xl p-6 flex items-start gap-4 justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tokens Owned</h4>
              <p className="text-2xl font-black text-white tracking-tight mt-1">
                {tokenBalance.toLocaleString()} <span className="text-xs font-bold uppercase text-blue-400">{tokenTicker}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-blue-400">+{scoreDetails.tokenPoints} XP</span>
        </div>

        {/* Streams stats */}
        <div className="bg-[#1c1c1e]/40 rounded-2xl p-6 flex items-start gap-4 justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tracks Streamed</h4>
              <p className="text-2xl font-black text-white tracking-tight mt-1">
                {trackPlays.toLocaleString()} <span className="text-xs font-bold uppercase text-emerald-400">Plays</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">+{scoreDetails.playPoints} XP</span>
        </div>

        {/* NFTs stats */}
        <div className="bg-[#1c1c1e]/40 rounded-2xl p-6 flex items-start gap-4 justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">NFT Collections</h4>
              <p className="text-2xl font-black text-white tracking-tight mt-1">
                {ownedNFTCount.toLocaleString()} <span className="text-xs font-bold uppercase text-pink-400">Assets</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-pink-400">+{scoreDetails.nftPoints} XP</span>
        </div>

      </div>

      {/* CHARTS CONTAINER (No hard borders, styled beautifully using contrasting containers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Radar balance visualization */}
        <div className="lg:col-span-7 bg-[#1c1c1e]/20 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> Pillar Balance Outline
            </h4>
            <p className="text-xs text-muted-foreground">
              A customized spider analysis showing the consistency of your engagement in the ecosystem.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#ffffff0a" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#88888b', fontSize: 11, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Engagement %"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                />
                <Tooltip 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-black/90 p-2.5 rounded-lg text-xs border border-white/5 space-y-1">
                          <p className="text-white font-extrabold">{data.subject}</p>
                          <p className="text-semibold" style={{ color: data.color }}>{data.raw}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic score block chart */}
        <div className="lg:col-span-5 bg-[#1c1c1e]/20 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" /> Point Breakdown
            </h4>
            <p className="text-xs text-muted-foreground">
              Comparative impact score weight allocation.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#88888b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#88888b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-black/95 p-3 rounded-xl border border-white/5 text-xs">
                          <span className="font-bold text-white">{data.name}: </span>
                          <span className="font-mono text-blue-400 font-extrabold">{data.points} XP</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <circle key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[11px] text-muted-foreground leading-normal bg-black/10 p-3 rounded-xl">
            <div className="flex justify-between">
              <span>Holding 1 $TKT</span>
              <span className="font-mono font-bold text-blue-400">+2 XP</span>
            </div>
            <div className="flex justify-between">
              <span>Stream play of 1 Track</span>
              <span className="font-mono font-bold text-emerald-400">+50 XP</span>
            </div>
            <div className="flex justify-between">
              <span>Possessing 1 NFT Artifact</span>
              <span className="font-mono font-bold text-pink-400">+500 XP</span>
            </div>
          </div>
        </div>

      </div>

      {/* ACTIVE BOOST CONTROLLERS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" /> Power Boost Command Center
            </h3>
            <p className="text-xs text-muted-foreground">
              Stream {artist.name}'s tracks to immediately elevate your sound play impact score list on the cryptographic ledger.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTestLevelUp}
              className="py-1.5 px-3 bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-white rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer"
            >
              Simulate Engagement
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {artistTracks.length > 0 ? (
            artistTracks.slice(0, 3).map((track) => {
              const isPlayingNow = boosting === track.id;
              return (
                <div 
                  key={track.id} 
                  className="bg-[#1c1c1e]/30 rounded-xl p-4 flex items-center justify-between gap-4 justify-between"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img 
                      src={track.coverUrl || artist.avatarUrl} 
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{track.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{track.genre || 'Electronic'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBoostListening(track)}
                    disabled={isPlayingNow}
                    className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 rounded-full transition-all cursor-pointer flex items-center justify-center"
                    title="Stream & boost fan power"
                  >
                    {isPlayingNow ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-current text-emerald-400" />
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-6 bg-white/[0.01] rounded-xl text-xs text-muted-foreground">
              No metadata tracks registered for boost streamings. Play catalog tracks globally to record plays.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

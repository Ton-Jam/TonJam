import React, { useMemo, useEffect } from "react";
import { 
  Trophy, 
  Crown, 
  Gem, 
  Award, 
  Shield, 
  Star,
  ChevronRight,
  Zap
} from "lucide-react";
import { UserProfile, NFTItem } from "@/types";
import { useAudio } from "@/context/AudioContext";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CollectorTierProps {
  user: UserProfile;
  isOwnProfile: boolean;
}

export type TierType = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Legend' | 'None';

interface Tier {
  id: TierType;
  name: string;
  minNFTs: number;
  color: string;
  icon: React.ComponentType<any>;
  description: string;
}

const TIERS: Tier[] = [
  {
    id: 'Legend',
    name: 'TONJAM LEGEND',
    minNFTs: 50,
    color: '#F59E0B',
    icon: Trophy,
    description: 'Supreme architecture holder. Shaping the sonic landscape of the decentralized web.'
  },
  {
    id: 'Platinum',
    name: 'PLATINUM ARCHITECT',
    minNFTs: 25,
    color: '#94A3B8',
    icon: Gem,
    description: 'Elite curator of structural sound. Driving the high-fidelity protocol forward.'
  },
  {
    id: 'Gold',
    name: 'GOLD PATRON',
    minNFTs: 10,
    color: '#EAB308',
    icon: Crown,
    description: 'Significant artifact holder. Powering the artistic engine of TONJam.'
  },
  {
    id: 'Silver',
    name: 'SILVER GUARDIAN',
    minNFTs: 5,
    color: '#CBD5E1',
    icon: Shield,
    description: 'Dedicated collector maintaining a diverse registry of frequencies.'
  },
  {
    id: 'Bronze',
    name: 'BRONZE COLLECTOR',
    minNFTs: 1,
    color: '#B45309',
    icon: Award,
    description: 'Beginning the journey into decentralized sonic ownership.'
  }
];

const CollectorTier: React.FC<CollectorTierProps> = ({ user, isOwnProfile }) => {
  const { allNFTs, userProfile, setUserProfile } = useAudio();

  const nftCount = useMemo(() => {
    return allNFTs.filter(nft => nft.owner === user.walletAddress || nft.owner === user.name).length;
  }, [allNFTs, user.walletAddress, user.name]);

  const currentTier = useMemo(() => {
    for (const tier of TIERS) {
      if (nftCount >= tier.minNFTs) return tier;
    }
    return null;
  }, [nftCount]);

  const nextTier = useMemo(() => {
    const reversedTiers = [...TIERS].reverse();
    for (const tier of reversedTiers) {
      if (nftCount < tier.minNFTs) return tier;
    }
    return null;
  }, [nftCount]);

  const progress = useMemo(() => {
    if (!nextTier) return 100;
    const prevMin = currentTier ? currentTier.minNFTs : 0;
    const diff = nextTier.minNFTs - prevMin;
    const currentDiff = nftCount - prevMin;
    return Math.min(100, Math.round((currentDiff / diff) * 100));
  }, [nftCount, currentTier, nextTier]);

  // Sync tier to database if changed
  useEffect(() => {
    if (!isOwnProfile || !user.uid) return;

    const newTierId = currentTier ? currentTier.id : 'None';
    if (user.collectorTier !== newTierId) {
      const updateTier = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            collectorTier: newTierId
          });
          setUserProfile({ ...userProfile, collectorTier: newTierId as any });
        } catch (e) {
          console.error("Failed to sync collector tier", e);
        }
      };
      updateTier();
    }
  }, [currentTier, userProfile.collectorTier, isOwnProfile, user.uid]);

  if (!currentTier && !isOwnProfile) return null;

  return (
    <div className="w-full bg-white/[0.03] border border-white/5 rounded-3xl p-6 overflow-hidden relative group transition-all hover:bg-white/[0.05]">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Collector Protocol</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter">
            {currentTier ? currentTier.name : 'UNRANKED'}
          </h3>
        </div>

        {currentTier && (
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border border-white/10"
            style={{ backgroundColor: `${currentTier.color}10` }}
          >
            <currentTier.icon size={24} style={{ color: currentTier.color }} />
          </div>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Ownership Registry</p>
            <p className="text-lg font-black font-mono">{nftCount} Artifacts</p>
          </div>
          {nextTier && (
            <div className="text-right space-y-1">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Next Protocol Level</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                {nextTier.id} at {nextTier.minNFTs}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            <span>{currentTier?.minNFTs || 0} Level</span>
            <span>{nextTier?.minNFTs || '∞'} Target</span>
          </div>
        </div>

        {currentTier && (
          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-widest border-t border-white/5 pt-4 mt-2">
            {currentTier.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CollectorTier;

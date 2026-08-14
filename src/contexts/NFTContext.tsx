import React, { createContext, useContext, useState, useEffect } from 'react';
import { NFTItem, Track } from '@/types';
import { MOCK_NFTS } from '@/constants';

export interface MintingStatus {
  trackId: string;
  step: 'idle' | 'uploading' | 'metadata' | 'blockchain' | 'registering' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
  txHash?: string;
  ipfsHash?: string;
  timestamp?: number;
  price?: string;
  editions?: string;
  royaltySplits?: { address: string; percentage: number }[];
}

interface NFTContextType {
  nfts: NFTItem[];
  setNfts: React.Dispatch<React.SetStateAction<NFTItem[]>>;
  isMinting: boolean;
  setIsMinting: (isMinting: boolean) => void;
  mintingStatus: Record<string, MintingStatus>;
  updateMintingStatus: (trackId: string, status: Partial<MintingStatus>) => void;
  removeMintingStatus: (trackId: string) => void;
  clearCompletedMints: () => void;
  addNFT: (nft: NFTItem) => void;
  updateNFT: (nftId: string, updates: Partial<NFTItem>) => void;
  stakeNFT: (nftId: string, lockPeriodDays: number, ownerAddress?: string) => Promise<boolean>;
  unstakeNFT: (nftId: string) => Promise<boolean>;
  claimNFTGovernanceRewards: (nftId: string) => Promise<number>;
  getNFTByTrackId: (trackId: string) => NFTItem | undefined;
  getNFTsByOwner: (ownerAddressOrId: string) => NFTItem[];
  getNFTsByArtist: (artistId: string) => NFTItem[];
  getStakedNFTsByOwner: (ownerAddressOrId: string) => NFTItem[];
}

const NFTContext = createContext<NFTContextType | null>(null);

export const useNFT = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFT must be used within an NFTProvider');
  }
  return context;
};

export const NFTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<Record<string, MintingStatus>>({});

  // Initialize with mock NFTs or from localStorage if available
  useEffect(() => {
    const cached = localStorage.getItem('tonjam_nfts');
    if (cached) {
      try {
        setNfts(JSON.parse(cached));
      } catch (e) {
        setNfts(MOCK_NFTS);
      }
    } else {
      setNfts(MOCK_NFTS);
    }
  }, []);

  const updateMintingStatus = (trackId: string, status: Partial<MintingStatus>) => {
    setMintingStatus((prev) => {
      const current = prev[trackId] || {
        trackId,
        step: 'idle',
        progress: 0,
        message: 'Initialized',
      };
      return {
        ...prev,
        [trackId]: {
          ...current,
          ...status,
        },
      };
    });
  };

  const removeMintingStatus = (trackId: string) => {
    setMintingStatus((prev) => {
      const copy = { ...prev };
      delete copy[trackId];
      return copy;
    });
  };

  const clearCompletedMints = () => {
    setMintingStatus((prev) => {
      const filtered: Record<string, MintingStatus> = {};
      Object.entries(prev).forEach(([id, item]) => {
        if (item.step !== 'completed') {
          filtered[id] = item;
        }
      });
      return filtered;
    });
  };

  const addNFT = (nft: NFTItem) => {
    setNfts((prev) => {
      const updated = [nft, ...prev];
      localStorage.setItem('tonjam_nfts', JSON.stringify(updated));
      return updated;
    });
  };

  const updateNFT = (nftId: string, updates: Partial<NFTItem>) => {
    setNfts((prev) => {
      const updated = prev.map((item) => (item.id === nftId ? { ...item, ...updates } : item));
      localStorage.setItem('tonjam_nfts', JSON.stringify(updated));
      return updated;
    });
  };

  const stakeNFT = async (nftId: string, lockPeriodDays: number, ownerAddress?: string): Promise<boolean> => {
    const target = nfts.find((n) => n.id === nftId);
    if (!target) return false;

    // Determine APY based on lock period
    let apy = 12;
    if (lockPeriodDays >= 365) apy = 80;
    else if (lockPeriodDays >= 180) apy = 45;
    else if (lockPeriodDays >= 90) apy = 25;

    const now = new Date().toISOString();

    updateNFT(nftId, {
      isStaked: true,
      stakedAt: now,
      stakedLockPeriodDays: lockPeriodDays,
      stakedApy: apy,
      stakedRewardsEarned: 0,
      stakedOwnerAddress: ownerAddress || target.owner,
      history: [
        {
          event: 'Staked',
          from: target.owner,
          to: 'TonJam Staking Vault',
          date: now,
          price: target.price,
        },
        ...(target.history || []),
      ],
    });

    return true;
  };

  const unstakeNFT = async (nftId: string): Promise<boolean> => {
    const target = nfts.find((n) => n.id === nftId);
    if (!target || !target.isStaked) return false;

    const now = new Date().toISOString();

    updateNFT(nftId, {
      isStaked: false,
      stakedAt: undefined,
      stakedLockPeriodDays: undefined,
      stakedApy: undefined,
      history: [
        {
          event: 'Unstaked',
          from: 'TonJam Staking Vault',
          to: target.stakedOwnerAddress || target.owner,
          date: now,
          price: target.price,
        },
        ...(target.history || []),
      ],
    });

    return true;
  };

  const claimNFTGovernanceRewards = async (nftId: string): Promise<number> => {
    const target = nfts.find((n) => n.id === nftId);
    if (!target || !target.isStaked) return 0;

    // Calculate accrued rewards
    const stakedTime = target.stakedAt ? new Date(target.stakedAt).getTime() : Date.now();
    const daysElapsed = Math.max(0.1, (Date.now() - stakedTime) / (1000 * 60 * 60 * 24));
    const baseDailyReward = parseFloat(target.price) * 1.5; // Governance tokens daily
    const earned = Math.round((daysElapsed * baseDailyReward * ((target.stakedApy || 12) / 100)) * 100) / 100;

    updateNFT(nftId, {
      stakedRewardsEarned: 0, // Reset counter after claiming
      stakedAt: new Date().toISOString(), // Reset baseline
    });

    return earned || 25.5;
  };

  const getNFTByTrackId = (trackId: string) => {
    return nfts.find((n) => n.trackId === trackId);
  };

  const getNFTsByOwner = (ownerAddressOrId: string) => {
    if (!ownerAddressOrId) return [];
    const normalized = ownerAddressOrId.toLowerCase();
    return nfts.filter(
      (n) =>
        n.owner.toLowerCase() === normalized ||
        (n.ownerId && n.ownerId.toLowerCase() === normalized) ||
        (n.stakedOwnerAddress && n.stakedOwnerAddress.toLowerCase() === normalized)
    );
  };

  const getStakedNFTsByOwner = (ownerAddressOrId: string) => {
    if (!ownerAddressOrId) return [];
    const normalized = ownerAddressOrId.toLowerCase();
    return nfts.filter(
      (n) =>
        n.isStaked &&
        (n.owner.toLowerCase() === normalized ||
          (n.stakedOwnerAddress && n.stakedOwnerAddress.toLowerCase() === normalized) ||
          (n.ownerId && n.ownerId.toLowerCase() === normalized))
    );
  };

  const getNFTsByArtist = (artistId: string) => {
    if (!artistId) return [];
    return nfts.filter((n) => n.artistId === artistId);
  };

  return (
    <NFTContext.Provider
      value={{
        nfts,
        setNfts,
        isMinting,
        setIsMinting,
        mintingStatus,
        updateMintingStatus,
        removeMintingStatus,
        clearCompletedMints,
        addNFT,
        updateNFT,
        stakeNFT,
        unstakeNFT,
        claimNFTGovernanceRewards,
        getNFTByTrackId,
        getNFTsByOwner,
        getNFTsByArtist,
        getStakedNFTsByOwner,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};

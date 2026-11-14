import React, { createContext, useContext, useState, useEffect } from 'react';
import { NFTItem } from '@/types';
import { db, auth, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

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
  loading: boolean;
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

const FALLBACK_NFT_CONTEXT: NFTContextType = {
  nfts: [],
  setNfts: () => {},
  loading: false,
  isMinting: false,
  mintingStatus: {},
  setIsMinting: () => {},
  updateMintingStatus: () => {},
  removeMintingStatus: () => {},
  clearCompletedMints: () => {},
  addNFT: () => {},
  updateNFT: () => {},
  stakeNFT: async () => false,
  unstakeNFT: async () => false,
  claimNFTGovernanceRewards: async () => 0,
  getNFTByTrackId: () => undefined,
  getNFTsByOwner: () => [],
  getNFTsByArtist: () => [],
  getStakedNFTsByOwner: () => [],
};

export const useNFT = () => {
  const context = useContext(NFTContext);
  if (!context) {
    return FALLBACK_NFT_CONTEXT;
  }
  return context;
};

export const NFTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<Record<string, MintingStatus>>({});

  // Subscribe to real-time NFTs collection in Firestore
  useEffect(() => {
    let mounted = true;
    const unsub = onSnapshot(
      collection(db, 'nfts'),
      (snapshot) => {
        if (!mounted) return;
        const list = snapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as NFTItem
        );
        setNfts(list);
        setLoading(false);
      },
      (error) => {
        if (mounted) setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'nfts');
      }
    );

    return () => {
      mounted = false;
      unsub();
    };
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
      if (prev.some((item) => item.id === nft.id)) return prev;
      return [nft, ...prev];
    });
    if (auth.currentUser && nft.id) {
      setDoc(doc(db, 'nfts', nft.id), cleanUpdateData(nft as any), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `nfts/${nft.id}`);
      });
    }
  };

  const updateNFT = (nftId: string, updates: Partial<NFTItem>) => {
    setNfts((prev) => prev.map((item) => (item.id === nftId ? { ...item, ...updates } : item)));
    if (auth.currentUser && nftId) {
      updateDoc(doc(db, 'nfts', nftId), cleanUpdateData(updates as any)).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `nfts/${nftId}`);
      });
    }
  };

  const stakeNFT = async (nftId: string, lockPeriodDays: number, ownerAddress?: string): Promise<boolean> => {
    const target = nfts.find((n) => n.id === nftId);
    if (!target || !auth.currentUser) return false;

    let apy = 12;
    if (lockPeriodDays >= 365) apy = 80;
    else if (lockPeriodDays >= 180) apy = 45;
    else if (lockPeriodDays >= 90) apy = 25;

    const now = new Date().toISOString();
    const updates: Partial<NFTItem> = {
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
    };

    try {
      await updateDoc(doc(db, 'nfts', nftId), cleanUpdateData(updates as any));
      setNfts((prev) => prev.map((item) => (item.id === nftId ? { ...item, ...updates } : item)));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `nfts/${nftId}`);
      return false;
    }
  };

  const unstakeNFT = async (nftId: string): Promise<boolean> => {
    const target = nfts.find((n) => n.id === nftId);
    if (!target || !target.isStaked || !auth.currentUser) return false;

    const now = new Date().toISOString();
    const updates: Partial<NFTItem> = {
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
    };

    try {
      await updateDoc(doc(db, 'nfts', nftId), cleanUpdateData(updates as any));
      setNfts((prev) => prev.map((item) => (item.id === nftId ? { ...item, ...updates } : item)));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `nfts/${nftId}`);
      return false;
    }
  };

  const claimNFTGovernanceRewards = async (nftId: string): Promise<number> => {
    const target = nfts.find((n) => n.id === nftId);
    if (!target || !target.isStaked || !auth.currentUser) return 0;

    const stakedTime = target.stakedAt ? new Date(target.stakedAt).getTime() : Date.now();
    const daysElapsed = Math.max(0, (Date.now() - stakedTime) / (1000 * 60 * 60 * 24));
    const baseDailyReward = (parseFloat(target.price) || 0) * 1.5;
    const earned = Math.round(daysElapsed * baseDailyReward * ((target.stakedApy || 12) / 100) * 100) / 100;

    if (earned <= 0) return 0;

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'nfts', nftId), {
        stakedRewardsEarned: 0,
        stakedAt: now,
      });
      setNfts((prev) =>
        prev.map((item) =>
          item.id === nftId ? { ...item, stakedRewardsEarned: 0, stakedAt: now } : item
        )
      );
      return earned;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `nfts/${nftId}`);
      return 0;
    }
  };

  const getNFTByTrackId = (trackId: string) => {
    return nfts.find((n) => n.trackId === trackId);
  };

  const getNFTsByOwner = (ownerAddressOrId: string) => {
    if (!ownerAddressOrId) return [];
    const normalized = ownerAddressOrId.toLowerCase();
    return nfts.filter(
      (n) =>
        (n.owner || '').toLowerCase() === normalized ||
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
        ((n.owner || '').toLowerCase() === normalized ||
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
        loading,
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

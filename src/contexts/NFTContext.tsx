import React, { createContext, useContext, useState, useEffect } from 'react';
import { NFTItem, Track } from '@/types';
import { MOCK_NFTS } from '@/constants';

export interface MintingStatus {
  trackId: string;
  step: 'idle' | 'uploading' | 'metadata' | 'blockchain' | 'registering' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

interface NFTContextType {
  nfts: NFTItem[];
  setNfts: React.Dispatch<React.SetStateAction<NFTItem[]>>;
  isMinting: boolean;
  setIsMinting: (isMinting: boolean) => void;
  mintingStatus: Record<string, MintingStatus>;
  updateMintingStatus: (trackId: string, status: Partial<MintingStatus>) => void;
  addNFT: (nft: NFTItem) => void;
  getNFTByTrackId: (trackId: string) => NFTItem | undefined;
  getNFTsByOwner: (ownerAddressOrId: string) => NFTItem[];
  getNFTsByArtist: (artistId: string) => NFTItem[];
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

  const addNFT = (nft: NFTItem) => {
    setNfts((prev) => {
      const updated = [nft, ...prev];
      localStorage.setItem('tonjam_nfts', JSON.stringify(updated));
      return updated;
    });
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
        (n.ownerId && n.ownerId.toLowerCase() === normalized)
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
        addNFT,
        getNFTByTrackId,
        getNFTsByOwner,
        getNFTsByArtist,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};

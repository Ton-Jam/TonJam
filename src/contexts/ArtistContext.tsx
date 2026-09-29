import React, { createContext, useContext, useState } from 'react';
import { Artist, NFTItem } from '@/types';
import { MOCK_ARTISTS, MOCK_NFTS } from '@/constants';

interface ArtistContextType {
  artists: Artist[];
  nfts: NFTItem[];
  getArtistById: (uid: string) => Artist | undefined;
  getArtistNFTs: (uid: string) => NFTItem[];
}

const ArtistContext = createContext<ArtistContextType | null>(null);

const FALLBACK_ARTIST_CONTEXT: ArtistContextType = {
  artists: MOCK_ARTISTS,
  nfts: MOCK_NFTS,
  getArtistById: (uid: string) => MOCK_ARTISTS.find((a) => a.uid === uid),
  getArtistNFTs: (uid: string) => MOCK_NFTS.filter((n) => n.creator === uid || n.artist === uid),
};

export const useArtist = () => {
  const context = useContext(ArtistContext);
  if (!context) {
    return FALLBACK_ARTIST_CONTEXT;
  }
  return context;
};

export const ArtistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artists] = useState<Artist[]>(MOCK_ARTISTS);
  const [nfts] = useState<NFTItem[]>(MOCK_NFTS);

  const getArtistById = (uid: string) => {
    return artists.find((a) => a.uid === uid);
  };

  const getArtistNFTs = (uid: string) => {
    const artist = getArtistById(uid);
    const artistName = artist?.name || '';
    return nfts.filter(
      (n) =>
        n.artistId === uid ||
        n.ownerId === uid ||
        (artistName && n.creator?.toLowerCase() === artistName.toLowerCase()) ||
        (artistName && n.artist?.toLowerCase() === artistName.toLowerCase())
    );
  };

  return (
    <ArtistContext.Provider value={{ artists, nfts, getArtistById, getArtistNFTs }}>
      {children}
    </ArtistContext.Provider>
  );
};


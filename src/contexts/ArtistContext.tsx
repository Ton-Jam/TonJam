import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artist, NFTItem } from '@/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface ArtistContextType {
  artists: Artist[];
  nfts: NFTItem[];
  loading: boolean;
  getArtistById: (uid: string) => Artist | undefined;
  getArtistNFTs: (uid: string) => NFTItem[];
}

const ArtistContext = createContext<ArtistContextType | null>(null);

const FALLBACK_ARTIST_CONTEXT: ArtistContextType = {
  artists: [],
  nfts: [],
  loading: false,
  getArtistById: () => undefined,
  getArtistNFTs: () => [],
};

export const useArtist = () => {
  const context = useContext(ArtistContext);
  if (!context) {
    return FALLBACK_ARTIST_CONTEXT;
  }
  return context;
};

export const ArtistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const artistsQuery = query(
      collection(db, 'users'),
      where('isVerifiedArtist', '==', true)
    );

    const unsubArtists = onSnapshot(
      artistsQuery,
      (snapshot) => {
        if (!mounted) return;
        const list = snapshot.docs.map((docSnap) => {
          const u = docSnap.data() as any;
          return {
            uid: docSnap.id,
            name: u.name || 'Artist',
            username: u.username,
            walletAddress: u.walletAddress || '',
            avatarUrl: u.avatar || u.avatarUrl || '',
            followers: Number(u.followers || 0),
            verified: Boolean(u.isVerifiedArtist || u.isVerified),
            isVerifiedArtist: Boolean(u.isVerifiedArtist),
            verificationStatus: u.verificationStatus || 'verified',
            genre: u.genre || u.favoriteGenres?.[0] || 'Electronic',
            bio: u.bio || '',
            bannerUrl: u.bannerUrl || '',
            socials: u.socials,
            totalStreams: Number(u.totalStreams || 0),
            monthlyListeners: Number(u.monthlyListeners || 0),
            earnings: {
              streaming: Number(u.streamingEarnings || 0),
              nftSales: Number(u.nftEarnings || 0),
              total: Number(u.earnings || 0),
            },
          } as Artist;
        });
        setArtists(list);
        setLoading(false);
      },
      (error) => {
        if (mounted) setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    const unsubNfts = onSnapshot(
      collection(db, 'nfts'),
      (snapshot) => {
        if (!mounted) return;
        const list = snapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as NFTItem
        );
        setNfts(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'nfts');
      }
    );

    return () => {
      mounted = false;
      unsubArtists();
      unsubNfts();
    };
  }, []);

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
    <ArtistContext.Provider value={{ artists, nfts, loading, getArtistById, getArtistNFTs }}>
      {children}
    </ArtistContext.Provider>
  );
};

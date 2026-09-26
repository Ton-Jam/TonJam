import React, { useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useLibraryData } from './hooks/useLibraryData';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { Play, Shuffle } from 'lucide-react';
import { NFTItem, Track } from '@/types';
import { SpotifyTrackRow } from './components/SpotifyTrackRow';

export const MyNFTTracks: React.FC = () => {
  const { setHeaderTitle, userNFTs, playAll, isShuffle, toggleShuffle } = useAudio();
  const { nfts: contextNfts } = useNFT();
  const libraryData = useLibraryData();

  useEffect(() => {
    setHeaderTitle('My NFT Tracks');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  // Combine userNFTs from AudioContext, NFTContext, and LibraryData
  const activeNfts: NFTItem[] = useMemo(() => {
    if (userNFTs && userNFTs.length > 0) {
      return userNFTs;
    }

    if (contextNfts && contextNfts.length > 0) {
      return contextNfts;
    }

    // Map LibraryNFT format to NFTItem if needed
    if (libraryData.nfts && libraryData.nfts.length > 0) {
      return libraryData.nfts.map((n) => ({
        id: n.id,
        trackId: n.id,
        title: n.title,
        artist: n.artist,
        artistId: 'artist-1',
        owner: 'You',
        creator: n.artist,
        price: `${n.floorPriceTon || 5} TON`,
        imageUrl: n.coverUrl,
        coverUrl: n.coverUrl,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        edition: '1 of 50',
        rarity: 'Rare',
        contractAddress: 'EQBvW_NFT_Music_Master_TonJam'
      }));
    }

    return [];
  }, [userNFTs, contextNfts, libraryData.nfts]);

  // Convert NFTItems to standard Track format for SpotifyTrackRow and playback
  const mappedTracks: { track: Track; nft: NFTItem }[] = useMemo(() => {
    return activeNfts.map((n) => ({
      nft: n,
      track: {
        id: n.trackId || n.id,
        songId: n.trackId || n.id,
        title: n.title,
        artist: n.artist || n.creator || 'TonJam Artist',
        artistId: n.artistId || 'artist-1',
        coverUrl: n.coverUrl || n.imageUrl,
        audioUrl: n.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 210,
        streams: 15000,
        playCount: 15000,
        album: 'NFT Master',
        genre: 'NFT Music',
        isNFT: true,
        createdAt: new Date().toISOString()
      }
    }));
  }, [activeNfts]);

  const handlePlayAll = () => {
    if (mappedTracks.length > 0) {
      playAll(mappedTracks.map((m) => m.track));
    }
  };

  const handleShufflePlay = () => {
    if (mappedTracks.length > 0) {
      if (!isShuffle) toggleShuffle();
      const shuffled = [...mappedTracks].sort(() => Math.random() - 0.5);
      playAll(shuffled.map((m) => m.track));
    }
  };

  return (
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-4" topSpacing="default">
      {/* 1. MINIMAL HEADER */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" ariaLabel="Back to Library" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
            My NFT Tracks
          </h1>
        </div>

        {mappedTracks.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShufflePlay}
              className={`p-2 rounded-full transition-colors cursor-pointer active:scale-95 ${
                isShuffle ? 'text-[#00B4D8]' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
              aria-label="Shuffle play NFT tracks"
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handlePlayAll}
              className="w-10 h-10 rounded-full bg-[#0052FF] hover:bg-[#0040D9] text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              title="Play All"
              aria-label="Play all owned NFT tracks"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. COMPACT TRACK LIST OR EMPTY STATE */}
      {mappedTracks.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-zinc-400">No NFT tracks yet</p>
        </div>
      ) : (
        <div className="divide-y-0 space-y-1">
          {mappedTracks.map(({ track, nft }, idx) => (
            <SpotifyTrackRow
              key={nft.id || track.id}
              track={track}
              index={idx}
              rightExtra={
                nft.price ? (
                  <span className="text-[11px] font-mono text-[#00B4D8] font-medium mr-1">
                    {nft.price}
                  </span>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default MyNFTTracks;

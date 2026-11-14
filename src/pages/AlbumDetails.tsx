import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Pause, Heart, Share2, MoreHorizontal, ArrowLeft, Clock, TrendingUp, Activity } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { FloorPriceChart } from '@/components/FloorPriceChart';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchFloorPriceHistory } from '@/services/nftService';
import { CollectionSummaryCards } from '@/components/marketplace/CollectionSummaryCards';

const AlbumDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay, setHeaderTitle, allTracks, collections } = useAudio();
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [floorPriceHistory, setFloorPriceHistory] = useState<{ date: string; price: number }[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [album, setAlbum] = useState<{
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    releaseYear: string;
    trackCount: number;
    totalDuration: string;
    description: string;
    floorPrice: string;
    volume: string;
    ownersCount: number;
  } | null>(null);

  useEffect(() => {
    try {
      const storedAlbums = JSON.parse(localStorage.getItem('tonjam_user_albums') || '[]');
      const foundStored = storedAlbums.find((a: any) => a.id === id);
      const foundCollection = collections?.find((c: any) => c.id === id);
      const sourceAlbum = foundStored || foundCollection;

      if (sourceAlbum) {
        const matchingTracks = allTracks.filter(
          (t) =>
            sourceAlbum.trackIds?.includes(t.id) ||
            t.albumId === sourceAlbum.id ||
            (sourceAlbum.title && t.album === sourceAlbum.title)
        );
        setAlbumTracks(matchingTracks);

        const totalSec = matchingTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
        const totalDuration = `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;

        setAlbum({
          id: sourceAlbum.id,
          title: sourceAlbum.title || sourceAlbum.name || 'Untitled Album',
          artist: sourceAlbum.artist || sourceAlbum.creator || 'Unknown Artist',
          coverUrl: sourceAlbum.coverUrl || sourceAlbum.imageUrl || getPlaceholderImage(`album-${sourceAlbum.id}`),
          releaseYear: String(sourceAlbum.releaseYear || new Date().getFullYear()),
          trackCount: sourceAlbum.trackIds?.length || matchingTracks.length,
          totalDuration,
          description: sourceAlbum.description || '',
          floorPrice: String(sourceAlbum.floorPrice || '0'),
          volume: String(sourceAlbum.totalVolume || sourceAlbum.volume || '0'),
          ownersCount: Number(sourceAlbum.ownersCount || 0),
        });
      } else {
        const matchingByAlbumId = allTracks.filter((t) => t.albumId === id || t.album === id);
        if (matchingByAlbumId.length > 0) {
          const first = matchingByAlbumId[0];
          const totalSec = matchingByAlbumId.reduce((sum, t) => sum + (t.duration || 0), 0);
          setAlbumTracks(matchingByAlbumId);
          setAlbum({
            id: id || first.albumId || first.id,
            title: first.album || first.title,
            artist: first.artist,
            coverUrl: first.coverUrl || getPlaceholderImage(`album-${first.id}`),
            releaseYear: first.releaseDate ? String(new Date(first.releaseDate).getFullYear()) : String(new Date().getFullYear()),
            trackCount: matchingByAlbumId.length,
            totalDuration: `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`,
            description: '',
            floorPrice: '0',
            volume: '0',
            ownersCount: 0,
          });
        } else {
          setAlbum(null);
          setAlbumTracks([]);
        }
      }
    } catch (e) {
      console.warn("Error loading album:", e);
      setAlbum(null);
      setAlbumTracks([]);
    }
  }, [id, allTracks, collections]);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      const history = await fetchFloorPriceHistory(id || 'default-collection');
      setFloorPriceHistory(history);
      setIsLoadingHistory(false);
    };

    loadHistory();
  }, [id]);

  useEffect(() => {
    let currentTitle = '';
    const handleScroll = () => {
      const scrollThreshold = 300;
      const nextTitle = window.scrollY > scrollThreshold && album ? album.title : '';
      if (nextTitle !== currentTitle) {
        currentTitle = nextTitle;
        setHeaderTitle(nextTitle);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      setHeaderTitle('');
    };
  }, [album, setHeaderTitle]);

  const handlePlayAlbum = () => {
    if (albumTracks.length > 0) {
      playTrack(albumTracks[0]);
    }
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-32">
        <PageHeader title="Album" showBack={true} />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Album not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <PageHeader title="Album" showBack={true} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-2">
        {/* Album Info */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 flex-shrink-0"
          >
            <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-2"
            >
              Album
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
            >
              {album.title}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground font-medium"
            >
              <span className="text-foreground font-bold hover:underline cursor-pointer">{album.artist}</span>
              <span>•</span>
              <span>{album.releaseYear}</span>
              <span>•</span>
              <span>{album.trackCount} songs, {album.totalDuration}</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm text-muted-foreground max-w-2xl"
            >
              {album.description}
            </motion.p>
          </div>
        </div>

        {/* Collection Summary Stat Cards */}
        <div className="mb-8" id="album-collection-summary-wrapper">
          <CollectionSummaryCards
            collectionName={album.title}
            customVolume={album.volume}
            customOwners={album.ownersCount}
            customItems={album.trackCount}
          />
        </div>

        {/* Collection Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            {!isLoadingHistory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <FloorPriceChart 
                  data={floorPriceHistory} 
                  title="Collection Floor Price Trend" 
                  collectionName={album.title}
                />
              </motion.div>
            )}
          </div>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#101A3B] rounded-2xl p-6 h-full flex flex-col justify-center text-left"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Contract Ledger</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                This music NFT collection is fully indexed on the TON network. Ownership, royalties, and metadata files are stored in decentralized smart contract nodes.
              </p>
              <button className="w-full bg-primary text-background font-bold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <TrendingUp className="w-4 h-4" />
                View on TON Explorer
              </button>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handlePlayAlbum}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/30"
          >
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          </button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full border ${isLiked ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'} transition-colors`}
          >
            <Heart className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button className="p-3 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Tracklist */}
        <div className="space-y-2">
          <div className="flex items-center px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-4">
            <div className="w-8 text-center">#</div>
            <div className="flex-1">Title</div>
            <div className="w-12 text-right"><Clock className="w-4 h-4 inline" /></div>
          </div>
          
          {albumTracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            return (
              <div 
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors group ${isCurrentTrack ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
              >
                <div className="w-8 text-center text-sm font-medium text-muted-foreground group-hover:hidden">
                  {isCurrentTrack && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-4">
                      <div className="w-1 bg-primary animate-[bounce_1s_infinite] h-full"></div>
                      <div className="w-1 bg-primary animate-[bounce_1s_infinite_0.2s] h-2/3"></div>
                      <div className="w-1 bg-primary animate-[bounce_1s_infinite_0.4s] h-1/2"></div>
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="w-8 text-center hidden group-hover:block">
                  <Play className="w-4 h-4 text-foreground mx-auto" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className={`text-sm font-bold truncate ${isCurrentTrack ? 'text-primary' : 'text-foreground'}`}>
                    {track.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="w-12 text-right text-sm text-muted-foreground font-mono">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AlbumDetails;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Pause, Heart, Share2, MoreHorizontal, ArrowLeft, Clock, TrendingUp, Activity } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { MOCK_TRACKS } from '@/constants';
import { FloorPriceChart } from '@/components/FloorPriceChart';
import { fetchFloorPriceHistory } from '@/services/nftService';
import { CollectionSummaryCards } from '@/components/marketplace/CollectionSummaryCards';

const AlbumDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay, setHeaderTitle, allTracks } = useAudio();
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [floorPriceHistory, setFloorPriceHistory] = useState<{ date: string; price: number }[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Check local storage for user created albums or fallback
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
  }>({
    id: id || '1',
    title: 'Cyberpunk Nights',
    artist: 'Neon Prophet',
    coverUrl: getPlaceholderImage('album-cover'),
    releaseYear: '2026',
    trackCount: 8,
    totalDuration: '32:45',
    description: 'A journey through the neon-lit streets of Neo-Tokyo. This album blends synthwave with modern trap beats to create a unique sonic landscape.',
    floorPrice: '12.5',
    volume: '1,240'
  });

  useEffect(() => {
    try {
      const storedAlbums = JSON.parse(localStorage.getItem('tonjam_user_albums') || '[]');
      const foundAlbum = storedAlbums.find((a: any) => a.id === id);
      if (foundAlbum) {
        // Find matching tracks in allTracks
        const matchingTracks = allTracks.filter(t => foundAlbum.trackIds?.includes(t.id) || t.albumId === foundAlbum.id || t.album === foundAlbum.title);
        const resolvedTracks = matchingTracks.length > 0 ? matchingTracks : MOCK_TRACKS.slice(0, 4);
        setAlbumTracks(resolvedTracks);
        
        setAlbum({
          id: foundAlbum.id,
          title: foundAlbum.title,
          artist: foundAlbum.artist,
          coverUrl: foundAlbum.coverUrl || getPlaceholderImage('album-cover'),
          releaseYear: String(foundAlbum.releaseYear || new Date().getFullYear()),
          trackCount: foundAlbum.trackIds?.length || resolvedTracks.length,
          totalDuration: '18:40',
          description: foundAlbum.description || 'Decentralized Album release on TonJam.',
          floorPrice: '5.0',
          volume: '350'
        });
      } else {
        setAlbumTracks(MOCK_TRACKS.slice(0, 8));
      }
    } catch (e) {
      console.warn("Error loading stored album:", e);
      setAlbumTracks(MOCK_TRACKS.slice(0, 8));
    }
  }, [id, allTracks]);

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
    const handleScroll = () => {
      const scrollThreshold = 300;
      if (window.scrollY > scrollThreshold) {
        setHeaderTitle(album.title);
      } else {
        setHeaderTitle('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      setHeaderTitle('');
    };
  }, [album.title, setHeaderTitle]);

  // album tracks already populated in first useEffect

  const handlePlayAlbum = () => {
    if (albumTracks.length > 0) {
      playTrack(albumTracks[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
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
            customOwners={342}
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
              className="bg-[#101A3B]/20 backdrop-blur-md rounded-2xl p-6 h-full flex flex-col justify-center text-left"
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

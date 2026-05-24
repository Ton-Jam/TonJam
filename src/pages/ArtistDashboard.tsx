import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { 
  Music, 
  Gem, 
  Coins, 
  Upload, 
  LayoutDashboard, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  Activity,
  Rocket,
  Settings,
  TrendingDown,
  TrendingUp,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import { BackButton } from "@/components/BackButton";
import { useAudio } from "@/context/AudioContext";
import { useAuth } from "@/context/AuthContext";
import { getPlaceholderImage } from "@/lib/utils";
import TrackMonetizationModal from "@/components/TrackMonetizationModal";
import EditMetadataModal from "@/components/EditMetadataModal";
import SponsorshipSubmissionModal from "@/components/SponsorshipSubmissionModal";

import SongRequestsTab from "@/components/SongRequestsTab";
import AlbumCard from "@/components/AlbumCard";
import Autoplay from "embla-carousel-autoplay";
import ManageNFTModal from "@/components/ManageNFTModal";
import { ChartAreaInteractive } from "@/components/ChartAreaInteractive";
import DailyStreamsChart from "@/components/DailyStreamsChart";
import ListenerActivityFeed from "@/components/ListenerActivityFeed";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { getEarnings, addNotification } = useAudio();
  const { user, isArtist, loading } = useAuth();
  const [nfts, setNFTs] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrackForConfig, setSelectedTrackForConfig] = useState<any | null>(null);
  const [selectedNFTForManage, setSelectedNFTForManage] = useState<any | null>(null);
  const [selectedTrackForMetadata, setSelectedTrackForMetadata] = useState<any | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);

  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);

  // Refs to track previous track values to notify on change
  const tracksPrevStatsRef = React.useRef<Record<string, { playCount: number; likes: number }>>({});
  const isInitialLoadRef = React.useRef(true);

  useEffect(() => {
    if (!loading && (!user || !isArtist)) {
      navigate('/');
      return;
    }

    if (!user) return;

    // Fetch static data (NFTs, Earnings)
    fetchStaticData();

    // Set up real-time onSnapshot listener for this artist's tracks
    const tracksQuery = query(collection(db, "tracks"), where("artistId", "==", user.uid));
    
    setIsLoading(true);

    const unsubscribeTracks = onSnapshot(tracksQuery, (snapshot) => {
      const tracksData: any[] = [];
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        tracksData.push(data);
      });

      // Avoid showing notifications on the very first load
      if (!isInitialLoadRef.current) {
        tracksData.forEach(track => {
          const prev = tracksPrevStatsRef.current[track.id];
          const currentPlayCount = track.playCount || 0;
          const currentLikes = track.likes || 0;

          if (prev) {
            // Check for new plays
            if (currentPlayCount > prev.playCount) {
              const diff = currentPlayCount - prev.playCount;
              addNotification(`Your track "${track.title}" received ${diff > 1 ? `${diff} new streams` : 'a new stream'}! 🎵`, 'success');
            }
            // Check for new likes
            if (currentLikes > prev.likes) {
              const diff = currentLikes - prev.likes;
              addNotification(`Your track "${track.title}" received ${diff > 1 ? `${diff} new likes` : 'a new like'}! ❤️`, 'success');
            }
          }
        });
      }

      // Update the previous stats ref
      tracksData.forEach(track => {
        tracksPrevStatsRef.current[track.id] = {
          playCount: track.playCount || 0,
          likes: track.likes || 0
        };
      });

      isInitialLoadRef.current = false;
      setTracks(tracksData);
      
      // Update Albums matching the new real-time track list
      setAlbums([
        {
          id: 'alb-1',
          title: 'Neon Pulse',
          artist: 'Neon Voyager',
          artistId: user?.uid,
          coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Neon%20Pulse?width=400&height=400&nologo=true',
          releaseYear: 2023,
          trackIds: tracksData.map(t => t.id).slice(0, 2),
          genre: 'Electronic',
          description: 'The debut album defining the digital frontier.'
        }
      ]);
      
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tracks');
      setIsLoading(false);
    });

    return () => {
      unsubscribeTracks();
    };
  }, [user, isArtist, loading, navigate]);

  const fetchStaticData = async () => {
    try {
      if (!user) return;
      
      // NFTs
      const nftSnap = await getDocs(
        query(collection(db, "nfts"), where("artistId", "==", user.uid))
      );
      const nftData = nftSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNFTs(nftData);

      // Earnings
      const totalEarnings = await getEarnings(user.uid);
      setEarnings(totalEarnings);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'artist-dashboard-static');
    }
  };

  const fetchData = async () => {
    await fetchStaticData();
  };

  const mintNFT = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      navigate('/artist-minting', { state: { track } });
    }
  };

  const openConfig = (track: any) => {
    setSelectedTrackForConfig(track);
    setIsConfigModalOpen(true);
  };

  const openEditMetadata = (track: any) => {
    setSelectedTrackForMetadata(track);
    setIsEditMetadataOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white pb-24 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 opacity-10 blur-[120px] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>


      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Welcome Section */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Welcome back, Artist</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Manage your sonic artifacts and protocol earnings</p>
        </div>

        {/* Easy Start Guide */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-white/10 p-6 rounded-3xl">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Easy Steps to Monetize</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/20 p-4 rounded-xl">
              <span className="text-2xl font-black text-blue-500 mb-2 block">1</span>
              <p className="text-xs font-bold uppercase tracking-widest">Upload your best track</p>
            </div>
            <div className="bg-black/20 p-4 rounded-xl">
              <span className="text-2xl font-black text-purple-500 mb-2 block">2</span>
              <p className="text-xs font-bold uppercase tracking-widest">Add art & description</p>
            </div>
            <div className="bg-black/20 p-4 rounded-xl">
              <span className="text-2xl font-black text-cyan-500 mb-2 block">3</span>
              <p className="text-xs font-bold uppercase tracking-widest">Mint as NFT</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
[diff_block_end]
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Music className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Tracks</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-cyan-500">{tracks.length}</h3>
              <Activity className="w-4 h-4 text-cyan-500/30 mb-2" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Gem className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Minted NFTs</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-purple-500">{nfts.length}</h3>
              <ArrowUpRight className="w-4 h-4 text-purple-500/30 mb-2" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Coins className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Earnings</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-amber-500">{earnings.toFixed(2)}</h3>
              <span className="text-[10px] font-black text-amber-500/50 mb-2 uppercase">TON</span>
            </div>
          </motion.div>
        </div>

        {/* Analytics Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                <BarChart3 className="w-3 h-3 text-cyan-500" /> 
                Recent Performance
              </h2>
              <h3 className="text-sm font-black uppercase tracking-tight">Trending Audience Growth</h3>
            </div>
            <button 
              onClick={() => navigate('/artist-analytics')}
              className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest hover:text-cyan-400 flex items-center gap-1 group"
            >
              Detailed Insights <ExternalLink className="w-2.5 h-2.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="h-48 -mx-4">
            <ChartAreaInteractive />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">New Listeners</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">+1,248</span>
                <span className="text-[8px] font-black text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-2 h-2" /> 12%
                </span>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Total Streams</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">42.8K</span>
                <span className="text-[8px] font-black text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-2 h-2" /> 8.4%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Stream Count Bar Chart */}
        <DailyStreamsChart tracks={tracks} />

        {/* Real-time Listener Activity Feed */}
        <ListenerActivityFeed tracks={tracks} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-cyan-500 hover:text-black transition-all group active:scale-95 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-black/10">
              <Plus className="w-5 h-5 text-cyan-500 group-hover:text-black" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-center">Add Track</span>
          </button>

          <button
            onClick={() => navigate('/artist-minting')}
            className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-purple-600 transition-all group active:scale-95 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center group-hover:bg-white/10">
              <Gem className="w-5 h-5 text-purple-500 group-hover:text-white" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-center">Mint NFT</span>
          </button>

          <button
            onClick={() => setIsSponsorshipModalOpen(true)}
            className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-blue-600 transition-all group active:scale-95 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-white/10">
              <Rocket className="w-5 h-5 text-blue-500 group-hover:text-white" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-center">Promote</span>
          </button>

          <button
            onClick={() => navigate('/governance')}
            className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-center">Governance</span>
          </button>
        </div>

        {/* NFT Vault Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
              <Gem className="w-3 h-3 text-purple-500" /> Digital Collection Vault
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nfts.length > 0 ? (
              nfts.map((nft, idx) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-2 group hover:bg-white/10 transition-all cursor-pointer relative"
                  onClick={() => {
                    setSelectedNFTForManage(nft);
                    setIsManageModalOpen(true);
                  }}
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-2 relative">
                    <img 
                      src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                      className="w-full h-full object-cover"
                      alt={nft.title}
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-[4px] text-[7px] font-black text-cyan-400">
                      {nft.price} TON
                    </div>
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-tight truncate px-1">{nft.title}</h4>
                  <p className="text-[8px] font-bold text-white/30 truncate px-1">{nft.edition}</p>
                  
                  <div className="absolute inset-0 bg-purple-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                    <button className="px-3 py-1.5 bg-purple-600 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform">
                      Manage
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <Gem className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">No minted artifacts in vault</p>
              </div>
            )}
          </div>
        </section>

        {/* Track List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
              <Music className="w-3 h-3" /> My Sonic Artifacts
            </h2>
            <button 
              onClick={fetchData}
              className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest hover:text-cyan-400"
            >
              Refresh
            </button>
          </div>
          
          {/* Albums Section */}
          <section className="space-y-4">
             <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              Albums
            </h2>
            <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
                className="w-full bg-white/5 p-4 rounded-3xl"
              >
                <CarouselContent>
                  {albums.map((album, index) => (
                    <CarouselItem key={album.id} className="basis-4/5 md:basis-1/3 lg:basis-1/4">
                       <AlbumCard key={album.id} album={album} index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
          </section>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Synchronizing...</p>
              </div>
            ) : tracks.length > 0 ? (
              tracks.map((track, index) => (
                <motion.div 
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate(`/track/${track.id}`)}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={track.coverUrl} 
                      className="w-full h-full object-cover" 
                      alt={track.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate">{track.title}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{track.genre}</p>
                  </div>

                    <div className="flex items-center gap-3">
                      <button
                        id={`edit-metadata-btn-${track.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditMetadata(track);
                        }}
                        className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
                      >
                        Edit Metadata
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfig(track);
                        }}
                        className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                      >
                        Configure
                      </button>
                      {!track.isNFT && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mintNFT(track.id);
                          }}
                          className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors"
                        >
                          Mint NFT
                        </button>
                      )}
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <Music className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-sm font-black uppercase tracking-tight text-white/40">No artifacts found</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Start by uploading your first track</p>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Upload Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Management Module for Song Requests */}
        <div className="pt-8 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Audience Requests</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <SongRequestsTab artistId={user.uid} isOwnProfile={true} />
          </div>
        </div>

      </div>

      {selectedTrackForConfig && (
        <TrackMonetizationModal 
          track={selectedTrackForConfig}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onUpdate={fetchData}
        />
      )}

      {selectedTrackForMetadata && (
        <EditMetadataModal 
          track={selectedTrackForMetadata}
          isOpen={isEditMetadataOpen}
          onClose={() => setIsEditMetadataOpen(false)}
          onUpdate={fetchData}
        />
      )}
      
      {selectedNFTForManage && (
        <ManageNFTModal
          nft={selectedNFTForManage}
          isOpen={isManageModalOpen}
          onClose={() => {
            setIsManageModalOpen(false);
            fetchData();
          }}
        />
      )}

      <SponsorshipSubmissionModal 
        isOpen={isSponsorshipModalOpen}
        onClose={() => setIsSponsorshipModalOpen(false)}
      />

    </div>
  );
}

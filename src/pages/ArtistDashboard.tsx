import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
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
  Rocket
} from "lucide-react";
import { motion } from "motion/react";
import { BackButton } from "@/components/BackButton";
import { useAudio } from "@/context/AudioContext";
import NFTMetadataModal from "@/components/NFTMetadataModal";
import SponsorshipSubmissionModal from "@/components/SponsorshipSubmissionModal";
import TrackUploadModal from "@/components/TrackUploadModal";
import SongRequestsTab from "@/components/SongRequestsTab";

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { getEarnings } = useAudio();
  const [tracks, setTracks] = useState<any[]>([]);
  const [nfts, setNFTs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrackForConfig, setSelectedTrackForConfig] = useState<any | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Tracks
      const trackSnap = await getDocs(
        query(collection(db, "tracks"), where("artistId", "==", user?.uid))
      );

      const tracksData = trackSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTracks(tracksData);

      // NFTs
      const nftSnap = await getDocs(
        query(collection(db, "nfts"), where("artistId", "==", user?.uid))
      );
      const nftData = nftSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNFTs(nftData);

      // Earnings
      if (user?.uid) {
        const totalEarnings = await getEarnings(user.uid);
        setEarnings(totalEarnings);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'tracks/nfts');
    } finally {
      setIsLoading(false);
    }
  };

  const mintNFT = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      navigate('/mint', { state: { track } });
    }
  };

  const openConfig = (track: any) => {
    setSelectedTrackForConfig(track);
    setIsConfigModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white pb-24 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 opacity-10 blur-[120px] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
        <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0">
        <BackButton className="p-2 text-white/70 hover:text-white transition-colors" />
        <h1 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-cyan-500" />
          Artist Dashboard
        </h1>
        <button 
          onClick={() => navigate('/artist-analytics')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-cyan-500 border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Analytics</span>
        </button>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Welcome Section */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Welcome back, Artist</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Manage your sonic artifacts and protocol earnings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group"
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
            className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group"
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
            className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden group"
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="group bg-cyan-500 text-black p-6 rounded-3xl flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(8,145,178,0.2)]"
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Forge Protocol</p>
              <h3 className="text-lg font-black uppercase tracking-tight">Upload New Track</h3>
            </div>
            <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
          </button>

          <button
            onClick={() => navigate('/artist-minting')}
            className="group bg-purple-600 text-white p-6 rounded-3xl flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(147,51,234,0.2)]"
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">NFT Protocol</p>
              <h3 className="text-lg font-black uppercase tracking-tight">Mint Existing</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Gem className="w-6 h-6" />
            </div>
          </button>

          <button
            onClick={() => setIsSponsorshipModalOpen(true)}
            className="group bg-blue-600 text-white p-6 rounded-3xl flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)] sm:col-span-2"
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Promotion Protocol</p>
              <h3 className="text-lg font-black uppercase tracking-tight">Submit for Sponsorship</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Rocket className="w-6 h-6" />
            </div>
          </button>
        </div>

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
                    {!track.isNFT && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfig(track);
                          }}
                          className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                        >
                          Configure
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mintNFT(track.id);
                          }}
                          className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors"
                        >
                          Mint NFT
                        </button>
                      </>
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
        <NFTMetadataModal 
          track={selectedTrackForConfig}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onUpdate={fetchData}
        />
      )}

      <SponsorshipSubmissionModal 
        isOpen={isSponsorshipModalOpen}
        onClose={() => setIsSponsorshipModalOpen(false)}
      />

      <TrackUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}

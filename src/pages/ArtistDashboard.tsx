import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
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
  ExternalLink,
  MessageSquare,
  Send,
  UploadCloud,
  Sparkles,
  Users,
  Lock,
  Globe,
  RefreshCw,
  Play,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

import { FloorPriceChart } from "@/components/FloorPriceChart";
import { StreamingStatsChart } from "@/components/StreamingStatsChart";
import { NFTChart } from "@/components/NFTChart";
import { ArtistAnalyticsChart } from "@/components/ArtistAnalyticsChart";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { getEarnings, addNotification } = useAudio();
  const { user, isArtist, loading } = useAuth();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<"overview" | "sonic" | "analytics" | "nfts" | "fanconnect">("overview");

  // Core Data States
  const [nfts, setNFTs] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Configuration States
  const [selectedTrackForConfig, setSelectedTrackForConfig] = useState<any | null>(null);
  const [selectedNFTForManage, setSelectedNFTForManage] = useState<any | null>(null);
  const [selectedTrackForMetadata, setSelectedTrackForMetadata] = useState<any | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);
  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);

  // Dynamic Upload Simulator State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadGenre, setUploadGenre] = useState("Electronic");

  // Chat/DM Simulator States
  const [activeConvoId, setActiveConvoId] = useState("c1");
  const [newMessageText, setNewMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([
    {
      id: "c1",
      handle: "Vitalik_TON.eth",
      name: "Vitalik Buterin",
      avatar: "https://image.pollinations.ai/prompt/cyberpunk%20ether%20crypto%20guy%20avatar?width=100&height=100&nologo=true",
      status: "online",
      badge: "Giga Collector",
      messages: [
        { sender: "fan", text: "Yo! Your new track is absolutely fire. The spatial mix is incredibly polished! Do you plan on dropping alternate wave stems on the protocol?", time: "2:14 PM" }
      ]
    },
    {
      id: "c2",
      handle: "Pavel_Durov.ton",
      name: "Durov",
      avatar: "https://image.pollinations.ai/prompt/futuristic%20black%20tee%20crypto%20guy%20avatar?width=100&height=100&nologo=true",
      status: "online",
      badge: "Major Sponsor",
      messages: [
        { sender: "fan", text: "Stellar launch on TON Protocol! I have pinned your track in our main audio hub.", time: "Yesterday" },
        { sender: "artist", text: "Incredibly grateful Pavel, thank you for backing our independent audio roadmap!", time: "Yesterday" }
      ]
    },
    {
      id: "c3",
      handle: "Alice_Vance_NFT",
      name: "Alice Vance",
      avatar: "https://image.pollinations.ai/prompt/cyberpunk%20girl%20crypto%20collector?width=100&height=100&nologo=true",
      status: "offline",
      badge: "Super Fan",
      messages: [
        { sender: "fan", text: "Will you list exclusive collectibles of Neon Waves next week? I want the limited version!", time: "3 days ago" }
      ]
    }
  ]);

  // Exclusive Drops Simulator States
  const [exclusiveDrops, setExclusiveDrops] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("tonjam_exclusive_drops");
      return saved ? JSON.parse(saved) : [
        {
          id: "drop-1",
          title: "Neon Pulse Vocal lead Wave Stems",
          description: "Isolated clean vocal recordings and digital alternate mix master. Gated access key.",
          gating: "NFT Holders Only",
          downloads: 142,
          date: "Yesterday",
          type: "Acoustic Mix (High fidelity .wav)"
        },
        {
          id: "drop-2",
          title: "Behind-The-Scenes Studio Raw Session",
          description: "Raw footage of the live modular synth improvisations for 'Echoes of Sky' track.",
          gating: "VIP Fan Club",
          downloads: 98,
          date: "3 days ago",
          type: "Video Session (.mp4)"
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const [newDropTitle, setNewDropTitle] = useState("");
  const [newDropDesc, setNewDropDesc] = useState("");
  const [newDropGating, setNewDropGating] = useState("NFT Holders Only");
  const [newDropType, setNewDropType] = useState("Audio Stem (.wav)");

  // NFT Sales Tracker Mock State
  const [nftSales, setNftSales] = useState([
    { id: "sale-1", item: "Cyberpunk Genesis #01", buyer: "Vitalik_TON.eth", price: "240 TON", royalty: "24 TON (10%)", time: "10m ago", tx: "EQC8...O1P" },
    { id: "sale-2", item: "Neon Waves Alternate Mix", buyer: "Alice_Vance_NFT", price: "120 TON", royalty: "12 TON (10%)", time: "2h ago", tx: "EQA5...O0P" },
    { id: "sale-3", item: "Sunset Groove Stem #04", buyer: "TON_Giga_Staker", price: "80 TON", royalty: "8 TON (10%)", time: "Yesterday", tx: "EQB1...O2P" }
  ]);

  // Previous stream counters reference
  const tracksPrevStatsRef = useRef<Record<string, { playCount: number; likes: number }>>({});
  const isInitialLoadRef = useRef(true);

  // Synced state tracking values
  useEffect(() => {
    if (!loading && (!user || !isArtist)) {
      navigate('/');
      return;
    }

    if (!user) return;

    fetchStaticData();

    // Live snap for tracks
    const tracksQuery = query(collection(db, "tracks"), where("artistId", "==", user.uid));
    setIsLoading(true);

    const unsubscribeTracks = onSnapshot(tracksQuery, (snapshot) => {
      const tracksData: any[] = [];
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        tracksData.push(data);
      });

      if (!isInitialLoadRef.current) {
        tracksData.forEach(track => {
          const prev = tracksPrevStatsRef.current[track.id];
          const currentPlayCount = track.playCount || 0;
          const currentLikes = track.likes || 0;

          if (prev) {
            if (currentPlayCount > prev.playCount) {
              const diff = currentPlayCount - prev.playCount;
              addNotification(`Your track "${track.title}" received ${diff > 1 ? `${diff} new streams` : 'a new stream'}! 🎵`, 'success');
            }
            if (currentLikes > prev.likes) {
              const diff = currentLikes - prev.likes;
              addNotification(`Your track "${track.title}" received ${diff > 1 ? `${diff} new likes` : 'a new like'}! ❤️`, 'success');
            }
          }
        });
      }

      tracksData.forEach(track => {
        tracksPrevStatsRef.current[track.id] = {
          playCount: track.playCount || 0,
          likes: track.likes || 0
        };
      });

      isInitialLoadRef.current = false;
      setTracks(tracksData);
      
      setAlbums([
        {
          id: 'alb-1',
          title: 'Neon Pulse',
          artist: 'Neon Voyager',
          artistId: user?.uid,
          coverUrl: 'https://image.pollinations.ai/prompt/music%20album%20cover%20Neon%20Pulse?width=400&height=400&nologo=true',
          releaseYear: 2026,
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

  // Upload track simulator
  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      addNotification("Please enter a track title", "warning");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            
            // Add dynamically
            const newTrackId = `sim-${Date.now()}`;
            const newTrackObj = {
              id: newTrackId,
              title: uploadTitle,
              genre: uploadGenre,
              coverUrl: "https://image.pollinations.ai/prompt/electronic%20ambient%20neon%20cover?width=400&height=400&nologo=true",
              playCount: 0,
              likes: 0,
              isNFT: false,
              artistId: user?.uid
            };
            setTracks(prev => [newTrackObj, ...prev]);
            addNotification(`"${uploadTitle}" has been successfully broadcast and uploaded to TON IPFS Storage Protocols! 🎵🛸`, "success");
            setUploadTitle("");
          }, 600);
          return 100;
        }
        return prev + 17;
      });
    }, 250);
  };

  // Direct messaging action
  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;

    // Append artist text
    const updatedConversations = conversations.map(c => {
      if (c.id === activeConvoId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            { sender: "artist", text: newMessageText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          ]
        };
      }
      return c;
    });

    setConversations(updatedConversations);
    const sent = newMessageText;
    setNewMessageText("");
    setIsTyping(true);

    // Schedule fan organic reply
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Oh wow, thanks for replying directly! 💎 I love using TonJam's direct messaging system. Best artist connection ever!";
      const activeConvo = conversations.find(c => c.id === activeConvoId);

      if (activeConvo) {
        if (activeConvo.handle === "Vitalik_TON.eth") {
          if (sent.toLowerCase().includes("stem") || sent.toLowerCase().includes("mix") || sent.toLowerCase().includes("vocal")) {
            replyText = "Fascinating. Fully composable audio stems with decentralized IPFS metadata indexes represent a brilliant digital sovereignty standard. Absolute wizardry! 🚀💎";
          } else {
            replyText = "Absolutely. Transparent smart contracts on TON for direct artist rewards coordinate much better cultural alignment. Keep shipping!";
          }
        } else if (activeConvo.handle === "Pavel_Durov.ton") {
          replyText = "Perfect! The TON community is ready. We love highly responsive creators. Keep scaling up your digital footprint! 📈";
        } else if (activeConvo.handle === "Alice_Vance_NFT") {
          replyText = "Oh nice, I'll fetch your next limited edition NFT as soon as it drops! Looking forward to hearing the full stem mix.";
        }
      }

      setConversations(prev => prev.map(c => {
        if (c.id === activeConvoId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { sender: "fan", text: replyText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
            ]
          };
        }
        return c;
      }));

      addNotification(`New fan connect DM from ${activeConvo?.name || "Collector"} 💬`, "success");
    }, 1500);
  };

  // Share special perk / drops form
  const handlePostDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDropTitle.trim() || !newDropDesc.trim()) {
      addNotification("Please complete all exclusive drop form fields.", "warning");
      return;
    }

    const newDropObj = {
      id: `new-drop-${Date.now()}`,
      title: newDropTitle,
      description: newDropDesc,
      gating: newDropGating,
      downloads: 0,
      date: "Just Now",
      type: newDropType
    };

    const nextDrops = [newDropObj, ...exclusiveDrops];
    setExclusiveDrops(nextDrops);
    try {
      localStorage.setItem("tonjam_exclusive_drops", JSON.stringify(nextDrops));
    } catch (err) {
      console.error(err);
    }

    addNotification(`Exclusive Drop "${newDropTitle}" successfully created for your target audience! 🔐✨`, "success");
    setNewDropTitle("");
    setNewDropDesc("");
  };

  const activeConvo = useMemo(() => {
    return conversations.find(c => c.id === activeConvoId);
  }, [conversations, activeConvoId]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#07090E] text-white pb-24 relative overflow-x-hidden">
      {/* Dynamic Ambient Blur Backgrounds */}
      <div className="fixed inset-0 opacity-10 blur-[130px] pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-80 h-80 bg-cyan-500 rounded-full" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600 rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-md p-6 rounded-[32px] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              Artist Hub <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </h1>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Manage tracks, monitor sales, stream analytic feeds & connect with digital collectors
            </p>
          </div>
          <BackButton />
        </div>

        {/* Workspace Subtab Selection Grid (Porosity Glass Aesthetic) */}
        <div className="flex flex-wrap p-1 bg-white/[0.01] backdrop-blur-md rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "overview" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("sonic")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "sonic" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Music className="w-3.5 h-3.5" /> Sonic Vault
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "analytics" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab("nfts")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "nfts" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Gem className="w-3.5 h-3.5" /> NFT Sales
          </button>
          <button
            onClick={() => setActiveTab("fanconnect")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "fanconnect" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Fan Connect
          </button>
        </div>

        {/* Main Tab Contents Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Statistics Bento Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-3xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Music className="w-14 h-14" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Tracks</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-3xl font-black text-cyan-400">{tracks.length}</h3>
                      <Activity className="w-4 h-4 text-cyan-500/30 mb-2 animate-bounce" />
                    </div>
                  </div>

                  <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-3xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Gem className="w-14 h-14" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Minted Collectibles</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-3xl font-black text-purple-400">{nfts.length}</h3>
                      <ArrowUpRight className="w-4 h-4 text-purple-500/30 mb-2" />
                    </div>
                  </div>

                  <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-3xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Coins className="w-14 h-14" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Royalty Pool</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-3xl font-black text-amber-500">{earnings.toFixed(2)}</h3>
                      <span className="text-[9px] font-black text-amber-500/70 mb-2 uppercase tracking-widest">TON</span>
                    </div>
                  </div>
                </div>

                {/* Audiences Area Chart Card */}
                <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-[32px] shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Recent performance
                      </h2>
                      <h3 className="text-sm font-black uppercase tracking-tight">Stream Playback Growth</h3>
                    </div>
                  </div>
                  <div className="h-48 -mx-4">
                    <ChartAreaInteractive />
                  </div>
                </div>

                {/* Live Streams Bar Chart */}
                <DailyStreamsChart tracks={tracks} />

                {/* Simulated Feed of Listeners Activity */}
                <ListenerActivityFeed tracks={tracks} />

                {/* Audience Request Sub-module */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-1 h-5 bg-cyan-500 rounded-full animate-pulse" />
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">Audience Requests</h2>
                  </div>
                  <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-[28px] shadow-lg">
                    <SongRequestsTab artistId={user.uid} isOwnProfile={true} />
                  </div>
                </div>
              </>
            )}

            {/* SONIC TAB */}
            {activeTab === "sonic" && (
              <div className="space-y-6">
                
                {/* Quick Track Upload Component */}
                <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-[32px] shadow-lg">
                  <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-cyan-400" /> Digital Distribution Studio
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Simulator Input Side */}
                    <form onSubmit={handleSimulatedUpload} className="space-y-4">
                      <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-1.5">Track Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Neon Horizon"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          className="w-full text-xs font-semibold p-3 rounded-xl bg-black/40 border border-white/[0.05] focus:outline-none focus:border-cyan-500 text-white placeholder-zinc-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-1.5">Genre</label>
                          <select
                            value={uploadGenre}
                            onChange={(e) => setUploadGenre(e.target.value)}
                            className="w-full text-xs font-semibold p-3 rounded-xl bg-black/40 border border-white/[0.05] text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="Electronic">Electronic</option>
                            <option value="Synthwave">Synthwave</option>
                            <option value="Ambient">Ambient</option>
                            <option value="Cyber-Rock">Cyber-Rock</option>
                            <option value="Lo-fi">Lo-fi</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full py-3 bg-cyan-500 font-black uppercase hover:bg-cyan-400 transition-colors text-black text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" /> Publish Track
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Draggable Zone Simulator Display */}
                    <div className="flex flex-col justify-center items-center text-center p-6 bg-black/30 rounded-2xl border border-dashed border-white/[0.05]">
                      {isUploading ? (
                        <div className="w-full space-y-3">
                          <Activity className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">
                            Packing wav audio stems & compiling metadata dictionary...
                          </p>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <span className="text-[8px] text-zinc-500 font-mono">{uploadProgress}% Complete</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-zinc-600 mb-2 animate-bounce" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Drag & Drop Sound File</p>
                          <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-wider mt-1">Accepts high resolution WAV, FLAC, or MP3 formats</p>
                          <span className="mt-3 text-[9px] px-3 py-1 bg-white/5 text-zinc-500 rounded-lg">Browse local folders</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Albums section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full" />
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">Albums & Ep collections</h2>
                  </div>
                  <Carousel
                    opts={{ align: "start", loop: true }}
                    plugins={[Autoplay({ delay: 3000 })]}
                    className="w-full bg-[#10141b]/20 p-4 rounded-[32px] border border-white/[0.02]"
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

                {/* Main Music Tracks List view */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Music className="w-3.5 h-3.5" /> Published sonic assets ({tracks.length})
                    </h3>
                  </div>

                  {isLoading ? (
                    <div className="py-12 text-center bg-white/[0.01] rounded-3xl">
                      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Synchronising TON node...</p>
                    </div>
                  ) : tracks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {tracks.map((track, idx) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-white/[0.02] hover:bg-white/[0.05] transition-all p-4 rounded-3xl flex items-center justify-between gap-4 cursor-pointer"
                          onClick={() => navigate(`/track/${track.id}`)}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 relative group">
                              <img src={track.coverUrl || getPlaceholderImage(track.title)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Play className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black uppercase tracking-tight truncate">{track.title}</h4>
                              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">{track.genre}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              id={`edit-metadata-btn-${track.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditMetadata(track);
                              }}
                              className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest cursor-pointer"
                            >
                              Edit Metadata
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfig(track);
                              }}
                              className="text-[9px] font-black text-zinc-400 hover:text-white uppercase tracking-widest cursor-pointer"
                            >
                              Gating
                            </button>
                            {!track.isNFT && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mintNFT(track.id);
                                }}
                                className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest cursor-pointer"
                              >
                                Mint NFT
                              </button>
                            )}
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 hover:text-white transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/[0.05]">
                      <Music className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No sound recording published</p>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider">Protocol Insights & Metrics</h3>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Real-time stats of streaming activity, demand scales and engagement</p>
                </div>

                {/* Sub-components Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloorPriceChart data={[{ date: "May 24", price: 1.1 }, { date: "May 25", price: 1.4 }, { date: "May 26", price: 1.2 }, { date: "May 27", price: 1.8 }]} />
                  <StreamingStatsChart data={[{ day: "Mon", plays: 2400 }, { day: "Tue", plays: 3100 }, { day: "Wed", plays: 2900 }, { day: "Thu", plays: 4200 }, { day: "Fri", plays: 5900 }]} />
                  <NFTChart data={[{ date: "May 24", value: 140 }, { date: "May 25", value: 180 }, { date: "May 26", value: 210 }, { date: "May 27", value: 290 }]} />
                  <ArtistAnalyticsChart data={[{ subject: "Streams", A: 95 }, { subject: "NFT Sales", A: 75 }, { subject: "Social Buzz", A: 90 }, { subject: "Direct DMs", A: 85 }]} />
                </div>
              </div>
            )}

            {/* NFT SALES TAB */}
            {activeTab === "nfts" && (
              <div className="space-y-6">
                
                {/* Secondary sales ledger display */}
                <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-[32px] shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" /> Web3 NFT sales Ledger
                    </h3>
                    <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full">
                      10% creator split active
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.05] text-zinc-500">
                          <th className="py-3 px-2 font-black uppercase tracking-widest text-[9px]">Collectible Item</th>
                          <th className="py-3 px-2 font-black uppercase tracking-widest text-[9px]">Buyer Wallet</th>
                          <th className="py-3 px-2 font-black uppercase tracking-widest text-[9px]">Total Volume</th>
                          <th className="py-3 px-2 font-black uppercase tracking-widest text-[9px]">Your royalty reward</th>
                          <th className="py-3 px-2 font-black uppercase tracking-widest text-[9px] text-right">Blockchain Age</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {nftSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-white/[0.01]">
                            <td className="py-4 px-2 font-bold text-white text-[11px] truncate">{sale.item}</td>
                            <td className="py-4 px-2 font-mono text-zinc-500 text-[10px]">{sale.buyer}</td>
                            <td className="py-4 px-2 font-mono text-zinc-400 font-bold text-[10px]">{sale.price}</td>
                            <td className="py-4 px-2 font-mono text-emerald-400 font-black text-[11px] flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> {sale.royalty}
                            </td>
                            <td className="py-4 px-2 text-zinc-500 text-[9px] text-right font-bold uppercase">{sale.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vault Grid */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] px-2 flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5 text-purple-400" /> Digital Collection Vault
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {nfts.length > 0 ? (
                      nfts.map((nft, idx) => (
                        <motion.div
                          key={nft.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-2.5 group hover:bg-white/10 transition-all cursor-pointer relative"
                          onClick={() => {
                            setSelectedNFTForManage(nft);
                            setIsManageModalOpen(true);
                          }}
                        >
                          <div className="aspect-square rounded-2xl overflow-hidden mb-2 relative">
                            <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} className="w-full h-full object-cover" alt="" />
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black text-cyan-400">
                              {nft.price} TON
                            </div>
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-tight truncate px-1">{nft.title}</h4>
                          <p className="text-[8px] font-bold text-zinc-500 truncate px-1 mt-0.5">{nft.edition}</p>
                          <div className="absolute inset-0 bg-purple-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
                            <button className="px-3 py-1.5 bg-purple-600 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                              Manage NFT
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-white/[0.01] rounded-[28px] border border-dashed border-white/[0.05]">
                        <Gem className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No web3 artifact minted yet</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* FAN CONNECT (DMs & EXCLUSIVE DROPS) TAB */}
            {activeTab === "fanconnect" && (
              <div className="space-y-6">
                
                {/* Side-by-Side Live DMs and Chat Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 bg-white/[0.02] backdrop-blur-md rounded-[32px] overflow-hidden shadow-xl min-h-[480px]">
                  
                  {/* Left Fan/Collector list */}
                  <div className="md:col-span-1 border-r border-white/[0.03] p-4 space-y-3">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" /> Active Collectors ({conversations.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {conversations.map((convo) => (
                        <div
                          key={convo.id}
                          onClick={() => setActiveConvoId(convo.id)}
                          className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                            activeConvoId === convo.id 
                              ? "bg-white/[0.06]" 
                              : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={convo.avatar} className="w-full h-full object-cover" alt="" />
                            {convo.status === "online" && (
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black shadow-lg" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white truncate">{convo.name}</span>
                              <span className="text-[7.5px] px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 font-black rounded-md">{convo.badge}</span>
                            </div>
                            <p className="text-[9px] font-bold text-zinc-500 truncate mt-0.5">@{convo.handle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right DM Conversation View */}
                  <div className="md:col-span-2 flex flex-col h-[480px]">
                    {activeConvo ? (
                      <>
                        {/* Conversation Header */}
                        <div className="p-4 border-b border-white/[0.03] flex items-center gap-3">
                          <img src={activeConvo.avatar} className="w-8 h-8 rounded-xl object-cover" alt="" />
                          <div>
                            <span className="text-xs font-black uppercase text-white tracking-wide">{activeConvo.name}</span>
                            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest block">@{activeConvo.handle}</span>
                          </div>
                        </div>

                        {/* Conversational Bubbles Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
                          {activeConvo.messages.map((message, i) => {
                            const isArtistMsg = message.sender === "artist";
                            return (
                              <div
                                key={i}
                                className={`max-w-[80%] p-3 rounded-2xl text-xs flex flex-col ${
                                  isArtistMsg 
                                    ? "bg-cyan-500 text-black font-semibold rounded-tr-none self-end ml-auto" 
                                    : "bg-white/[0.04] text-white rounded-tl-none self-start mr-auto"
                                }`}
                              >
                                <p>{message.text}</p>
                                <span className={`text-[8.5px] font-mono mt-1 text-right ${
                                  isArtistMsg ? "text-slate-800" : "text-zinc-500"
                                }`}>
                                  {message.time}
                                </span>
                              </div>
                            );
                          })}

                          {isTyping && (
                            <div className="bg-white/[0.04] p-3 rounded-2xl rounded-tl-none self-start mr-auto max-w-[80%] text-[10px] text-zinc-400 animate-pulse flex items-center gap-1">
                              Dynamic reply agent is generating response...
                            </div>
                          )}
                        </div>

                        {/* Message Input text */}
                        <div className="p-4 border-t border-white/[0.03] flex gap-2">
                          <input
                            type="text"
                            placeholder={`Reply to ${activeConvo.name}...`}
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSendMessage();
                            }}
                            className="flex-1 text-xs p-3 rounded-xl bg-black/40 border border-white/[0.05] focus:outline-none focus:border-cyan-500 text-white placeholder-zinc-700"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="p-3 bg-cyan-500 hover:bg-cyan-400 transition-colors text-black rounded-xl"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <MessageSquare className="w-8 h-8 text-zinc-700 mb-2" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select a collector conversation to chat</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Gated Exclusive Content Drops Form */}
                <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-[32px] shadow-lg space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-purple-400 animate-pulse" /> Launch Exclusive drop (Perks)
                    </h3>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Provide cryptographic gating to incentivize fan subscription club & NFT purchases</p>
                  </div>

                  <form onSubmit={handlePostDrop} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Drop Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Vintage Synth Stems"
                        value={newDropTitle}
                        onChange={(e) => setNewDropTitle(e.target.value)}
                        className="w-full text-xs font-semibold p-3 bg-black/40 border border-white/[0.05] rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-zinc-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Desc / Perk notes</label>
                      <input
                        type="text"
                        placeholder="Tell fans how to unlock..."
                        value={newDropDesc}
                        onChange={(e) => setNewDropDesc(e.target.value)}
                        className="w-full text-xs font-semibold p-3 bg-black/40 border border-white/[0.05] rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-zinc-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Target Audience</label>
                        <select
                          value={newDropGating}
                          onChange={(e) => setNewDropGating(e.target.value)}
                          className="w-full text-xs p-3 bg-black/40 border border-white/[0.05] rounded-xl text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="NFT Holders Only">NFT Holders</option>
                          <option value="VIP Fan Club Only">VIP Club Only</option>
                          <option value="Active Node Stakers">Node Stakers</option>
                          <option value="Public Whitelist">Public</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full py-3.5 bg-purple-600 font-extrabold text-[9px] uppercase hover:bg-purple-500 transition-colors text-white tracking-widest rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Rocket className="w-3.5 h-3.5" /> Deploy Drop
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Active exclusive Perks List */}
                  <div className="space-y-2 pt-4 border-t border-white/[0.03]">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Active Exclusive Drops</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {exclusiveDrops.map((drop) => (
                        <div key={drop.id} className="bg-black/30 p-4 rounded-2xl border border-white/[0.03] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-white tracking-wide truncate">{drop.title}</span>
                            <span className="text-[7.5px] px-2 py-0.5 bg-purple-500/15 text-purple-400 font-black tracking-wider uppercase rounded-full">
                              🔒 {drop.gating}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">{drop.description}</p>
                          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 font-black uppercase tracking-wider pt-2 border-t border-white/[0.02]">
                            <span>Type: {drop.type}</span>
                            <span>{drop.downloads} Downloads</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Keep the Original Model handlers completely functional */}
      {selectedTrackForConfig && (
        <TrackMonetizationModal 
          track={selectedTrackForConfig}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onUpdate={fetchStaticData}
        />
      )}

      {selectedTrackForMetadata && (
        <EditMetadataModal 
          track={selectedTrackForMetadata}
          isOpen={isEditMetadataOpen}
          onClose={() => setIsEditMetadataOpen(false)}
          onUpdate={fetchStaticData}
        />
      )}
      
      {selectedNFTForManage && (
        <ManageNFTModal
          nft={selectedNFTForManage}
          isOpen={isManageModalOpen}
          onClose={() => {
            setIsManageModalOpen(false);
            fetchStaticData();
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

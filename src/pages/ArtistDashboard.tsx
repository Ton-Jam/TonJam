import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { 
  Music, 
  Gem, 
  User,
  Coins, 
  Upload, 
  Disc,
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
  FileText,
  Square,
  CheckSquare,
  Trash2,
  Wand2,
  Percent,
  AlertCircle,
  Check,
  Loader2,
  ImageIcon,
  Handshake,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BackButton } from "@/components/BackButton";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { getPlaceholderImage } from "@/lib/utils";
import { Artist } from "@/types";
import RoyaltyDashboard from "@/components/RoyaltyDashboard";
import RoyaltyConfigModal from "@/components/RoyaltyConfigModal";
import TrackMonetizationModal from "@/components/TrackMonetizationModal";
import EditMetadataModal from "@/components/EditMetadataModal";
import SponsorshipSubmissionModal from "@/components/SponsorshipSubmissionModal";
import { BadgeSystem } from "@/components/BadgeSystem";
import CollectorTier from "@/components/CollectorTier";
import { CollabRequestsManager } from "@/components/CollabRequestsManager";

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
import CreatorDashboard from "@/components/CreatorDashboard";
import ArtistVerificationSection from "@/components/ArtistVerificationSection";
import MintingStatus from "@/components/MintingStatus";
import LiveTourManager from "@/components/LiveTourManager";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { getEarnings, addNotification, deleteTrack, updateTrack, addUserNFT, userProfile } = useAudio();
  const { user, isArtist, isAdmin, loading } = useAuth();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<"overview" | "creator" | "verification" | "sonic" | "analytics" | "nfts" | "fanconnect" | "collections" | "loyalty" | "royalties" | "portfolio" | "collabs" | "tours">("overview");
  const [isRoyaltyModalOpen, setIsRoyaltyModalOpen] = useState(false);

  const artistDataForRoyalty = useMemo(() => {
    return {
      uid: userProfile?.uid || '',
      name: userProfile?.name || userProfile?.username || 'Verified Creator',
      username: userProfile?.username || '',
      walletAddress: userProfile?.walletAddress || '',
      avatarUrl: userProfile?.avatar || '',
      followers: userProfile?.followers || 0,
      verified: userProfile?.isVerified || false,
      isVerifiedArtist: userProfile?.isVerifiedArtist || false,
      royaltyConfig: userProfile?.royaltyConfig ? {
        streamingSplits: userProfile.royaltyConfig.streamingSplits || [],
        nftSaleSplits: userProfile.royaltyConfig.nftSaleSplits || [],
        streamingPercentage: 0.05,
        nftSaleShare: 0.10,
      } : {
        streamingSplits: [{ address: userProfile?.walletAddress || '', percentage: 1.0, label: 'Main Artist' }],
        nftSaleSplits: [{ address: userProfile?.walletAddress || '', percentage: 1.0, label: 'Main Artist' }],
        streamingPercentage: 0.05,
        nftSaleShare: 0.10,
      },
      earnings: {
        streaming: userProfile?.streamingEarnings || 0,
        nftSales: userProfile?.nftEarnings || 0,
        total: userProfile?.earnings || 0,
      }
    } as Artist;
  }, [userProfile]);

  // Bulk Selection States
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProcessingMsg, setBulkProcessingMsg] = useState("");

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

  // Enhanced upload states for real-time validation and IPFS metadata progress
  const [uploadAudioFile, setUploadAudioFile] = useState<File | null>(null);
  const [uploadCoverFile, setUploadCoverFile] = useState<File | null>(null);
  const [uploadCoverPreview, setUploadCoverPreview] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'validating' | 'pinning_audio' | 'pinning_metadata' | 'blockchain_sync' | 'success'>('idle');
  const [uploadErrors, setUploadErrors] = useState<{ title?: string; genre?: string; audio?: string; cover?: string }>({});
  const [isUploadFormTouched, setIsUploadFormTouched] = useState({ title: false, genre: false, audio: false, cover: false });

  // Real-time validation
  useEffect(() => {
    const errors: { title?: string; genre?: string; audio?: string; cover?: string } = {};

    if (isUploadFormTouched.title || uploadTitle.length > 0) {
      if (!uploadTitle.trim()) {
        errors.title = "Track title is required";
      } else if (uploadTitle.trim().length < 3) {
        errors.title = "Title must be at least 3 characters";
      }
    }

    if (isUploadFormTouched.genre) {
      if (!uploadGenre) {
        errors.genre = "Please select a genre";
      }
    }

    if (uploadAudioFile) {
      const allowedAudio = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'];
      const fileExt = uploadAudioFile.name.split('.').pop()?.toLowerCase() || '';
      if (uploadAudioFile.size > 50 * 1024 * 1024) {
        errors.audio = "File size exceeds 50MB boundary limit";
      } else if (!allowedAudio.includes(fileExt)) {
        errors.audio = `Unsupported format. Allowed: ${allowedAudio.join(', ')}`;
      }
    } else if (isUploadFormTouched.audio) {
      errors.audio = "Audio recording file is required";
    }

    if (uploadCoverFile) {
      const allowedImages = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      const fileExt = uploadCoverFile.name.split('.').pop()?.toLowerCase() || '';
      if (uploadCoverFile.size > 10 * 1024 * 1024) {
        errors.cover = "Image size exceeds 10MB boundary limit";
      } else if (!allowedImages.includes(fileExt)) {
        errors.cover = `Unsupported format. Allowed: ${allowedImages.join(', ')}`;
      }
    } else if (isUploadFormTouched.cover) {
      errors.cover = "Cover art image is required";
    }

    // setUploadErrors(errors);
  }, [uploadTitle, uploadGenre, uploadAudioFile, uploadCoverFile, isUploadFormTouched]);

  // Enhanced upload drag-and-drop states & refs
  const audioFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [isAudioDragging, setIsAudioDragging] = useState(false);
  const [isCoverDragging, setIsCoverDragging] = useState(false);

  const handleAudioFileSelect = (file: File) => {
    setIsUploadFormTouched(prev => ({ ...prev, audio: true }));
    setUploadAudioFile(file);
    if (!uploadTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setUploadTitle(baseName);
      setIsUploadFormTouched(prev => ({ ...prev, title: true }));
    }
  };

  const handleCoverFileSelect = (file: File) => {
    setIsUploadFormTouched(prev => ({ ...prev, cover: true }));
    setUploadCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsAudioDragging(true);
    } else if (e.type === "dragleave") {
      setIsAudioDragging(false);
    }
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAudioDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAudioFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCoverDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsCoverDragging(true);
    } else if (e.type === "dragleave") {
      setIsCoverDragging(false);
    }
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverFileSelect(e.dataTransfer.files[0]);
    }
  };

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
    if (!loading && (!user || (!isArtist && !isAdmin))) {
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
  }, [user, isArtist, isAdmin, loading, navigate]);

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

  const handleBulkMint = async () => {
    const tracksToMint = tracks.filter(t => selectedTrackIds.includes(t.id) && !t.isNFT);
    if (tracksToMint.length === 0) {
      addNotification("No eligible unminted tracks selected", "warning");
      return;
    }

    setIsBulkProcessing(true);
    setBulkProcessingMsg(`Preparing mass-mint of ${tracksToMint.length} track(s)...`);

    try {
      for (let i = 0; i < tracksToMint.length; i++) {
        const track = tracksToMint[i];
        setBulkProcessingMsg(`[${i + 1}/${tracksToMint.length}] Broadcasting "${track.title}" onto TON Ledger...`);
        
        await new Promise((resolve) => setTimeout(resolve, 800));

        const nftId = `nft-${Date.now()}-${track.id}`;
        const newNft: any = {
          id: nftId,
          trackId: track.id,
          title: track.title,
          description: track.description || `Decentralized sound recording NFT collectible of "${track.title}"`,
          owner: userProfile?.name || "Verified Creator",
          creator: userProfile?.name || track.artistName || "Verified Creator",
          artistId: user?.uid || track.artistId,
          price: "2.5",
          imageUrl: track.coverUrl || getPlaceholderImage(track.title),
          coverUrl: track.coverUrl || getPlaceholderImage(track.title),
          audioUrl: track.audioUrl || "",
          edition: "Limited",
          isNFT: true,
          listingType: "fixed" as const,
          mintedAt: new Date().toISOString(),
          ownerAddress: userProfile?.walletAddress || "EQ_vault"
        };

        await addUserNFT(newNft, true);
        await updateTrack(track.id, { isNFT: true });
      }

      addNotification(`Mass-minted ${tracksToMint.length} assets successfully compiled to the TON VM! 🌌💎`, "success");
      setSelectedTrackIds([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "bulk-mint");
      addNotification("Mass-minting failed. Check smart contract parameters.", "error");
    } finally {
      setIsBulkProcessing(false);
      setBulkProcessingMsg("");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTrackIds.length === 0) {
      addNotification("No tracks selected for deletion", "warning");
      return;
    }

    setIsBulkProcessing(true);
    setBulkProcessingMsg(`Purging ${selectedTrackIds.length} selective records from IPFS indexes...`);

    try {
      for (let i = 0; i < selectedTrackIds.length; i++) {
        const trackId = selectedTrackIds[i];
        await deleteTrack(trackId);
      }
      addNotification(`Batch metadata purge of ${selectedTrackIds.length} items complete!`, "success");
      setSelectedTrackIds([]);
    } catch (err) {
      addNotification("Batch delete encountered an error.", "error");
    } finally {
      setIsBulkProcessing(false);
      setBulkProcessingMsg("");
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

  // Upload track simulator with real-time validation and stage-by-stage IPFS metadata pinning
  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Touch all fields to trigger validations and display feedback
    setIsUploadFormTouched({ title: true, genre: true, audio: true, cover: true });

    const errors: { title?: string; genre?: string; audio?: string; cover?: string } = {};
    if (!uploadTitle.trim()) {
      errors.title = "Track title is required";
    } else if (uploadTitle.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }
    
    if (!uploadGenre) {
      errors.genre = "Please select a genre";
    }
    
    if (!uploadAudioFile) {
      errors.audio = "Audio recording file is required";
    } else {
      const allowedAudio = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'];
      const fileExt = uploadAudioFile.name.split('.').pop()?.toLowerCase() || '';
      if (uploadAudioFile.size > 50 * 1024 * 1024) {
        errors.audio = "File size exceeds 50MB boundary limit";
      } else if (!allowedAudio.includes(fileExt)) {
        errors.audio = "Unsupported audio format";
      }
    }

    if (!uploadCoverFile) {
      errors.cover = "Cover art image is required";
    } else {
      const allowedImages = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      const fileExt = uploadCoverFile.name.split('.').pop()?.toLowerCase() || '';
      if (uploadCoverFile.size > 10 * 1024 * 1024) {
        errors.cover = "Image size exceeds 10MB boundary limit";
      } else if (!allowedImages.includes(fileExt)) {
        errors.cover = "Unsupported image format";
      }
    }

    if (Object.keys(errors).length > 0) {
      // setUploadErrors(errors);
      addNotification("Please correct the form errors before broadcasting.", "warning");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadPhase('validating');

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += 2;
      if (currentProgress > 100) currentProgress = 100;

      setUploadProgress(currentProgress);

      if (currentProgress < 20) {
        setUploadPhase('validating');
      } else if (currentProgress < 60) {
        setUploadPhase('pinning_audio');
      } else if (currentProgress < 85) {
        setUploadPhase('pinning_metadata');
      } else if (currentProgress < 100) {
        setUploadPhase('blockchain_sync');
      } else {
        clearInterval(timer);
        setUploadPhase('success');

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadPhase('idle');

          const newTrackId = `sim-${Date.now()}`;
          const newTrackObj = {
            id: newTrackId,
            title: uploadTitle,
            genre: uploadGenre,
            coverUrl: uploadCoverPreview || "https://image.pollinations.ai/prompt/electronic%20ambient%20neon%20cover?width=400&height=400&nologo=true",
            playCount: 0,
            likes: 0,
            isNFT: false,
            artistId: user?.uid
          };

          setTracks(prev => [newTrackObj, ...prev]);
          addNotification(`"${uploadTitle}" has been successfully broadcast, pinned to IPFS, and synced with TON Blockchain! 🎵🚀`, "success");

          // Reset form fields and validation states
          setUploadTitle("");
          setUploadGenre("Electronic");
          setUploadAudioFile(null);
          setUploadCoverFile(null);
          setUploadCoverPreview(null);
          setIsUploadFormTouched({ title: false, genre: false, audio: false, cover: false });
        }, 1200);
      }
    }, 80);
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
    <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden">
      {/* Dynamic Ambient Blur Backgrounds */}
      <div className="fixed inset-0 opacity-10 blur-[130px] pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-80 h-80 bg-cyan-500 rounded-full" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-full p-2 sm:p-4 space-y-4">
        
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-4 sm:p-6 rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              Artist Hub <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </h1>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              Manage tracks, sales & fans
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
               onClick={() => navigate("/create-album")}
               className="h-9 px-4 bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-purple-900/30"
            >
                <Disc className="w-3.5 h-3.5" /> Create Album
            </button>
            <button
               onClick={() => navigate("/upload")}
               className="h-9 px-4 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2 cursor-pointer"
            >
                <Upload className="w-3.5 h-3.5" /> Upload Track
            </button>
            <BackButton />
          </div>
        </div>

        {/* Workspace Subtab Selection Grid (Porosity Glass Aesthetic) */}
        <div className="flex flex-wrap p-1 bg-white/[0.01] rounded-2xl gap-1">
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
            onClick={() => setActiveTab("creator")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "creator" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-yellow-500" /> Creator Alpha
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "verification" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Verification
          </button>
          <button
            onClick={() => setActiveTab("sonic")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "sonic" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Music className="w-3.5 h-3.5" /> Sonic Library
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
          <button
            onClick={() => setActiveTab("royalties")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "royalties" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Percent className="w-3.5 h-3.5" /> Royalties
          </button>
          <button
            onClick={() => setActiveTab("loyalty")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "loyalty" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" /> Loyalty
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "portfolio" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" /> Portfolio
          </button>
          <button
            onClick={() => setActiveTab("collabs")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "collabs" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Handshake className="w-3.5 h-3.5 text-emerald-400" /> Collabs
          </button>
          <button
            onClick={() => setActiveTab("tours")}
            className={`flex-1 min-w-[120px] transition-all duration-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              activeTab === "tours" 
                ? "bg-white/[0.06] text-white shadow-lg shadow-black/30" 
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Live Tour
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
            className="space-y-4"
          >
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Statistics Bento Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-white/[0.02] p-3 rounded-lg relative overflow-hidden group shadow">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Total Tracks</p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-xl font-black text-cyan-400">{tracks.length}</h3>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-3 rounded-lg relative overflow-hidden group shadow">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Minted</p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-xl font-black text-purple-400">{nfts.length}</h3>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-3 rounded-lg relative overflow-hidden group shadow">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Royalty (TON)</p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-xl font-black text-amber-500">{earnings.toFixed(2)}</h3>
                    </div>
                  </div>
                </div>

                {/* Real-time Pending Minting Status */}
                <MintingStatus />

                {/* Live Streams Bar Chart */}
                <div className="bg-white/[0.02] p-4 rounded-xl shadow-lg">
                  <DailyStreamsChart tracks={tracks} />
                </div>

                {/* Simulated Feed of Listeners Activity */}
                <div className="bg-white/[0.02] p-4 rounded-xl shadow-lg">
                  <ListenerActivityFeed tracks={tracks} />
                </div>

                {/* Audience Request Sub-module */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-0.5 h-4 bg-cyan-500 rounded-full animate-pulse" />
                    <h2 className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">Audience Requests</h2>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl shadow-lg">
                    <SongRequestsTab artistId={user.uid} isOwnProfile={true} />
                  </div>
                </div>
              </>
            )}

            {/* CREATOR DASHBOARD TAB */}
            {activeTab === "creator" && (
              <CreatorDashboard />
            )}

            {/* ARTIST VERIFICATION TAB */}
            {activeTab === "verification" && (
              <ArtistVerificationSection />
            )}

            {/* SONIC TAB */}
            {activeTab === "sonic" && (
              <div className="space-y-6">
                {/* Enhanced Upload Form inside Digital Distribution Studio */}
                <div className="bg-white/[0.02] p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-cyan-400" /> Digital Distribution Studio
                    </h3>
                    {!isUploading && (
                      <span className="text-[8px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-full uppercase tracking-widest animate-pulse">
                        Uplink Calibrated
                      </span>
                    )}
                  </div>
                  
                  {isUploading ? (
                    <div className="grid grid-cols-1 gap-6 py-6 transition-all duration-300">
                      <div className="bg-black/40 p-6 rounded-2xl flex flex-col justify-center items-center py-10">
                        <div className="w-20 h-20 relative flex items-center justify-center mb-6">
                          {/* Circular progress SVG */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-white/5 fill-none"
                              strokeWidth="4"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-cyan-400 fill-none transition-all duration-150 ease-out"
                              strokeWidth="4"
                              strokeDasharray="213.6"
                              strokeDashoffset={213.6 - (213.6 * uploadProgress) / 100}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {uploadPhase === 'success' ? (
                              <CheckCircle className="w-8 h-8 text-emerald-400" />
                            ) : (
                              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                            )}
                          </div>
                        </div>

                        <div className="text-center space-y-1.5 max-w-sm mb-6">
                          <h4 className="text-xs font-black uppercase tracking-widest text-white">
                            {uploadPhase === 'validating' && "Authenticating Artifact..."}
                            {uploadPhase === 'pinning_audio' && "Pinning Audio to IPFS..."}
                            {uploadPhase === 'pinning_metadata' && "Forging Metadata IPFS Index..."}
                            {uploadPhase === 'blockchain_sync' && "Ledger Synchronisation..."}
                            {uploadPhase === 'success' && "Transmission Broadcast Successful!"}
                          </h4>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                            {uploadPhase === 'validating' && "Verifying files and cryptographic splits..."}
                            {uploadPhase === 'pinning_audio' && "Slicing stems into IPFS block matrices..."}
                            {uploadPhase === 'pinning_metadata' && "Publishing metadata schema to distributed web..."}
                            {uploadPhase === 'blockchain_sync' && "Registering immutable metadata on the TON ledger..."}
                            {uploadPhase === 'success' && "NFT catalog and streaming database successfully updated."}
                          </p>
                        </div>

                        {/* Overall Progress Bar */}
                        <div className="w-full max-w-md space-y-2 mb-6">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
                            <span>Protocol Uplink Progress</span>
                            <span className="text-cyan-400 font-mono">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full transition-all duration-150 ease-out rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* Stage-by-Stage Tracker */}
                        <div className="w-full max-w-md space-y-3 pt-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2.5">
                              {uploadProgress >= 20 ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : uploadPhase === 'validating' ? (
                                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
                              )}
                              <span className={uploadProgress >= 20 ? "text-zinc-500" : uploadPhase === 'validating' ? "text-white" : "text-zinc-600"}>
                                1. Cryptographic Validation
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500">
                              {uploadProgress >= 20 ? "VERIFIED" : uploadPhase === 'validating' ? "CHECKING" : "PENDING"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2.5">
                              {uploadProgress >= 60 ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : uploadPhase === 'pinning_audio' ? (
                                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
                              )}
                              <span className={uploadProgress >= 60 ? "text-zinc-500" : uploadPhase === 'pinning_audio' ? "text-white" : "text-zinc-600"}>
                                2. IPFS High-Fidelity Audio Pinning
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500">
                              {uploadProgress >= 60 ? "PINNED" : uploadPhase === 'pinning_audio' ? "UPLOADING" : "PENDING"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2.5">
                              {uploadProgress >= 85 ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : uploadPhase === 'pinning_metadata' ? (
                                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
                              )}
                              <span className={uploadProgress >= 85 ? "text-zinc-500" : uploadPhase === 'pinning_metadata' ? "text-white" : "text-zinc-600"}>
                                3. IPFS Metadata Forge & Pins
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500">
                              {uploadProgress >= 85 ? "FORGED" : uploadPhase === 'pinning_metadata' ? "PINNING" : "PENDING"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2.5">
                              {uploadProgress >= 100 ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : uploadPhase === 'blockchain_sync' ? (
                                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
                              )}
                              <span className={uploadProgress >= 100 ? "text-zinc-500" : uploadPhase === 'blockchain_sync' ? "text-white" : "text-zinc-600"}>
                                4. TON Blockchain Synchronization
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500">
                              {uploadProgress >= 100 ? "SYNCED" : uploadPhase === 'blockchain_sync' ? "SYNCING" : "PENDING"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSimulatedUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Side: Metadata Input */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Track Title</label>
                            {uploadErrors.title ? (
                              <span className="text-rose-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> {uploadErrors.title}
                              </span>
                            ) : uploadTitle.trim().length >= 3 ? (
                              <span className="text-emerald-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Validated
                              </span>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Neon Horizon"
                            value={uploadTitle}
                            onChange={(e) => {
                              setUploadTitle(e.target.value);
                              setIsUploadFormTouched(prev => ({ ...prev, title: true }));
                            }}
                            onBlur={() => setIsUploadFormTouched(prev => ({ ...prev, title: true }))}
                            className={`w-full text-xs font-semibold p-3.5 rounded-xl bg-black/40 border transition-all text-white placeholder-zinc-700 outline-none ${
                              uploadErrors.title 
                                ? 'border-rose-500/50 focus:border-rose-500' 
                                : uploadTitle.trim().length >= 3 
                                  ? 'border-emerald-500/20 focus:border-emerald-500/50' 
                                  : 'border-white/[0.05] focus:border-cyan-500'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Genre</label>
                            {uploadErrors.genre ? (
                              <span className="text-rose-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> {uploadErrors.genre}
                              </span>
                            ) : null}
                          </div>
                          <select
                            value={uploadGenre}
                            onChange={(e) => {
                              setUploadGenre(e.target.value);
                              setIsUploadFormTouched(prev => ({ ...prev, genre: true }));
                            }}
                            onBlur={() => setIsUploadFormTouched(prev => ({ ...prev, genre: true }))}
                            className={`w-full text-xs font-semibold p-3.5 rounded-xl bg-black/40 border transition-all text-white outline-none ${
                              uploadErrors.genre 
                                ? 'border-rose-500/50 focus:border-rose-500' 
                                : 'border-white/[0.05] focus:border-cyan-500'
                            }`}
                          >
                            {['Electronic', 'Synthwave', 'Ambient', 'Cyber-Rock', 'Lo-fi', 'Techno', 'House', 'Pop', 'Hip-hop'].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" /> Publish to JamSpace Protocol
                          </button>
                        </div>
                      </div>

                      {/* Right Side: Enhanced Media Drag and Drop Uplinks */}
                      <div className="space-y-4">
                        {/* Audio File Droppable Zone */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Audio Uplink Zone</label>
                            {uploadErrors.audio ? (
                              <span className="text-rose-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> {uploadErrors.audio}
                              </span>
                            ) : uploadAudioFile ? (
                              <span className="text-emerald-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Checked & Verified
                              </span>
                            ) : null}
                          </div>
                          
                          <div 
                            onDragEnter={handleAudioDrag}
                            onDragOver={handleAudioDrag}
                            onDragLeave={handleAudioDrag}
                            onDrop={handleAudioDrop}
                            onClick={() => audioFileRef.current?.click()}
                            className={`flex flex-col justify-center items-center text-center p-5 rounded-2xl border border-dashed transition-all cursor-pointer relative group min-h-[100px] ${
                              isAudioDragging 
                                ? 'border-cyan-400 bg-cyan-500/5' 
                                : uploadAudioFile 
                                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                                  : uploadErrors.audio 
                                    ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50' 
                                    : 'border-white/[0.05] bg-black/20 hover:border-cyan-500/30'
                            }`}
                          >
                            <input 
                              type="file" 
                              ref={audioFileRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAudioFileSelect(file);
                              }}
                              accept=".mp3,.wav,.flac,.ogg,.m4a,.aac"
                              className="hidden" 
                            />
                            {uploadAudioFile ? (
                              <div className="flex items-center gap-3 w-full text-left">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                  <Music className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black text-white truncate uppercase tracking-wide">{uploadAudioFile.name}</p>
                                  <p className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">
                                    {(uploadAudioFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadAudioFile.name.split('.').pop()?.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className={`w-6 h-6 mb-1.5 transition-transform group-hover:translate-y-[-2px] ${
                                  uploadErrors.audio ? 'text-rose-400' : 'text-zinc-600 group-hover:text-cyan-400'
                                }`} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                  Drag & Drop Audio
                                </p>
                                <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-wider mt-0.5">
                                  WAV, FLAC, or MP3 (Max 50MB)
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Cover Image Droppable Zone */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Cover Art Uplink Zone</label>
                            {uploadErrors.cover ? (
                              <span className="text-rose-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> {uploadErrors.cover}
                              </span>
                            ) : uploadCoverFile ? (
                              <span className="text-emerald-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Loaded
                              </span>
                            ) : null}
                          </div>
                          
                          <div 
                            onDragEnter={handleCoverDrag}
                            onDragOver={handleCoverDrag}
                            onDragLeave={handleCoverDrag}
                            onDrop={handleCoverDrop}
                            onClick={() => coverFileRef.current?.click()}
                            className={`flex flex-col justify-center items-center text-center p-5 rounded-2xl border border-dashed transition-all cursor-pointer relative group min-h-[100px] ${
                              isCoverDragging 
                                ? 'border-cyan-400 bg-cyan-500/5' 
                                : uploadCoverFile 
                                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                                  : uploadErrors.cover 
                                    ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50' 
                                    : 'border-white/[0.05] bg-black/20 hover:border-cyan-500/30'
                            }`}
                          >
                            <input 
                              type="file" 
                              ref={coverFileRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCoverFileSelect(file);
                              }}
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="hidden" 
                            />
                            {uploadCoverFile ? (
                              <div className="flex items-center gap-3 w-full text-left">
                                {uploadCoverPreview && (
                                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative">
                                    <img src={uploadCoverPreview} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black text-white truncate uppercase tracking-wide">{uploadCoverFile.name}</p>
                                  <p className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">
                                    {(uploadCoverFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadCoverFile.name.split('.').pop()?.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <ImageIcon className={`w-6 h-6 mb-1.5 transition-transform group-hover:scale-105 ${
                                  uploadErrors.cover ? 'text-rose-400' : 'text-zinc-600 group-hover:text-cyan-400'
                                }`} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                  Drag & Drop Cover
                                </p>
                                <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-wider mt-0.5">
                                  JPEG, PNG, WebP (Max 10MB)
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
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
                    className="w-full bg-[#10141b]/20 p-4 rounded-[4px] border border-white/[0.02]"
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
                    {tracks.length > 0 && (
                      <button 
                        onClick={() => {
                          if (selectedTrackIds.length === tracks.length) {
                            setSelectedTrackIds([]);
                          } else {
                            setSelectedTrackIds(tracks.map(t => t.id));
                          }
                        }}
                        className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        {selectedTrackIds.length === tracks.length ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" /> Deselect All ({selectedTrackIds.length})
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5" /> Select All ({tracks.length})
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Bulk Actions Panel */}
                  <AnimatePresence>
                    {selectedTrackIds.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-zinc-900/60 rounded-3xl flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200">
                            {selectedTrackIds.length} track(s) selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleBulkMint}
                            disabled={isBulkProcessing}
                            className="bg-purple-600 hover:bg-purple-500 transition-all text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Wand2 className="w-3 h-3" /> Mass-Mint as NFTs
                          </button>
                          <button
                            onClick={() => setSelectedTrackIds([])}
                            disabled={isBulkProcessing}
                            className="text-zinc-500 hover:text-zinc-300 text-[9px] font-black uppercase tracking-widest px-2 py-1.5 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isBulkProcessing && (
                    <div className="p-4 bg-purple-900/30 text-purple-200 rounded-3xl flex items-center gap-3 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {bulkProcessingMsg || "Processing bulk transaction..."}
                      </span>
                    </div>
                  )}

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
                            {/* Checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTrackIds(prev =>
                                  prev.includes(track.id)
                                    ? prev.filter(id => id !== track.id)
                                    : [...prev, track.id]
                                );
                              }}
                              className="text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                            >
                              {selectedTrackIds.includes(track.id) ? (
                                <CheckSquare className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>

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

            {/* PORTFOLIO TAB */}
            {activeTab === "portfolio" && (
              <div className="space-y-4">
                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                         Portfolio Showcase <Sparkles className="w-4 h-4 text-amber-400" />
                      </h3>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Preview how your profile appears to collectors and the community</p>
                    </div>
                    <button 
                      onClick={() => navigate('/artist-portfolio')}
                      className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 transition-all"
                    >
                      Full Screen <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Biography Narrative</h4>
                      </div>
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium italic">
                          "{userProfile?.bio || "No biography provided. Head to your profile settings to craft your story."}"
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Location</span>
                            <span className="text-xs font-bold">{userProfile?.location || "Distributed Node"}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Genre</span>
                            <span className="text-xs font-bold text-cyan-400">{userProfile?.favoriteGenres?.[0] || "Electronic"}</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gem className="w-3.5 h-3.5 text-zinc-500" />
                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Featured NFTs</h4>
                        </div>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{nfts.length} Total</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {nfts.slice(0, 3).map((nft) => (
                          <div key={nft.id} className="aspect-square rounded-2xl overflow-hidden border border-white/5 group relative shadow-lg">
                            <img src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(nft.title)} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Gem className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        ))}
                        {nfts.length === 0 && (
                          <div className="col-span-3 py-10 text-center bg-black/20 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
                            <Music className="w-6 h-6 text-zinc-800" />
                            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em]">Zero artifacts minted</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Signature Dashboard View</p>
                    <button 
                      onClick={() => navigate('/artist-portfolio')}
                      className="px-8 py-3 bg-white text-black hover:bg-zinc-200 font-black text-[10px] uppercase tracking-[0.25em] rounded-full transition-all shadow-xl shadow-white/5"
                    >
                      Enter High-Fidelity Portfolio
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COLLABS TAB */}
            {activeTab === "collabs" && (
              <CollabRequestsManager />
            )}

            {/* LIVE TOUR / EVENTS TAB */}
            {activeTab === "tours" && (
              <LiveTourManager />
            )}

            {/* NFT SALES TAB */}
            {activeTab === "nfts" && (
              <div className="space-y-6">
                {/* Real-time Minting Status Pipeline */}
                <MintingStatus />
                
                {/* Secondary sales ledger display */}
                <div className="bg-white/[0.02] p-6 rounded-[4px] shadow-lg">
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
                    <Gem className="w-3.5 h-3.5 text-purple-400" /> Digital Collection Library
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
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded-md text-[8px] font-black text-cyan-400">
                              {nft.price} TON
                            </div>
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-tight truncate px-1">{nft.title}</h4>
                          <p className="text-[8px] font-bold text-zinc-500 truncate px-1 mt-0.5">{nft.edition}</p>
                          <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
                            <button className="px-3 py-1.5 bg-purple-600 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                              Manage NFT
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-white/[0.01] rounded-[4px] border border-dashed border-white/[0.05]">
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
                <div className="grid grid-cols-1 md:grid-cols-3 bg-white/[0.02] rounded-[4px] overflow-hidden shadow-xl min-h-[480px]">
                  
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
                <div className="bg-white/[0.02] p-6 rounded-[4px] shadow-lg space-y-6">
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

            {activeTab === "loyalty" && (
              <div className="space-y-6">
                
                {/* Embedded dynamic metrics overview */}
                <div className="p-6 rounded-3xl bg-white/[0.02] space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" /> Platform Loyalty Ecosystem
                    </h3>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Your decentralized credentials, active nodes & unlocked curation badges
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                    <div className="bg-black/40 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">User Engagement</p>
                      <span className="text-xs font-black text-white uppercase">High Connectivity</span>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Streaming Activity</p>
                      <span className="text-xs font-black text-cyan-400 uppercase">Interactive Node</span>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">NFT Holdings</p>
                      <span className="text-xs font-black text-purple-400 uppercase">{nfts.length} scarce assets</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Collector Tier Indicator */}
                  <div className="bg-white/[0.02] p-6 rounded-3xl">
                    <CollectorTier user={userProfile} isOwnProfile={true} />
                  </div>

                  {/* Badge System */}
                  <div className="bg-white/[0.02] p-6 rounded-3xl">
                    <BadgeSystem user={userProfile} isOwnProfile={true} />
                  </div>
                </div>

              </div>
            )}

            {activeTab === "royalties" && (
              <div className="space-y-6">
                <RoyaltyDashboard 
                  artist={artistDataForRoyalty} 
                  onConfigure={() => setIsRoyaltyModalOpen(true)}
                />
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

      {isRoyaltyModalOpen && (
        <RoyaltyConfigModal
          isOpen={isRoyaltyModalOpen}
          onClose={() => setIsRoyaltyModalOpen(false)}
          artist={artistDataForRoyalty}
        />
      )}

    </div>
  );
}

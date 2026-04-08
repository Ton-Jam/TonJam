import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  Plus, 
  ChartLine, 
  Music, 
  Coins, 
  UserPen, 
  Play, 
  Users, 
  Wallet, 
  Gem, 
  Ellipsis, 
  Code2, 
  Link2, 
  Radio, 
  CheckCircle2,
  Hammer,
  Loader2,
  FileAudio,
  Activity,
  Music2,
  Key,
  Info,
  Upload,
  Trash2,
  Megaphone,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { GoogleGenAI, Type } from "@google/genai";
import { uploadAudio, uploadCover } from "@/services/storageService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES } from "@/lib/utils";
import {
  MOCK_USER,
  MOCK_ARTISTS,
  MOCK_TRACKS,
  MOCK_NFTS,
  APP_LOGO,
  TJ_COIN_ICON,
  TON_LOGO,
} from "@/constants";
import { useAudio } from "@/context/AudioContext";
import { Track, Artist, NFTItem } from "@/types";
import TrackCard from "@/components/TrackCard";
import NFTCard from "@/components/NFTCard";
import { ChartAreaInteractive } from "@/components/ChartAreaInteractive";
import { ChartRevenue } from "@/components/ChartRevenue";

import RoyaltyConfigModal from "@/components/RoyaltyConfigModal";
import ProtocolForge from "@/components/ProtocolForge";
import ArtistVerification from "@/components/ArtistVerification";
import ConfirmationModal from "@/components/ConfirmationModal";
import SongRequests from "@/components/SongRequests";

const ArtistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification, userProfile, transactions, artists, addUserNFT, searchQuery, addUserTrack, userTracks, userNFTs, deleteTrack, posts, createPost, sponsoredPosts, submitSponsorship, allTracks, allNFTs, userAddress, withdrawTON } = useAudio();
  
  useEffect(() => {
    if (userProfile.role !== 'artist' && !userProfile.isVerifiedArtist) {
      addNotification("Access Denied: Artist role required.", "error");
      navigate('/');
    }
  }, [userProfile.role, userProfile.isVerifiedArtist, navigate, addNotification]);

  /* Find the artist profile for the current user (mocking that MOCK_USER is Neon Voyager for this demo) */ 
  const currentArtist = useMemo(() => {
    return artists.find((a) => a.name === userProfile.name) || artists[0];
  }, [artists, userProfile.name]);

  const artistData = currentArtist;

  const artistPosts = useMemo(() => {
    return posts.filter(p => p.authorId === artistData.uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, artistData.uid]);

  const allArtistTracks = useMemo(() => {
    const mockTracks = MOCK_TRACKS.filter((t) => t.artistId === artistData.uid);
    // Filter out mock tracks that might have been "replaced" by real ones if we had a way to identify them
    // For now, just combine them, but prioritize userTracks (real ones)
    const combined = [...userTracks];
    mockTracks.forEach(mt => {
      if (!combined.find(ct => ct.title === mt.title)) {
        combined.push(mt);
      }
    });
    return combined;
  }, [userTracks, artistData.uid]);

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return allArtistTracks;
    return allArtistTracks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allArtistTracks, searchQuery]);

  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "royalties" | "profile" | "forge" | "collection" | "verification" | "transactions" | "community" | "sponsorship" | "requests">("overview");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'tracks', 'royalties', 'profile', 'forge', 'collection', 'verification', 'transactions', 'community', 'sponsorship', 'requests'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [location.search]);

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState<'TON' | 'JAM'>('TON');
  const [withdrawAddress, setWithdrawAddress] = useState(userAddress || '');
  const [sponsorshipForm, setSponsorshipForm] = useState({
    type: 'track' as 'track' | 'nft' | 'announcement',
    targetId: '',
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '',
    cta: 'Listen Now',
    paymentAmount: '10',
    paymentCurrency: 'TON' as 'TON' | 'JAM',
    durationDays: 7
  });

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!artistData.earnings?.total || Number(artistData.earnings.total) <= 0) {
      addNotification("No earnings available to withdraw", "error");
      return;
    }
    
    setIsWithdrawing(true);
    try {
      // Assuming we withdraw the total earnings to the connected wallet
      await withdrawTON(artistData.earnings.total.toString(), userAddress || '');
      setIsWithdrawModalOpen(false);
    } catch (error) {
      console.error("Withdrawal failed:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleSponsorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitSponsorship({
        artistId: artistData.uid,
        ...sponsorshipForm
      });
      setIsSponsorshipModalOpen(false);
      setSponsorshipForm({
        type: 'track',
        targetId: '',
        title: '',
        subtitle: '',
        imageUrl: '',
        link: '',
        cta: 'Listen Now',
        paymentAmount: '10',
        paymentCurrency: 'TON',
        durationDays: 7
      });
    } catch (error) {
      console.error(error);
    }
  };
  const [isRoyaltyModalOpen, setIsRoyaltyModalOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  
  /* Form states */ const [newTrack, setNewTrack] = useState({
    title: "",
    genre: "Electronic",
    description: "",
    isNFT: false,
    price: "1.0",
    streamingPrice: "0.01",
    bpm: 0,
    key: "",
    editions: "100",
    royalty: "10",
    royaltySplits: [{ address: "", percentage: 100 }],
    createdAt: new Date().toISOString()
  });

  const analyzeAudio = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data,
                },
              },
              {
                text: "Analyze this audio file and provide the genre, BPM (beats per minute), and musical key. Return the result in JSON format with keys: genre, bpm, key.",
              },
            ],
          },
        ],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              genre: { type: Type.STRING },
              bpm: { type: Type.NUMBER },
              key: { type: Type.STRING },
            },
            required: ["genre", "bpm", "key"],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      setNewTrack(prev => ({
        ...prev,
        genre: result.genre || prev.genre,
        bpm: result.bpm || 0,
        key: result.key || "",
      }));
      addNotification("Audio analysis complete!", "success");
    } catch (error) {
      console.error("Audio analysis failed:", error);
      addNotification("Failed to analyze audio. Please enter details manually.", "warning");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'audio', 50);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      setAudioFile(file);
      analyzeAudio(file);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 10);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification("Artist profile updated successfully.", "success");
  };

  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrack.title || !audioFile || !coverFile) {
      addNotification("Please provide title, audio file and cover art.", "warning");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 0. Double check validation
      const audioValidation = validateFile(audioFile, 'audio', 50);
      if (!audioValidation.isValid) {
        throw new Error(audioValidation.error);
      }
      const coverValidation = validateFile(coverFile, 'image', 10);
      if (!coverValidation.isValid) {
        throw new Error(coverValidation.error);
      }

      // 1. Upload to Firebase Storage
      addNotification("Adding track files...", "info");
      
      let audioProg = 0;
      let coverProg = 0;
      const updateOverallProgress = () => {
        setUploadProgress(Math.round((audioProg + coverProg) / 2));
      };

      const [audioRes, coverRes] = await Promise.all([
        uploadAudio(audioFile, (p) => { audioProg = p; updateOverallProgress(); }),
        uploadCover(coverFile, (p) => { coverProg = p; updateOverallProgress(); })
      ]);

      if (!audioRes?.downloadUrl || !coverRes?.downloadUrl) {
        throw new Error("Upload failed: Download URLs missing from response");
      }

      const audioUrl = audioRes.downloadUrl;
      const coverUrl = coverRes.downloadUrl;

      // 2. Create track object
      const trackId = `t-${Date.now()}`;
      const track: Track = {
        id: trackId,
        songId: `song-${trackId}`,
        title: newTrack.title,
        artist: artistData.name,
        artistId: artistData.uid,
        coverUrl: coverUrl || getPlaceholderImage(`track-${Date.now()}`),
        audioUrl: audioUrl,
        audioIpfsUrl: audioUrl,
        coverIpfsUrl: coverUrl,
        duration: 180,
        genre: newTrack.genre,
        bpm: newTrack.bpm,
        key: newTrack.key,
        isNFT: newTrack.isNFT,
        price: newTrack.isNFT ? newTrack.price : undefined,
        editions: newTrack.isNFT ? newTrack.editions : undefined,
        royalty: newTrack.isNFT ? newTrack.royalty : undefined,
        royaltySplits: newTrack.isNFT ? newTrack.royaltySplits : undefined,
        streamingPrice: newTrack.streamingPrice,
        playCount: 0,
        likes: 0,
        releaseDate: new Date().toISOString().split("T")[0],
        createdAt: newTrack.createdAt
      };

      // 3. Save to Firestore
      await addUserTrack(track);
      
      if (newTrack.isNFT) {
        setIsUploading(false);
        navigate('/mint', { state: { track } });
        return;
      }

      setIsUploading(false);
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      setUploadProgress(0);
      setNewTrack({ 
        title: "", 
        genre: "Electronic", 
        description: "", 
        isNFT: false, 
        price: "1.0", 
        streamingPrice: "0.01", 
        bpm: 0, 
        key: "",
        editions: "100",
        royalty: "10",
        royaltySplits: [{ address: "", percentage: 100 }],
        createdAt: new Date().toISOString()
      });
      addNotification("Track added successfully", "success");
    } catch (error: any) {
      console.error("Upload failed:", error);
      addNotification("Upload failed: " + (error.response?.data?.error || error.message), "error");
      setIsUploading(false);
    }
  };
  const StatCard = ({
    label,
    value,
    icon,
    trend,
  }: {
    label: string;
    value: string;
    icon: string;
    trend?: string;
  }) => (
    <div className="glass bg-foreground/[0.02] rounded-[10px] p-4 transition-all group">
      {" "}
      <div className="flex justify-between items-start mb-4">
        {" "}
        <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 flex items-center justify-center text-blue-500">
          {" "}
          {icon === 'fa-play' && <Play className="h-5 w-5" />}
          {icon === 'fa-users' && <Users className="h-5 w-5" />}
          {icon === 'fa-wallet' && <Wallet className="h-5 w-5" />}
          {icon === 'fa-gem' && <Gem className="h-5 w-5" />}
          {icon === 'fa-chart-line' && <ChartLine className="h-5 w-5" />}
          {icon === 'fa-music' && <Music className="h-5 w-5" />}
          {icon === 'fa-coins' && <Coins className="h-5 w-5" />}
          {icon === 'fa-user-edit' && <UserPen className="h-5 w-5" />}
        </div>{" "}
        {trend && (
          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-4 py-4 rounded-[10px]">
            {" "}
            {trend}{" "}
          </span>
        )}{" "}
      </div>{" "}
      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">
        {label}
      </p>{" "}
      <h3 className="text-[20px] font-bold text-blue-400 tracking-tighter">
        {value}
      </h3>{" "}
    </div>
  );
  const performanceData = [
    { name: 'Jan', streams: 40000 },
    { name: 'Feb', streams: 70000 },
    { name: 'Mar', streams: 45000 },
    { name: 'Apr', streams: 90000 },
    { name: 'May', streams: 65000 },
    { name: 'Jun', streams: 85000 },
    { name: 'Jul', streams: 100000 },
    { name: 'Aug', streams: 75000 },
    { name: 'Sep', streams: 50000 },
    { name: 'Oct', streams: 80000 },
    { name: 'Nov', streams: 60000 },
    { name: 'Dec', streams: 95000 },
  ];

  const salesData = [
    { name: 'Week 1', sales: 120 },
    { name: 'Week 2', sales: 250 },
    { name: 'Week 3', sales: 180 },
    { name: 'Week 4', sales: 300 },
  ];

  const followerData = [
    { name: 'Q1', followers: 1200 },
    { name: 'Q2', followers: 2100 },
    { name: 'Q3', followers: 3800 },
    { name: 'Q4', followers: 5400 },
  ];

  return (
    <div className="w-full px-4 sm:px-4 lg:px-4 pb-4 sm:pb-4">
      {" "}
      <div className="w-full">
        {" "}
        {/* Header Section */}{" "}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {" "}
          <div>
            {" "}
            <div className="flex items-center gap-4 mb-4">
              {" "}
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>{" "}
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.5em]">
                Artist Command Center
              </span>{" "}
            </div>{" "}
            <h1 className="text-[32px] font-bold text-foreground tracking-tighter uppercase">
              Dashboard
            </h1>{" "}
          </div>{" "}
          <div className="flex items-center gap-4">
            {" "}
            <button
              onClick={handleUploadTrack}
              disabled={isUploading}
              className="px-4 py-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-4 shadow-lg shadow-neutral-600/20 disabled:opacity-50"
            >
              {isUploading ? <LoadingSpinner size={16} /> : <Plus className="h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload Track'}
            </button>{" "}
            <button
              onClick={() => navigate(`/artist/${artistData.uid}`)}
              className="px-4 py-4 bg-muted/50 hover:bg-muted text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              {" "}
              View Public Profile{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Navigation Tabs */}{" "}
        <div className="flex gap-4 -b mb-4 overflow-x-auto no-scrollbar">
          {" "}
          {[
            { id: "overview", label: "Overview", icon: <ChartLine className="h-4 w-4" /> },
            { id: "tracks", label: "Catalog", icon: <Music className="h-4 w-4" /> },
            { id: "collection", label: "Collection", icon: <Gem className="h-4 w-4" /> },
            { id: "forge", label: "Protocol Forge", icon: <Hammer className="h-4 w-4" /> },
            { id: "verification", label: "Verification", icon: <CheckCircle2 className="h-4 w-4" /> },
            { id: "royalties", label: "Royalties", icon: <Coins className="h-4 w-4" /> },
            { id: "transactions", label: "Transactions", icon: <Wallet className="h-4 w-4" /> },
            { id: "profile", label: "Profile Settings", icon: <UserPen className="h-4 w-4" /> },
            { id: "community", label: "Community", icon: <Users className="h-4 w-4" /> },
            { id: "sponsorship", label: "Sponsorship", icon: <Megaphone className="h-4 w-4" /> },
            { id: "requests", label: "Song Requests", icon: <Music2 className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-4 transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-blue-500" : "text-neutral-500 hover:text-neutral-400"}`}
            >
              {" "}
              {tab.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {tab.label}
              </span>{" "}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-500/50 rounded-full"></div>
              )}{" "}
            </button>
          ))}{" "}
        </div>{" "}
        {/* Content Area */}{" "}
        <div className="animate-in fade-in duration-500">
          {" "}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {" "}
              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                <div className="min-w-[240px] flex-1">
                  <StatCard
                    label="Total Streams"
                    value={allArtistTracks
                      .reduce((acc, t) => acc + (t.playCount || 0), 0)
                      .toLocaleString()}
                    icon="fa-play"
                    trend="+12%"
                  />
                </div>
                <div className="min-w-[240px] flex-1">
                  <StatCard
                    label="Followers"
                    value={(artistData.followers || 0).toLocaleString()}
                    icon="fa-users"
                    trend="+5%"
                  />
                </div>
                <div className="min-w-[240px] flex-1">
                  <StatCard
                    label="Total Earnings"
                    value={`${artistData.earnings?.total} TON`}
                    icon="fa-wallet"
                  />
                </div>
                <div className="min-w-[240px] flex-1">
                  <StatCard
                    label="NFT Sales"
                    value={String(artistData.earnings?.nftSales || "0")}
                    icon="fa-gem"
                  />
                </div>
              </div>{" "}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Performance Analytics */}
                <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                    Performance Analytics
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px' }}
                          itemStyle={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase' }}
                        />
                        <Line type="monotone" dataKey="streams" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Sales */}
                <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                    Recent Sales (TON)
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px' }}
                          itemStyle={{ color: '#8b5cf6', fontSize: '12px', fontWeight: 'bold' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Follower Growth - Replaced with Interactive Area Chart */}
                <div className="glass bg-foreground/[0.02] rounded-[10px] overflow-hidden">
                  <ChartAreaInteractive />
                </div>

                {/* Top Tracks */}
                <div className="glass bg-foreground/[0.02] rounded-[5px] p-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                    Top Tracks
                  </h3>
                  <div className="flex flex-col gap-4 pb-4 no-scrollbar">
                    {allArtistTracks.slice(0, 3).map((track) => (
                      <div key={track.id} className="w-full">
                        <TrackCard track={track} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>{" "}
            </div>
          )}{" "}
          {activeTab === "collection" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-tighter">Your NFT Collection</h2>
                <button 
                  onClick={() => setActiveTab('forge')}
                  className="px-4 py-4 bg-neutral-600/10 rounded-[8px] text-[9px] font-bold text-neutral-500 uppercase tracking-widest hover:bg-neutral-600 hover:text-foreground transition-all"
                >
                  Forge New Protocol
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {userNFTs.length > 0 ? (
                  userNFTs.map(nft => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))
                ) : (
                  MOCK_NFTS.filter(n => n.creator === artistData.name).map(nft => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))
                )}
                {userNFTs.length === 0 && MOCK_NFTS.filter(n => n.creator === artistData.name).length === 0 && (
                  <div className="col-span-full py-4 text-center bg-muted/50 rounded-[20px]">
                    <Gem className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">No minted protocols in your collection.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tracks" && (
            <div className="space-y-4">
              {" "}
              <div className="flex justify-between items-center">
                {" "}
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Your Catalog
                </h3>{" "}
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                  {allArtistTracks.length} Tracks Total
                </span>{" "}
              </div>{" "}
              <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[5px] overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border/50 bg-foreground/[0.02]">
                      <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Track</th>
                      <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Genre</th>
                      <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Streams</th>
                      <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Likes</th>
                      <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.map((track) => (
                      <tr key={track.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <img src={track.coverUrl} className="w-10 h-10 rounded-[5px] object-cover" alt="" />
                            <div>
                              <p className="text-[11px] font-bold text-foreground uppercase">{track.title}</p>
                              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Released {track.releaseDate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{track.genre}</span>
                        </td>
                        <td className="p-4">
                          {track.isNFT ? (
                            <span className="px-4 py-4 bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase rounded-[5px] border border-amber-500/20">Minted NFT</span>
                          ) : (
                            <span className="px-4 py-4 bg-neutral-500/10 text-neutral-500 text-[8px] font-bold uppercase rounded-[5px] border border-neutral-500/20">Ready to Mint</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-[11px] font-mono text-foreground">{(track.playCount || 0).toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-[11px] font-mono text-foreground">{(track.likes || 0).toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-4">
                            {!track.isNFT && (
                              <button 
                                onClick={() => {
                                  navigate('/mint', { state: { track } });
                                }}
                                className="px-4 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-[5px] text-[8px] font-bold uppercase tracking-widest border border-amber-500/20 transition-all"
                              >
                                Mint NFT
                              </button>
                            )}
                            <button 
                              onClick={() => setTrackToDelete(track)}
                              className="text-muted-foreground/50 hover:text-red-500 transition-colors"
                              title="Delete Track"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="text-muted-foreground/50 hover:text-foreground transition-colors">
                              <Ellipsis className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
{" "}
            </div>
          )}{" "}
          {activeTab === "forge" && (
            <div className="animate-in fade-in duration-500">
              <ProtocolForge />
            </div>
          )}

          {activeTab === "verification" && (
            <div className="animate-in fade-in duration-500">
              <ArtistVerification artist={artistData} />
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Transaction History
                </h3>
              </div>
              <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[5px] overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border/50 bg-foreground/[0.02]">
                      <th scope="col" className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Type</th>
                      <th scope="col" className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Amount</th>
                      <th scope="col" className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Timestamp</th>
                      <th scope="col" className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(tx => tx.recipientAddress === artistData.walletAddress || tx.senderAddress === artistData.walletAddress).map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                        <td scope="row" className="p-4 text-[10px] font-bold text-foreground uppercase tracking-widest">{(tx.type || 'transaction').replace('_', ' ')}</td>
                        <td className="p-4 text-[10px] font-mono text-foreground">{tx.amount} TON</td>
                        <td className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="px-4 py-4 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase rounded-[5px] border border-green-500/20">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="animate-in fade-in duration-500">
              <SongRequests artistId={artistData.uid} />
            </div>
          )}

          {activeTab === "sponsorship" && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Sponsorship Console</h3>
                  <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mt-2">Boost your reach with featured placements</p>
                </div>
                <button 
                  onClick={() => setIsSponsorshipModalOpen(true)}
                  className="px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> New Sponsorship
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[5px] overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border/50 bg-foreground/[0.02]">
                          <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Campaign</th>
                          <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Type</th>
                          <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Cost</th>
                          <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</th>
                          <th className="p-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sponsoredPosts.filter(sp => sp.artistId === artistData.uid).map((sp) => (
                          <tr key={sp.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <img src={sp.imageUrl} className="w-10 h-10 rounded-[5px] object-cover" alt="" />
                                <div>
                                  <p className="text-[10px] font-bold text-foreground uppercase">{sp.title}</p>
                                  <p className="text-[8px] text-muted-foreground uppercase">{sp.subtitle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{sp.type}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] font-mono text-foreground">{sp.paymentAmount} {sp.paymentCurrency}</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-[7px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                sp.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                                sp.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                                'bg-amber-500/10 text-amber-500'
                              }`}>
                                {sp.status}
                              </span>
                            </td>
                            <td className="p-4 text-[9px] text-muted-foreground font-mono">
                              {new Date(sp.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {sponsoredPosts.filter(sp => sp.artistId === artistData.uid).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center opacity-30">
                              <p className="text-[8px] font-bold uppercase tracking-widest">No active or past campaigns</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass border border-blue-500/20 bg-blue-500/5 rounded-[10px] p-6">
                    <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Why Sponsor?</h4>
                    <ul className="space-y-4">
                      {[
                        { title: 'Top Placement', desc: 'Appear in the main auto-scrolling carousel on the homepage.' },
                        { title: 'Targeted Reach', desc: 'Reach users interested in your specific genre and style.' },
                        { title: 'NFT Visibility', desc: 'Boost your NFT drops to potential collectors and traders.' }
                      ].map((item) => (
                        <li key={item.title} className="flex gap-4">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">{item.title}</p>
                            <p className="text-[8px] text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sponsorship Modal */}
              {isSponsorshipModalOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="glass border border-border w-full max-w-2xl rounded-[20px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tighter uppercase mb-2">New Sponsorship Pitch</h2>
                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Submit your content for featured placement</p>
                      </div>
                      <button onClick={() => setIsSponsorshipModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <XCircle className="h-6 w-6 text-muted-foreground" />
                      </button>
                    </div>

                    <form onSubmit={handleSponsorshipSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Content Type</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['track', 'nft', 'announcement'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setSponsorshipForm(prev => ({ ...prev, type: type as any }))}
                                  className={`py-3 rounded-[8px] text-[8px] font-bold uppercase tracking-widest border transition-all ${
                                    sponsorshipForm.type === type ? 'bg-blue-600 border-blue-600 text-white' : 'bg-muted/30 border-border/50 text-muted-foreground'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Select {sponsorshipForm.type}</label>
                            <select 
                              value={sponsorshipForm.targetId}
                              onChange={(e) => {
                                const id = e.target.value;
                                const item = sponsorshipForm.type === 'track' 
                                  ? allTracks.find(t => t.id === id) 
                                  : allNFTs.find(n => n.id === id);
                                
                                setSponsorshipForm(prev => ({
                                  ...prev,
                                  targetId: id,
                                  title: item?.title || '',
                                  subtitle: sponsorshipForm.type === 'track' ? `Featured Track by ${artistData.name}` : `Featured NFT by ${artistData.name}`,
                                  imageUrl: item?.coverUrl || '',
                                  link: sponsorshipForm.type === 'track' ? `/track/${id}` : `/nft/${id}`,
                                  cta: sponsorshipForm.type === 'track' ? 'Listen Now' : 'View NFT'
                                }));
                              }}
                              className="w-full bg-muted/50 border border-border rounded-[10px] px-4 py-4 text-[10px] font-bold text-foreground focus:outline-none"
                            >
                              <option value="">Select an item...</option>
                              {sponsorshipForm.type === 'track' && allArtistTracks.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                              ))}
                              {sponsorshipForm.type === 'nft' && MOCK_NFTS.filter(n => n.creator === artistData.name).map(n => (
                                <option key={n.id} value={n.id}>{n.title}</option>
                              ))}
                              {sponsorshipForm.type === 'announcement' && (
                                <option value="custom">Custom Announcement</option>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Display Title</label>
                            <input 
                              type="text"
                              value={sponsorshipForm.title}
                              onChange={(e) => setSponsorshipForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full bg-muted/50 border border-border rounded-[10px] px-4 py-4 text-[10px] font-bold text-foreground"
                            />
                          </div>

                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Display Subtitle</label>
                            <input 
                              type="text"
                              value={sponsorshipForm.subtitle}
                              onChange={(e) => setSponsorshipForm(prev => ({ ...prev, subtitle: e.target.value }))}
                              className="w-full bg-muted/50 border border-border rounded-[10px] px-4 py-4 text-[10px] font-bold text-foreground"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Sponsorship Duration</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[7, 14, 30].map((days) => (
                                <button
                                  key={days}
                                  type="button"
                                  onClick={() => setSponsorshipForm(prev => ({ ...prev, durationDays: days, paymentAmount: (days * 2).toString() }))}
                                  className={`py-3 rounded-[8px] text-[8px] font-bold uppercase tracking-widest border transition-all ${
                                    sponsorshipForm.durationDays === days ? 'bg-blue-600 border-blue-600 text-white' : 'bg-muted/30 border-border/50 text-muted-foreground'
                                  }`}
                                >
                                  {days} Days
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-blue-500/10 p-4 rounded-[10px] border border-blue-500/20">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[8px] font-bold text-blue-500 uppercase">Total Cost</p>
                              <p className="text-lg font-bold text-blue-400 tracking-tighter">{sponsorshipForm.paymentAmount} {sponsorshipForm.paymentCurrency}</p>
                            </div>
                            <p className="text-[7px] text-blue-500/70 uppercase tracking-widest">Payment will be deducted from your wallet upon submission.</p>
                          </div>

                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Banner Image URL</label>
                            <input 
                              type="text"
                              value={sponsorshipForm.imageUrl}
                              onChange={(e) => setSponsorshipForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                              className="w-full bg-muted/50 border border-border rounded-[10px] px-4 py-4 text-[10px] font-bold text-foreground"
                              placeholder="https://..."
                            />
                          </div>

                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Call to Action Text</label>
                            <input 
                              type="text"
                              value={sponsorshipForm.cta}
                              onChange={(e) => setSponsorshipForm(prev => ({ ...prev, cta: e.target.value }))}
                              className="w-full bg-muted/50 border border-border rounded-[10px] px-4 py-4 text-[10px] font-bold text-foreground"
                            />
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] text-[12px] font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20"
                      >
                        Submit Sponsorship Pitch
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "royalties" && (
            <div className="space-y-4">
              {" "}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {" "}
                <div className="lg:col-span-2 space-y-4">
                  {" "}
                  <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[10px] p-4 relative overflow-hidden shadow-2xl shadow-neutral-600/20">
                    {" "}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <img src={TJ_COIN_ICON} className="h-32 w-32" />
                    </div>{" "}
                    <div className="relative z-10">
                      {" "}
                      <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.4em] mb-4">
                        Available for Withdrawal
                      </p>{" "}
                      <h2 className="text-[44px] font-bold text-foreground tracking-tighter mb-4">
                        {artistData.earnings?.total} TON
                      </h2>{" "}
                      <div className="flex gap-4">
                        {" "}
                        <button onClick={() => setIsWithdrawModalOpen(true)} className="px-4 py-4 bg-foreground text-background rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                          {" "}
                          Withdraw to Wallet{" "}
                        </button>{" "}
                        <button onClick={() => setActiveTab('transactions')} className="px-4 py-4 bg-background/20 backdrop-blur-md text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-background/30 transition-all">
                          {" "}
                          View Ledger{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                    <div className="glass border border-border bg-white rounded-[10px] p-4 relative overflow-hidden">
                    {" "}
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Radio className="h-16 w-16 text-blue-400" />
                    </div>{" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                      Royalty Configuration
                    </h3>{" "}
                    <div className="space-y-4">
                      {artistData.royaltyConfig ? (
                        <>
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">Streaming Splits</span>
                            {artistData.royaltyConfig.streamingSplits.map((split) => (
                              <div key={`${split.address}-${split.label || 'no-label'}`} className="flex justify-between items-center bg-muted/50 p-4 rounded-[6px]">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-foreground uppercase">{split.label || 'Recipient'}</span>
                                  <span className="text-[7px] font-mono text-muted-foreground/50">{split.address ? `${split.address.slice(0, 12)}...` : 'Unknown'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{(split.percentage * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-4 pt-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">NFT Secondary Splits</span>
                            {artistData.royaltyConfig.nftSaleSplits.map((split) => (
                              <div key={`${split.address}-${split.label || 'no-label'}`} className="flex justify-between items-center bg-muted/50 p-4 rounded-[6px]">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-foreground uppercase">{split.label || 'Recipient'}</span>
                                  <span className="text-[7px] font-mono text-muted-foreground/50">{split.address ? `${split.address.slice(0, 12)}...` : 'Unknown'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{(split.percentage * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">No royalty config set.</p>
                      )}
                      <button 
                        onClick={() => setIsRoyaltyModalOpen(true)}
                        className="w-full mt-4 py-4 bg-muted/50 border border-border rounded-[6px] text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:bg-muted transition-all"
                      >
                        Edit Configuration
                      </button>
                    </div>
                  </div>
                  <div className="glass border border-border bg-white rounded-[10px] p-4 relative overflow-hidden">
                    {" "}
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Radio className="h-16 w-16 text-blue-400" />
                    </div>{" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                      Automated Distribution Protocol
                    </h3>{" "}
                    <div className="space-y-4 relative z-10">
                      {" "}
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                          {" "}
                          <Code2 className="h-4 w-4" />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-[11px] font-bold text-foreground uppercase mb-4">
                            Streaming Revenue (10% Platform Fee)
                          </p>{" "}
                          <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                            {" "}
                            Every time a user plays your track, a
                            micro-transaction is triggered on the TON
                            blockchain. 10% platform fee is deducted, and the 
                            remaining 90% is instantly routed to your wallet address.{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                          {" "}
                          <Link2 className="h-4 w-4" />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-[11px] font-bold text-foreground uppercase mb-4">
                            NFT Secondary Sales (10% Platform Fee)
                          </p>{" "}
                          <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                            {" "}
                            TonJam music NFTs are governed by the Royalty Engine. 
                            For every transaction, a 10% fee is collected (5% from buyer, 5% from seller). 
                            The artist receives the full listing price minus the 5% seller fee.{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Revenue Chart */}
                  <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] overflow-hidden mb-4">
                     <ChartRevenue />
                  </div>

                  <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                    {" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                      Transaction Ledger (Auditable)
                    </h3>{" "}
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className="pb-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Type</th>
                            <th className="pb-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Asset</th>
                            <th className="pb-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Amount</th>
                            <th className="pb-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Fee (10%)</th>
                            <th className="pb-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Net Share</th>
                            <th className="pb-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.filter(tx => tx.recipientAddress === artistData.walletAddress).length > 0 ? (
                            transactions.filter(tx => tx.recipientAddress === artistData.walletAddress).map((tx) => (
                              <tr key={tx.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                                <td className="py-4">
                                  <span className={`text-[8px] font-bold uppercase px-4 py-4 rounded-[5px] ${tx.type === 'stream' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    {(tx.type || 'transaction').replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-4">
                                  <p className="text-[10px] font-bold text-foreground uppercase truncate max-w-[120px]">{tx.trackTitle || 'Unknown Asset'}</p>
                                  <p className="text-[7px] text-muted-foreground/50 font-mono">{tx.txHash?.slice(0, 10)}...</p>
                                </td>
                                <td className="py-4 text-[10px] font-mono text-foreground">{tx.amount} TON</td>
                                <td className="py-4 text-[10px] font-mono text-red-500/60">-{tx.platformFee}</td>
                                <td className="py-4 text-[10px] font-mono text-green-400">+{tx.artistShare}</td>
                                <td className="py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Verified</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-4 text-center">
                                <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em]">No transactions recorded in this epoch.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>{" "}
                </div>{" "}
                <div className="space-y-4">
                  {" "}
                  <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                    {" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                      Earnings Breakdown
                    </h3>{" "}
                    <div className="space-y-4">
                      {" "}
                      <div className="flex justify-between items-center">
                        {" "}
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                          Streaming
                        </span>{" "}
                        <span className="text-xs font-bold text-foreground">
                          {artistData.earnings?.streaming} TON
                        </span>{" "}
                      </div>{" "}
                      <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                        {" "}
                        <div
                          className="bg-blue-600 h-full"
                          style={{ width: "35%" }}
                        ></div>{" "}
                      </div>{" "}
                      <div className="flex justify-between items-center">
                        {" "}
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                          NFT Sales
                        </span>{" "}
                        <span className="text-xs font-bold text-foreground">
                          {artistData.earnings?.nftSales} TON
                        </span>{" "}
                      </div>{" "}
                      <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                        {" "}
                        <div
                          className="bg-purple-600 h-full"
                          style={{ width: "65%" }}
                        ></div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="p-4 bg-blue-600/10 border-neutral-500/20 rounded-[10px]">
                    {" "}
                    <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-4">
                      Smart Contract Status
                    </h4>{" "}
                    <div className="flex items-center gap-4 mb-4">
                      {" "}
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
                      <span className="text-[10px] font-bold text-foreground uppercase flex items-center gap-4">
                        <CheckCircle2 className="h-3 w-3" /> Royalty Engine Online
                      </span>{" "}
                    </div>{" "}
                    <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                      {" "}
                      Your unique royalty distribution protocol is deployed on
                      TON. All payments are processed instantly via smart
                      contract.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto">
              {" "}
              <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                {" "}
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                  Identity Configuration
                </h3>{" "}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {" "}
                  <div className="space-y-4">
                    {" "}
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      Artist Bio
                    </label>{" "}
                    <textarea
                      defaultValue={artistData.bio}
                      className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all min-h-[150px]"
                      placeholder="Tell your story..."
                    />{" "}
                  </div>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {" "}
                    <div className="space-y-4">
                      {" "}
                      <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        X (Twitter)
                      </label>{" "}
                      <input
                        type="text"
                        defaultValue={artistData.socials?.x}
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                      />{" "}
                    </div>{" "}
                    <div className="space-y-4">
                      {" "}
                      <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        Instagram
                      </label>{" "}
                      <input
                        type="text"
                        defaultValue={artistData.socials?.instagram}
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-4">
                    {" "}
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      Website
                    </label>{" "}
                    <input
                      type="text"
                      defaultValue={artistData.socials?.website}
                      className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                    />{" "}
                  </div>{" "}
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                  >
                    {" "}
                    Save Changes{" "}
                  </button>{" "}
                </form>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {activeTab === "community" && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                    Post Announcement
                  </h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const textarea = form.querySelector('textarea');
                      if (textarea && textarea.value.trim()) {
                        createPost({
                          id: `post-${Date.now()}`,
                          authorId: artistData.uid,
                          authorName: artistData.name,
                          authorAvatar: artistData.avatarUrl,
                          content: textarea.value,
                          createdAt: new Date().toISOString(),
                          likes: 0,
                          comments: 0,
                          reposts: 0
                        });
                        addNotification("Announcement posted successfully!", "success");
                        form.reset();
                      }
                    }} 
                    className="space-y-4"
                  >
                    <textarea
                      className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px]"
                      placeholder="Share updates, exclusive content, or announcements with your followers..."
                      required
                    />
                    <div className="flex justify-between items-center">
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Upload className="h-4 w-4" />
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>

                <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                    Recent Posts
                  </h3>
                  {artistPosts.length > 0 ? (
                    <div className="space-y-4">
                      {artistPosts.map(post => (
                        <div key={post.id} className="p-4 bg-foreground/[0.03] rounded-[10px] border border-border/50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <img src={post.authorAvatar || artistData.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-xs font-bold text-foreground uppercase">{post.authorName || artistData.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{post.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-xs">No recent announcements.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">
                  Direct Messages
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-600/10 rounded-[8px] border border-blue-600/20 cursor-pointer">
                    <p className="text-xs font-bold text-foreground">Fan_123</p>
                    <p className="text-[10px] text-muted-foreground truncate">Loved the new track!</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-[8px] border border-border/50 cursor-pointer hover:bg-muted/50">
                    <p className="text-xs font-bold text-foreground">Collector_99</p>
                    <p className="text-[10px] text-muted-foreground truncate">When is the next NFT drop?</p>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400">
                  View All Messages
                </button>
              </div>
            </div>
          )}
        </div>{" "}
      </div>{" "}
      {/* Withdraw Confirmation Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={() => setIsWithdrawModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-[20px] font-bold text-foreground tracking-tighter uppercase mb-4">
              Confirm Withdrawal
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">
              Review the details before broadcasting to the network.
            </p>
            
            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center p-4 bg-foreground/[0.03] rounded-[10px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</span>
                <span className="text-lg font-bold text-foreground tracking-tighter">{artistData.earnings?.total} TON</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-foreground/[0.03] rounded-[10px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Fee</span>
                <span className="text-lg font-bold text-foreground tracking-tighter">~0.05 TON</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                disabled={isWithdrawing}
                className="flex-1 py-4 bg-muted/50 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isWithdrawing || !artistData.earnings?.total || Number(artistData.earnings.total) <= 0}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                {isWithdrawing ? 'Processing...' : 'Confirm & Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upload Modal */}{" "}
      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {" "}
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={() => setIsUploading(false)}
          ></div>{" "}
          <div className="relative w-full max-w-4xl glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-4 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            {" "}
            <h2 className="text-[20px] font-bold text-foreground tracking-tighter uppercase mb-4">
              Forge New Frequency
            </h2>{" "}
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">
              Upload your music to the TON network
            </p>{" "}
            <form onSubmit={handleUploadTrack} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-4">
                    <Info className="h-3 w-3" /> Cover Art (1:1 Ratio)
                  </label>
                  <div 
                    onClick={() => !coverFile && coverInputRef.current?.click()}
                    className={`w-full aspect-square border-2 border-dashed border-border rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500/50 hover:bg-foreground/[0.02] transition-all group relative overflow-hidden ${coverFile ? 'border-neutral-500/50' : ''}`}
                  >
                    <input 
                      type="file" 
                      ref={coverInputRef} 
                      onChange={handleCoverFileChange} 
                      accept={ALLOWED_IMAGE_TYPES.join(',')} 
                      className="hidden" 
                    />
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} className="w-full h-full object-cover rounded-[8px]" alt="Cover Preview" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}
                            className="px-4 py-4 bg-red-500 text-white text-[10px] font-bold uppercase rounded-[5px] hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Plus className="h-8 w-8 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-bold text-muted-foreground/50 group-hover:text-foreground transition-colors uppercase tracking-widest">Select Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-4">
                    <Music className="h-3 w-3" /> Audio Artifact (MP3/WAV)
                  </label>
                  <div 
                    onClick={() => !audioFile && audioInputRef.current?.click()}
                    className={`w-full aspect-square border-2 border-dashed border-border rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500/50 hover:bg-foreground/[0.02] transition-all group relative ${audioFile ? 'border-neutral-500/50' : ''}`}
                  >
                    <input 
                      type="file" 
                      ref={audioInputRef} 
                      onChange={handleAudioFileChange} 
                      accept={ALLOWED_AUDIO_TYPES.join(',')} 
                      className="hidden" 
                    />
                    {audioFile ? (
                      <div className="flex flex-col items-center text-center gap-4 p-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                          <FileAudio className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-foreground uppercase tracking-widest line-clamp-1">{audioFile.name}</p>
                          <p className="text-[10px] text-muted-foreground">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                          className="px-4 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase rounded-[5px]"
                        >
                          Clear File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Upload className="h-8 w-8 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-bold text-muted-foreground/50 group-hover:text-foreground transition-colors uppercase tracking-widest">Select Audio</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Uploading Artifact</span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="p-4 bg-blue-500/10 border border-neutral-500/20 rounded-[10px] flex items-center gap-4 animate-pulse">
                  <LoadingSpinner size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Analyzing Frequency...</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Detecting Genre, BPM, and Key via Neural Engine</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {" "}
                <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                  Track Title
                </label>{" "}
                <input
                  type="text"
                  value={newTrack.title}
                  onChange={(e) =>
                    setNewTrack({ ...newTrack, title: e.target.value })
                  }
                  className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                  placeholder="Enter track name..."
                  required
                />{" "}
              </div>{" "}
              <div className="space-y-4">
                {" "}
                <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                  Description
                </label>{" "}
                <textarea
                  value={newTrack.description}
                  onChange={(e) =>
                    setNewTrack({ ...newTrack, description: e.target.value })
                  }
                  className="w-full bg-foreground/[0.03] border border-border rounded-[10px] p-4 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all min-h-[100px] resize-none"
                  placeholder="Enter track transmission details..."
                />{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-4">
                {" "}
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Genre
                  </label>
                  <div className="relative">
                    <select
                      value={newTrack.genre}
                      onChange={(e) =>
                        setNewTrack({ ...newTrack, genre: e.target.value })
                      }
                      className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all appearance-none"
                    >
                      <option value="Electronic">Electronic</option>
                      <option value="Techno">Techno</option>
                      <option value="Ambient">Ambient</option>
                      <option value="Synthwave">Synthwave</option>
                      <option value="Pop">Pop</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Music2 className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    BPM / Key
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={newTrack.bpm || ''}
                        onChange={(e) => setNewTrack({ ...newTrack, bpm: parseInt(e.target.value) || 0 })}
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 pl-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                        placeholder="BPM"
                      />
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={newTrack.key}
                        onChange={(e) => setNewTrack({ ...newTrack, key: e.target.value })}
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 pl-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                        placeholder="Key"
                      />
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Streaming Price (TON)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTrack.streamingPrice || ''}
                    onChange={(e) =>
                      setNewTrack({ ...newTrack, streamingPrice: e.target.value })
                    }
                    className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-4">
                  {" "}
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Release Type
                  </label>{" "}
                  <div className="flex gap-4">
                    {" "}
                    <button
                      type="button"
                      onClick={() => setNewTrack({ ...newTrack, isNFT: false })}
                      className={`flex-1 py-4 rounded-[10px] text-[8px] font-bold uppercase tracking-widest transition-all ${!newTrack.isNFT ? "bg-blue-600 -blue-500 text-foreground" : "bg-muted/50 text-muted-foreground"}`}
                    >
                      {" "}
                      Streaming{" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => setNewTrack({ ...newTrack, isNFT: true })}
                      className={`flex-1 py-4 rounded-[10px] text-[8px] font-bold uppercase tracking-widest transition-all ${newTrack.isNFT ? "bg-amber-500 -amber-500 text-background" : "bg-muted/50 text-muted-foreground"}`}
                    >
                      {" "}
                      NFT Asset{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {newTrack.isNFT && (
                <div className="space-y-6 animate-in slide-in-from-top-2 p-4 bg-amber-500/5 border border-amber-500/20 rounded-[15px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest">
                        Mint Price (TON)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newTrack.price}
                        onChange={(e) =>
                          setNewTrack({ ...newTrack, price: e.target.value })
                        }
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest">
                        Total Editions
                      </label>
                      <input
                        type="number"
                        value={newTrack.editions}
                        onChange={(e) =>
                          setNewTrack({ ...newTrack, editions: e.target.value })
                        }
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest">
                        Royalty Splits
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewTrack({
                          ...newTrack,
                          royaltySplits: [...newTrack.royaltySplits, { address: "", percentage: 0 }]
                        })}
                        className="text-[8px] font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add Split
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {newTrack.royaltySplits.map((split, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Wallet Address"
                              value={split.address}
                              onChange={(e) => {
                                const newSplits = [...newTrack.royaltySplits];
                                newSplits[index].address = e.target.value;
                                setNewTrack({ ...newTrack, royaltySplits: newSplits });
                              }}
                              className="w-full bg-foreground/[0.03] rounded-[8px] p-3 text-[11px] text-foreground outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                            />
                          </div>
                          <div className="w-24">
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="%"
                                value={split.percentage}
                                onChange={(e) => {
                                  const newSplits = [...newTrack.royaltySplits];
                                  newSplits[index].percentage = parseInt(e.target.value) || 0;
                                  setNewTrack({ ...newTrack, royaltySplits: newSplits });
                                }}
                                className="w-full bg-foreground/[0.03] rounded-[8px] p-3 pr-8 text-[11px] text-foreground outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                            </div>
                          </div>
                          {newTrack.royaltySplits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newSplits = newTrack.royaltySplits.filter((_, i) => i !== index);
                                setNewTrack({ ...newTrack, royaltySplits: newSplits });
                              }}
                              className="p-3 text-red-500/50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total Percentage</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        newTrack.royaltySplits.reduce((sum, s) => sum + s.percentage, 0) === 100 
                          ? "text-green-500" 
                          : "text-amber-500"
                      }`}>
                        {newTrack.royaltySplits.reduce((sum, s) => sum + s.percentage, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-4 flex gap-4">
                {" "}
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="flex-1 py-4 bg-muted/50 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                >
                  {" "}
                  Cancel{" "}
                </button>{" "}
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                >
                  {" "}
                  Broadcast Track{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
      
      <RoyaltyConfigModal 
        isOpen={isRoyaltyModalOpen}
        onClose={() => setIsRoyaltyModalOpen(false)}
        artist={artistData}
      />

      <ConfirmationModal
        isOpen={!!trackToDelete}
        onClose={() => setTrackToDelete(null)}
        onConfirm={() => {
          if (trackToDelete) {
            deleteTrack(trackToDelete.id);
            addNotification(`Track "${trackToDelete.title}" deleted.`, "success");
            setTrackToDelete(null);
          }
        }}
        title="Delete Track?"
        description={`Are you sure you want to delete "${trackToDelete?.title}"? This action cannot be undone and will remove the track from all playlists and the global catalog.`}
        confirmText="Delete Track"
        variant="destructive"
      />
    </div>
  );
};
export default ArtistDashboard;

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Key
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
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

const ArtistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification, userProfile, transactions, artists, addUserNFT, searchQuery } = useAudio();
  
  useEffect(() => {
    if (!userProfile.isVerifiedArtist) {
      addNotification("Access Denied: Artist verification required.", "error");
      navigate('/');
    }
  }, [userProfile.isVerifiedArtist, navigate, addNotification]);

  /* Find the artist profile for the current user (mocking that MOCK_USER is Neon Voyager for this demo) */ 
  const currentArtist = useMemo(() => {
    return artists.find((a) => a.name === userProfile.name) || artists[0];
  }, [artists, userProfile.name]);

  const artistData = currentArtist;

  const [tracks, setTracks] = useState<Track[]>(() =>
    MOCK_TRACKS.filter((t) => t.artistId === artistData.id),
  );

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return tracks;
    return tracks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tracks, searchQuery]);

  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "royalties" | "profile" | "forge" | "collection" | "verification" | "transactions">("overview");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'tracks', 'royalties', 'profile', 'forge', 'collection'].includes(tab)) {
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

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRoyaltyModalOpen, setIsRoyaltyModalOpen] = useState(false);
  /* Form states */ const [newTrack, setNewTrack] = useState({
    title: "",
    genre: "Electronic",
    isNFT: false,
    price: "1.0",
    bpm: 0,
    key: "",
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
        model: "gemini-2.5-flash-preview-12-2025",
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
      setAudioFile(file);
      analyzeAudio(file);
    }
  };
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification("Artist profile updated successfully.", "success");
  };

  const handleUploadTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrack.title || !audioFile || !coverFile) return;
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      const track: Track = {
        id: `t-${Date.now()}`,
        title: newTrack.title,
        artist: artistData.name,
        artistId: artistData.id,
        coverUrl: `https://picsum.photos/400/400?seed=${Date.now()}`,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 180,
        genre: newTrack.genre,
        bpm: newTrack.bpm,
        key: newTrack.key,
        isNFT: newTrack.isNFT,
        price: newTrack.isNFT ? newTrack.price : undefined,
        playCount: 0,
        likes: 0,
        releaseDate: new Date().toISOString().split("T")[0],
      };
      setTracks([track, ...tracks]);
      setIsUploading(false);
      setAudioFile(null);
      setCoverFile(null);
      setUploadProgress(0);
      setNewTrack({ title: "", genre: "Electronic", isNFT: false, price: "1.0", bpm: 0, key: "" });
      addNotification("Track broadcasted to the network.", "success");
    }, 2000);
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
    <div className="glass bg-foreground/[0.02] rounded-[10px] p-6 transition-all group">
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
          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-[10px]">
            {" "}
            {trend}{" "}
          </span>
        )}{" "}
      </div>{" "}
      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em] mb-1">
        {label}
      </p>{" "}
      <h3 className="text-2xl font-bold text-foreground tracking-tighter">
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
    <div className="w-full px-0 sm:px-6 lg:px-10 pb-0 sm:pb-8">
      {" "}
      <div className="w-full">
        {" "}
        {/* Header Section */}{" "}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          {" "}
          <div>
            {" "}
            <div className="flex items-center gap-3 mb-2">
              {" "}
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>{" "}
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.5em]">
                Artist Command Center
              </span>{" "}
            </div>{" "}
            <h1 className="text-4xl font-bold text-foreground tracking-tighter uppercase">
              Dashboard
            </h1>{" "}
          </div>{" "}
          <div className="flex items-center gap-4">
            {" "}
            <button
              onClick={() => setIsUploading(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-neutral-600/20"
            >
              {" "}
              <Plus className="h-4 w-4" /> Upload Track{" "}
            </button>{" "}
            <button
              onClick={() => navigate(`/artist/${artistData.id}`)}
              className="px-6 py-3 bg-muted/50 hover:bg-muted text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              {" "}
              View Public Profile{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Navigation Tabs */}{" "}
        <div className="flex gap-8 -b mb-10 overflow-x-auto no-scrollbar">
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
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-3 transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-blue-500" : "text-neutral-500 hover:text-neutral-400"}`}
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
            <div className="space-y-10">
              {" "}
              <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                <div className="min-w-[240px] flex-1">
                  <StatCard
                    label="Total Streams"
                    value={tracks
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
                    value={artistData.earnings?.nftSales || "0"}
                    icon="fa-gem"
                  />
                </div>
              </div>{" "}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Performance Analytics */}
                <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-8">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-8">
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
                <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-8">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-8">
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
                <div className="glass bg-foreground/[0.02] rounded-[5px] p-8">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-8">
                    Top Tracks
                  </h3>
                  <div className="flex flex-col gap-4 pb-4 no-scrollbar">
                    {tracks.slice(0, 3).map((track) => (
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
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-tighter">Your NFT Collection</h2>
                <button 
                  onClick={() => setActiveTab('forge')}
                  className="px-4 py-2 bg-neutral-600/10 rounded-[8px] text-[9px] font-bold text-neutral-500 uppercase tracking-widest hover:bg-neutral-600 hover:text-foreground transition-all"
                >
                  Forge New Protocol
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {MOCK_NFTS.filter(n => n.creator === artistData.name).map(nft => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
                {MOCK_NFTS.filter(n => n.creator === artistData.name).length === 0 && (
                  <div className="col-span-full py-32 text-center bg-muted/50 rounded-[20px]">
                    <Gem className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">No minted protocols in your collection.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tracks" && (
            <div className="space-y-8">
              {" "}
              <div className="flex justify-between items-center">
                {" "}
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Your Catalog
                </h3>{" "}
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                  {tracks.length} Tracks Total
                </span>{" "}
              </div>{" "}
              <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[5px] overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border/50 bg-foreground/[0.02]">
                      <th className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Track</th>
                      <th className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Genre</th>
                      <th className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</th>
                      <th className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Streams</th>
                      <th className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Likes</th>
                      <th className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.map((track) => (
                      <tr key={track.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img src={track.coverUrl} className="w-10 h-10 rounded-[5px] object-cover" alt="" />
                            <div>
                              <p className="text-[11px] font-bold text-foreground uppercase">{track.title}</p>
                              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Released {track.releaseDate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{track.genre}</span>
                        </td>
                        <td className="p-6">
                          {track.isNFT ? (
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase rounded-[5px] border border-amber-500/20">Minted NFT</span>
                          ) : (
                            <span className="px-2 py-1 bg-neutral-500/10 text-neutral-500 text-[8px] font-bold uppercase rounded-[5px] border border-neutral-500/20">Ready to Mint</span>
                          )}
                        </td>
                        <td className="p-6 text-right">
                          <span className="text-[11px] font-mono text-foreground">{(track.playCount || 0).toLocaleString()}</span>
                        </td>
                        <td className="p-6 text-right">
                          <span className="text-[11px] font-mono text-foreground">{(track.likes || 0).toLocaleString()}</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!track.isNFT && (
                              <button 
                                onClick={() => {
                                  navigate('/mint', { state: { track } });
                                }}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-[5px] text-[8px] font-bold uppercase tracking-widest border border-amber-500/20 transition-all"
                              >
                                Mint NFT
                              </button>
                            )}
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
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Transaction History
                </h3>
              </div>
              <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[5px] overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border/50 bg-foreground/[0.02]">
                      <th scope="col" className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Type</th>
                      <th scope="col" className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Amount</th>
                      <th scope="col" className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Timestamp</th>
                      <th scope="col" className="p-6 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(tx => tx.recipientAddress === artistData.walletAddress || tx.senderAddress === artistData.walletAddress).map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                        <td scope="row" className="p-6 text-[10px] font-bold text-foreground uppercase tracking-widest">{tx.type.replace('_', ' ')}</td>
                        <td className="p-6 text-[10px] font-mono text-foreground">{tx.amount} TON</td>
                        <td className="p-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase rounded-[5px] border border-green-500/20">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "royalties" && (
            <div className="space-y-10">
              {" "}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {" "}
                <div className="lg:col-span-2 space-y-10">
                  {" "}
                  <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[10px] p-10 relative overflow-hidden shadow-2xl shadow-neutral-600/20">
                    {" "}
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                      <Coins className="h-24 w-24" />
                    </div>{" "}
                    <div className="relative z-10">
                      {" "}
                      <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.4em] mb-2">
                        Available for Withdrawal
                      </p>{" "}
                      <h2 className="text-5xl font-bold text-foreground tracking-tighter mb-8">
                        {artistData.earnings?.total} TON
                      </h2>{" "}
                      <div className="flex gap-4">
                        {" "}
                        <button onClick={() => setIsWithdrawModalOpen(true)} className="px-8 py-4 bg-foreground text-background rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                          {" "}
                          Withdraw to Wallet{" "}
                        </button>{" "}
                        <button className="px-8 py-4 bg-background/20 backdrop-blur-md text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-background/30 transition-all">
                          {" "}
                          View Ledger{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                    <div className="glass border border-border bg-white rounded-[10px] p-8 relative overflow-hidden">
                    {" "}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Radio className="h-16 w-16 text-blue-400" />
                    </div>{" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">
                      Royalty Configuration
                    </h3>{" "}
                    <div className="space-y-4">
                      {artistData.royaltyConfig ? (
                        <>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Streaming Splits</span>
                            {artistData.royaltyConfig.streamingSplits.map((split, i) => (
                              <div key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-[6px]">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-foreground uppercase">{split.label || 'Recipient'}</span>
                                  <span className="text-[7px] font-mono text-muted-foreground/50">{split.address.slice(0, 12)}...</span>
                                </div>
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{(split.percentage * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2 pt-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">NFT Secondary Splits</span>
                            {artistData.royaltyConfig.nftSaleSplits.map((split, i) => (
                              <div key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-[6px]">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-foreground uppercase">{split.label || 'Recipient'}</span>
                                  <span className="text-[7px] font-mono text-muted-foreground/50">{split.address.slice(0, 12)}...</span>
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
                        className="w-full mt-4 py-3 bg-muted/50 border border-border rounded-[6px] text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:bg-muted transition-all"
                      >
                        Edit Configuration
                      </button>
                    </div>
                  </div>
                  <div className="glass border border-border bg-white rounded-[10px] p-8 relative overflow-hidden">
                    {" "}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Radio className="h-16 w-16 text-blue-400" />
                    </div>{" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">
                      Automated Distribution Protocol
                    </h3>{" "}
                    <div className="space-y-6 relative z-10">
                      {" "}
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                          {" "}
                          <Code2 className="h-4 w-4" />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-[11px] font-bold text-foreground uppercase mb-1">
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
                          <p className="text-[11px] font-bold text-foreground uppercase mb-1">
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
                  <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] overflow-hidden mb-10">
                     <ChartRevenue />
                  </div>

                  <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-8">
                    {" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-8">
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
                                  <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded-[5px] ${tx.type === 'stream' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    {tx.type.replace('_', ' ')}
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
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Verified</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-20 text-center">
                                <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em]">No transactions recorded in this epoch.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>{" "}
                </div>{" "}
                <div className="space-y-6">
                  {" "}
                  <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-8">
                    {" "}
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-8">
                      Earnings Breakdown
                    </h3>{" "}
                    <div className="space-y-6">
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
                  <div className="p-8 bg-blue-600/10 border-neutral-500/20 rounded-[10px]">
                    {" "}
                    <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-4">
                      Smart Contract Status
                    </h4>{" "}
                    <div className="flex items-center gap-3 mb-4">
                      {" "}
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
                      <span className="text-[10px] font-bold text-foreground uppercase flex items-center gap-2">
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
              <div className="glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-10">
                {" "}
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-10">
                  Identity Configuration
                </h3>{" "}
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  {" "}
                  <div className="space-y-3">
                    {" "}
                    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      Artist Bio
                    </label>{" "}
                    <textarea
                      defaultValue={artistData.bio}
                      className="w-full bg-foreground/[0.03] rounded-[10px] p-5 text-sm text-foreground outline-none focus:-blue-500/50 transition-all min-h-[150px]"
                      placeholder="Tell your story..."
                    />{" "}
                  </div>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    <div className="space-y-3">
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
                    <div className="space-y-3">
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
                  <div className="space-y-3">
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
        </div>{" "}
      </div>{" "}
      {/* Withdraw Confirmation Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={() => setIsWithdrawModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-foreground tracking-tighter uppercase mb-2">
              Confirm Withdrawal
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-8">
              Review the details before broadcasting to the network.
            </p>
            
            <div className="space-y-6 mb-10">
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
                className="flex-1 py-4 bg-muted/50 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addNotification("Withdrawal successful! Funds are on the way.", "success");
                  setIsWithdrawModalOpen(false);
                }}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
              >
                Confirm & Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upload Modal */}{" "}
      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {" "}
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={() => setIsUploading(false)}
          ></div>{" "}
          <div className="relative w-full max-w-4xl glass border border-neutral-500/20 bg-foreground/[0.02] rounded-[10px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            {" "}
            <h2 className="text-2xl font-bold text-foreground tracking-tighter uppercase mb-2">
              Forge New Frequency
            </h2>{" "}
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-10">
              Upload your music to the TON network
            </p>{" "}
            <form onSubmit={handleUploadTrack} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Cover Image
                  </label>
                  <div 
                    onClick={() => !coverFile && coverInputRef.current?.click()}
                    className={`w-full border-2 border-dashed border-border rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500/50 hover:bg-foreground/[0.02] transition-all group ${coverFile ? 'h-auto p-4' : 'h-40'}`}
                  >
                    <input 
                      type="file" 
                      ref={coverInputRef} 
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    {coverFile ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-[5px] bg-blue-500/20 flex items-center justify-center text-blue-500">
                             <FileAudio className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{coverFile.name}</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest">{(coverFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setCoverFile(null); }} className="text-xs text-red-400">Clear</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="h-8 w-8 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-bold text-muted-foreground/50 group-hover:text-foreground transition-colors uppercase tracking-widest">Drop cover image or click to browse</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Audio File
                  </label>
                  <div 
                    onClick={() => !audioFile && audioInputRef.current?.click()}
                    className={`w-full border-2 border-dashed border-border rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500/50 hover:bg-foreground/[0.02] transition-all group ${audioFile ? 'h-auto p-4' : 'h-40'}`}
                  >
                    <input 
                      type="file" 
                      ref={audioInputRef} 
                      onChange={handleAudioFileChange} 
                      accept="audio/*" 
                      className="hidden" 
                    />
                    {audioFile ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <FileAudio className="h-8 w-8 text-blue-500" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{audioFile.name}</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} className="text-xs text-red-400">Clear</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="h-8 w-8 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-bold text-muted-foreground/50 group-hover:text-foreground transition-colors uppercase tracking-widest">Drop audio file or click to browse</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              {isAnalyzing && (
                <div className="p-6 bg-blue-500/10 border border-neutral-500/20 rounded-[10px] flex items-center gap-4 animate-pulse">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  <div>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Analyzing Frequency...</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Detecting Genre, BPM, and Key via Neural Engine</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
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
              <div className="grid grid-cols-2 gap-6">
                {" "}
                <div className="space-y-3">
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
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    BPM / Key
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={newTrack.bpm || ''}
                        onChange={(e) => setNewTrack({ ...newTrack, bpm: parseInt(e.target.value) || 0 })}
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 pl-10 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                        placeholder="BPM"
                      />
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={newTrack.key}
                        onChange={(e) => setNewTrack({ ...newTrack, key: e.target.value })}
                        className="w-full bg-foreground/[0.03] rounded-[10px] p-4 pl-10 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                        placeholder="Key"
                      />
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {" "}
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Release Type
                  </label>{" "}
                  <div className="flex gap-2">
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
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  {" "}
                  <label className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Mint Price (TON)
                  </label>{" "}
                  <input
                    type="number"
                    step="0.1"
                    value={newTrack.price}
                    onChange={(e) =>
                      setNewTrack({ ...newTrack, price: e.target.value })
                    }
                    className="w-full bg-foreground/[0.03] rounded-[10px] p-4 text-sm text-foreground outline-none focus:-blue-500/50 transition-all"
                  />{" "}
                </div>
              )}{" "}
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
    </div>
  );
};
export default ArtistDashboard;

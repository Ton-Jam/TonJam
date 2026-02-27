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
  CheckCircle2 
} from 'lucide-react';
import {
  MOCK_USER,
  MOCK_ARTISTS,
  MOCK_TRACKS,
  APP_LOGO,
  TJ_COIN_ICON,
  TON_LOGO,
} from "@/constants";
import { useAudio } from "@/context/AudioContext";
import { Track, Artist } from "@/types";

const ArtistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification, userProfile } = useAudio();
  
  /* Find the artist profile for the current user (mocking that MOCK_USER is Neon Voyager for this demo) */ 
  const [artistData, setArtistData] = useState<Artist>(() => {
    const existing = MOCK_ARTISTS.find((a) => a.name === MOCK_USER.name) || MOCK_ARTISTS[0];
    return {
      ...existing,
      royaltyConfig: existing.royaltyConfig || {
        streamingPercentage: 0.05,
        nftSaleShare: 0.1,
      },
      earnings: existing.earnings || {
        streaming: "45.2",
        nftSales: "120.5",
        total: "165.7",
      },
    };
  });

  const [tracks, setTracks] = useState<Track[]>(() =>
    MOCK_TRACKS.filter((t) => t.artistId === artistData.id),
  );

  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "royalties" | "profile">("overview");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'tracks', 'royalties', 'profile'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [location.search]);

  const [isUploading, setIsUploading] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  /* Form states */ const [newTrack, setNewTrack] = useState({
    title: "",
    genre: "Electronic",
    isNFT: false,
    price: "1.0",
  });
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification("Artist profile updated successfully.", "success");
  };
  const handleUploadTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrack.title) return;
    const track: Track = {
      id: `t-${Date.now()}`,
      title: newTrack.title,
      artist: artistData.name,
      artistId: artistData.id,
      coverUrl: `https://picsum.photos/400/400?seed=${Date.now()}`,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 180,
      genre: newTrack.genre,
      isNFT: newTrack.isNFT,
      price: newTrack.isNFT ? newTrack.price : undefined,
      playCount: 0,
      likes: 0,
      releaseDate: new Date().toISOString().split("T")[0],
    };
    setTracks([track, ...tracks]);
    setIsUploading(false);
    setNewTrack({ title: "", genre: "Electronic", isNFT: false, price: "1.0" });
    addNotification("Track broadcasted to the network.", "success");
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
    <div className="glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-6 transition-all group">
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
      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">
        {label}
      </p>{" "}
      <h3 className="text-2xl font-bold text-white tracking-tighter">
        {value}
      </h3>{" "}
    </div>
  );
  return (
    <div className="min-h-screen bg-black pb-32 pt-24 px-6">
      {" "}
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">
              Dashboard
            </h1>{" "}
          </div>{" "}
          <div className="flex items-center gap-4">
            {" "}
            <button
              onClick={() => setIsUploading(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {" "}
              <Plus className="h-4 w-4" /> Upload Track{" "}
            </button>{" "}
            <button
              onClick={() => navigate(`/artist/${artistData.id}`)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all"
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
            { id: "royalties", label: "Royalties", icon: <Coins className="h-4 w-4" /> },
            { id: "profile", label: "Profile Settings", icon: <UserPen className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-3 transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-blue-500" : "text-white/20 hover:text-white"}`}
            >
              {" "}
              {tab.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {tab.label}
              </span>{" "}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {" "}
                <StatCard
                  label="Total Streams"
                  value={tracks
                    .reduce((acc, t) => acc + (t.playCount || 0), 0)
                    .toLocaleString()}
                  icon="fa-play"
                  trend="+12%"
                />{" "}
                <StatCard
                  label="Followers"
                  value={(artistData.followers || 0).toLocaleString()}
                  icon="fa-users"
                  trend="+5%"
                />{" "}
                <StatCard
                  label="Total Earnings"
                  value={`${artistData.earnings?.total} TON`}
                  icon="fa-wallet"
                />{" "}
                <StatCard
                  label="NFT Sales"
                  value={artistData.earnings?.nftSales || "0"}
                  icon="fa-gem"
                />{" "}
              </div>{" "}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {" "}
                <div className="lg:col-span-2 glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-8">
                  {" "}
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">
                    Recent Performance
                  </h3>{" "}
                  <div className="h-64 flex items-end gap-2">
                    {" "}
                    {[40, 70, 45, 90, 65, 85, 100, 75, 50, 80, 60, 95].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-600/20 rounded-t-lg relative group"
                        >
                          {" "}
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all group-hover:bg-blue-400"
                            style={{ height: `${h}%` }}
                          ></div>{" "}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {" "}
                            {h}k{" "}
                          </div>{" "}
                        </div>
                      ),
                    )}{" "}
                  </div>{" "}
                  <div className="flex justify-between mt-4 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                    {" "}
                    <span>Jan</span> <span>Jun</span> <span>Dec</span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-8">
                  {" "}
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">
                    Top Tracks
                  </h3>{" "}
                  <div className="space-y-6">
                    {" "}
                    {tracks.slice(0, 5).map((track, i) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between group"
                      >
                        {" "}
                        <div className="flex items-center gap-4">
                          {" "}
                          <span className="text-[10px] font-mono text-white/10">
                            {i + 1}
                          </span>{" "}
                          <div>
                            {" "}
                            <p className="text-[11px] font-bold text-white uppercase truncate w-32">
                              {track.title}
                            </p>{" "}
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                              {(track.playCount || 0).toLocaleString()} streams
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                        <div className="text-right">
                          {" "}
                          <p className="text-[10px] font-bold text-blue-500">
                            +{Math.floor(Math.random() * 100)}%
                          </p>{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {activeTab === "tracks" && (
            <div className="space-y-8">
              {" "}
              <div className="flex justify-between items-center">
                {" "}
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                  Your Catalog
                </h3>{" "}
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  {tracks.length} Tracks Total
                </span>{" "}
              </div>{" "}
              <div className="glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] overflow-hidden">
                {" "}
                <table className="w-full text-left -collapse">
                  {" "}
                  <thead>
                    {" "}
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {" "}
                      <th className="p-6 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        Track
                      </th>{" "}
                      <th className="p-6 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        Genre
                      </th>{" "}
                      <th className="p-6 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        Status
                      </th>{" "}
                      <th className="p-6 text-[9px] font-bold text-white/20 uppercase tracking-widest text-right">
                        Streams
                      </th>{" "}
                      <th className="p-6 text-[9px] font-bold text-white/20 uppercase tracking-widest text-right">
                        Likes
                      </th>{" "}
                      <th className="p-6 text-[9px] font-bold text-white/20 uppercase tracking-widest text-right">
                        Actions
                      </th>{" "}
                    </tr>{" "}
                  </thead>{" "}
                  <tbody>
                    {" "}
                    {tracks.map((track) => (
                      <tr
                        key={track.id}
                        className="border-b border-white/5 hover:bg-white/[0.01] transition-colors"
                      >
                        {" "}
                        <td className="p-6">
                          {" "}
                          <div className="flex items-center gap-4">
                            {" "}
                            <img
                              src={track.coverUrl}
                              className="w-10 h-10 rounded-[10px] object-cover"
                              alt=""
                            />{" "}
                            <div>
                              {" "}
                              <p className="text-[11px] font-bold text-white uppercase">
                                {track.title}
                              </p>{" "}
                              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                Released {track.releaseDate}
                              </p>{" "}
                            </div>{" "}
                          </div>{" "}
                        </td>{" "}
                        <td className="p-6">
                          {" "}
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                            {track.genre}
                          </span>{" "}
                        </td>{" "}
                        <td className="p-6">
                          {" "}
                          {track.isNFT ? (
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase rounded-[10px] border border-amber-500/20">
                              Minted NFT
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[8px] font-bold uppercase rounded-[10px] border border-blue-500/20">
                              Ready to Mint
                            </span>
                          )}{" "}
                        </td>{" "}
                        <td className="p-6 text-right">
                          {" "}
                          <span className="text-[11px] font-mono text-white">
                            {(track.playCount || 0).toLocaleString()}
                          </span>{" "}
                        </td>{" "}
                        <td className="p-6 text-right">
                          {" "}
                          <span className="text-[11px] font-mono text-white">
                            {(track.likes || 0).toLocaleString()}
                          </span>{" "}
                        </td>{" "}
                        <td className="p-6 text-right">
                          {" "}
                          <div className="flex items-center justify-end gap-2">
                            {" "}
                            {!track.isNFT && (
                              <button
                                onClick={() => {
                                  /* In a real app, this would open a minting modal */ const updatedTracks =
                                    tracks.map((t) =>
                                      t.id === track.id
                                        ? { ...t, isNFT: true, price: "1.0" }
                                        : t,
                                    );
                                  setTracks(updatedTracks);
                                  addNotification(
                                    "Track successfully minted as NFT",
                                    "success",
                                  );
                                }}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-[10px] text-[8px] font-bold uppercase tracking-widest border border-amber-500/20 transition-all"
                              >
                                {" "}
                                Mint NFT{" "}
                              </button>
                            )}{" "}
                            <button className="text-white/20 hover:text-white transition-colors">
                              {" "}
                              <Ellipsis className="h-4 w-4" />{" "}
                            </button>{" "}
                          </div>{" "}
                        </td>{" "}
                      </tr>
                    ))}{" "}
                  </tbody>{" "}
                </table>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {activeTab === "royalties" && (
            <div className="space-y-10">
              {" "}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {" "}
                <div className="lg:col-span-2 space-y-10">
                  {" "}
                  <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[10px] p-10 relative overflow-hidden shadow-2xl shadow-blue-600/20">
                    {" "}
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                      <Coins className="h-24 w-24" />
                    </div>{" "}
                    <div className="relative z-10">
                      {" "}
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.4em] mb-2">
                        Available for Withdrawal
                      </p>{" "}
                      <h2 className="text-5xl font-bold text-white tracking-tighter mb-8">
                        {artistData.earnings?.total} TON
                      </h2>{" "}
                      <div className="flex gap-4">
                        {" "}
                        <button onClick={() => setIsWithdrawModalOpen(true)} className="px-8 py-4 bg-white text-black rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                          {" "}
                          Withdraw to Wallet{" "}
                        </button>{" "}
                        <button className="px-8 py-4 bg-black/20 backdrop-blur-md text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-black/30 transition-all">
                          {" "}
                          View Ledger{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="glass border border-blue-500/10 bg-[#0a0a2a]/40 -blue-500/20 rounded-[10px] p-8 relative overflow-hidden">
                    {" "}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Radio className="h-16 w-16 text-blue-400" />
                    </div>{" "}
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">
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
                          <p className="text-[11px] font-bold text-white uppercase mb-1">
                            Streaming Revenue (5%)
                          </p>{" "}
                          <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
                            {" "}
                            Every time a user plays your track, a
                            micro-transaction is triggered on the TON
                            blockchain. 5% of the platform's streaming pool is
                            instantly routed to your wallet address.{" "}
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
                          <p className="text-[11px] font-bold text-white uppercase mb-1">
                            NFT Secondary Sales (10%)
                          </p>{" "}
                          <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
                            {" "}
                            Your music NFTs are minted with a permanent royalty
                            tag. When a collector resells your asset on the
                            marketplace, 10% of the sale price is automatically
                            deducted and sent to your creator balance.{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-8">
                    {" "}
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">
                      Royalty Configuration
                    </h3>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {" "}
                      <div className="p-6 bg-white/[0.02] rounded-[10px]">
                        {" "}
                        <div className="flex items-center gap-3 mb-4">
                          {" "}
                          <Radio className="h-4 w-4 text-blue-500" />{" "}
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">
                            Streaming Share
                          </h4>{" "}
                        </div>{" "}
                        <p className="text-2xl font-bold text-white mb-2">
                          {(artistData.royaltyConfig?.streamingPercentage ||
                            0) * 100}
                          %
                        </p>{" "}
                        <p className="text-[9px] text-white/20 leading-relaxed uppercase tracking-widest">
                          Automatic distribution from every stream on the
                          network.
                        </p>{" "}
                      </div>{" "}
                      <div className="p-6 bg-white/[0.02] rounded-[10px]">
                        {" "}
                        <div className="flex items-center gap-3 mb-4">
                          {" "}
                          <Gem className="h-4 w-4 text-amber-500" />{" "}
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">
                            NFT Secondary Share
                          </h4>{" "}
                        </div>{" "}
                        <p className="text-2xl font-bold text-white mb-2">
                          {(artistData.royaltyConfig?.nftSaleShare || 0) * 100}%
                        </p>{" "}
                        <p className="text-[9px] text-white/20 leading-relaxed uppercase tracking-widest">
                          Perpetual royalty from every secondary marketplace
                          sale.
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-6">
                  {" "}
                  <div className="glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-8">
                    {" "}
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">
                      Earnings Breakdown
                    </h3>{" "}
                    <div className="space-y-6">
                      {" "}
                      <div className="flex justify-between items-center">
                        {" "}
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          Streaming
                        </span>{" "}
                        <span className="text-xs font-bold text-white">
                          {artistData.earnings?.streaming} TON
                        </span>{" "}
                      </div>{" "}
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        {" "}
                        <div
                          className="bg-blue-600 h-full"
                          style={{ width: "35%" }}
                        ></div>{" "}
                      </div>{" "}
                      <div className="flex justify-between items-center">
                        {" "}
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          NFT Sales
                        </span>{" "}
                        <span className="text-xs font-bold text-white">
                          {artistData.earnings?.nftSales} TON
                        </span>{" "}
                      </div>{" "}
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        {" "}
                        <div
                          className="bg-purple-600 h-full"
                          style={{ width: "65%" }}
                        ></div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="p-8 bg-blue-600/10 -blue-500/20 rounded-[10px]">
                    {" "}
                    <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-4">
                      Smart Contract Status
                    </h4>{" "}
                    <div className="flex items-center gap-3 mb-4">
                      {" "}
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
                      <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Royalty Engine Online
                      </span>{" "}
                    </div>{" "}
                    <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
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
              <div className="glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-10">
                {" "}
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-10">
                  Identity Configuration
                </h3>{" "}
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  {" "}
                  <div className="space-y-3">
                    {" "}
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      Artist Bio
                    </label>{" "}
                    <textarea
                      defaultValue={artistData.bio}
                      className="w-full bg-white/[0.03] rounded-[10px] p-5 text-sm text-white outline-none focus:-blue-500/50 transition-all min-h-[150px]"
                      placeholder="Tell your story..."
                    />{" "}
                  </div>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    <div className="space-y-3">
                      {" "}
                      <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        X (Twitter)
                      </label>{" "}
                      <input
                        type="text"
                        defaultValue={artistData.socials?.x}
                        className="w-full bg-white/[0.03] rounded-[10px] p-4 text-sm text-white outline-none focus:-blue-500/50 transition-all"
                      />{" "}
                    </div>{" "}
                    <div className="space-y-3">
                      {" "}
                      <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        Instagram
                      </label>{" "}
                      <input
                        type="text"
                        defaultValue={artistData.socials?.instagram}
                        className="w-full bg-white/[0.03] rounded-[10px] p-4 text-sm text-white outline-none focus:-blue-500/50 transition-all"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-3">
                    {" "}
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      Website
                    </label>{" "}
                    <input
                      type="text"
                      defaultValue={artistData.socials?.website}
                      className="w-full bg-white/[0.03] rounded-[10px] p-4 text-sm text-white outline-none focus:-blue-500/50 transition-all"
                    />{" "}
                  </div>{" "}
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
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
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsWithdrawModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white tracking-tighter uppercase mb-2">
              Confirm Withdrawal
            </h2>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-8">
              Review the details before broadcasting to the network.
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center p-4 bg-white/[0.03] rounded-[10px]">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Amount</span>
                <span className="text-lg font-bold text-white tracking-tighter">{artistData.earnings?.total} TON</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/[0.03] rounded-[10px]">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Network Fee</span>
                <span className="text-lg font-bold text-white tracking-tighter">~0.05 TON</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 py-4 bg-white/5 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addNotification("Withdrawal successful! Funds are on the way.", "success");
                  setIsWithdrawModalOpen(false);
                }}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
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
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsUploading(false)}
          ></div>{" "}
          <div className="relative w-full max-w-xl glass border border-blue-500/10 bg-white/[0.02] rounded-[10px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            {" "}
            <h2 className="text-2xl font-bold text-white tracking-tighter uppercase mb-2">
              Forge New Frequency
            </h2>{" "}
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-10">
              Upload your music to the TON network
            </p>{" "}
            <form onSubmit={handleUploadTrack} className="space-y-8">
              {" "}
              <div className="space-y-3">
                {" "}
                <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  Track Title
                </label>{" "}
                <input
                  type="text"
                  value={newTrack.title}
                  onChange={(e) =>
                    setNewTrack({ ...newTrack, title: e.target.value })
                  }
                  className="w-full bg-white/[0.03] rounded-[10px] p-4 text-sm text-white outline-none focus:-blue-500/50 transition-all"
                  placeholder="Enter track name..."
                  required
                />{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-6">
                {" "}
                <div className="space-y-3">
                  {" "}
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    Genre
                  </label>{" "}
                  <select
                    value={newTrack.genre}
                    onChange={(e) =>
                      setNewTrack({ ...newTrack, genre: e.target.value })
                    }
                    className="w-full bg-white/[0.03] rounded-[10px] p-4 text-sm text-white outline-none focus:-blue-500/50 transition-all appearance-none"
                  >
                    {" "}
                    <option value="Electronic">Electronic</option>{" "}
                    <option value="Techno">Techno</option>{" "}
                    <option value="Ambient">Ambient</option>{" "}
                    <option value="Synthwave">Synthwave</option>{" "}
                    <option value="Pop">Pop</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div className="space-y-3">
                  {" "}
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    Release Type
                  </label>{" "}
                  <div className="flex gap-2">
                    {" "}
                    <button
                      type="button"
                      onClick={() => setNewTrack({ ...newTrack, isNFT: false })}
                      className={`flex-1 py-4 rounded-[10px] text-[8px] font-bold uppercase tracking-widest transition-all ${!newTrack.isNFT ? "bg-blue-600 -blue-500 text-white" : "bg-white/5 text-white/40"}`}
                    >
                      {" "}
                      Streaming{" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => setNewTrack({ ...newTrack, isNFT: true })}
                      className={`flex-1 py-4 rounded-[10px] text-[8px] font-bold uppercase tracking-widest transition-all ${newTrack.isNFT ? "bg-amber-500 -amber-500 text-black" : "bg-white/5 text-white/40"}`}
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
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    Mint Price (TON)
                  </label>{" "}
                  <input
                    type="number"
                    step="0.1"
                    value={newTrack.price}
                    onChange={(e) =>
                      setNewTrack({ ...newTrack, price: e.target.value })
                    }
                    className="w-full bg-white/[0.03] rounded-[10px] p-4 text-sm text-white outline-none focus:-blue-500/50 transition-all"
                  />{" "}
                </div>
              )}{" "}
              <div className="pt-4 flex gap-4">
                {" "}
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="flex-1 py-4 bg-white/5 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {" "}
                  Cancel{" "}
                </button>{" "}
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                >
                  {" "}
                  Broadcast Track{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
export default ArtistDashboard;

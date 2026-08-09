import React, { useState } from "react";
import { 
  Heart, 
  KeyRound, 
  MessageSquare, 
  Crown, 
  Sparkles, 
  Trophy, 
  Zap, 
  ShieldCheck, 
  Search,
  ChevronRight,
  Send,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/contexts/AudioContext";
import { Artist } from "@/types";
import { MOCK_ARTISTS, TON_LOGO, TJ_COIN_ICON } from "@/constants";
import ArtistTippingModal from "@/components/fan/ArtistTippingModal";
import TokenGatedVault from "@/components/fan/TokenGatedVault";
import VIPArtistChat from "@/components/fan/VIPArtistChat";

export const FanEngagement: React.FC = () => {
  const { userProfile, artists } = useAudio();
  const activeArtists = artists.length > 0 ? artists : MOCK_ARTISTS;

  const [activeTab, setActiveTab] = useState<"vault" | "vip_chat" | "tipping_leaderboard">("vip_chat");
  const [selectedTipArtist, setSelectedTipArtist] = useState<Artist | null>(null);

  // Supporter Leaderboard Data
  const topSupporters = [
    { rank: 1, name: "Alex.ton", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", tippedTon: "45.0", badge: "Diamond Supporter" },
    { rank: 2, name: "Elena_Vibes", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", tippedTon: "32.5", badge: "Gold Supporter" },
    { rank: 3, name: "CryptoMusician", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80", tippedTon: "28.0", badge: "Gold Supporter" },
    { rank: 4, name: userProfile.name || "You", avatar: userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", tippedTon: "12.5", badge: "Silver Supporter" },
  ];

  return (
    <div className="min-h-screen pb-28 pt-6 px-4 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#070D2A] via-[#0D1854] to-[#120B44] relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-[#0098EA]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0098EA]/20 text-[#0098EA] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Fan Engagement & VIP Lounge
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Connect Directly with Your Favorite TON Artists
            </h1>
            <p className="text-xs md:text-sm text-[#9AA0AE] leading-relaxed">
              Tip artists via TON & JAM, unlock exclusive unreleased audio stems in the Token Vault, and participate in VIP chat rooms & on-chain polls.
            </p>
          </div>

          {/* User Stats Card */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-[#050A24]/90 backdrop-blur-md flex items-center justify-around md:justify-start gap-5 shrink-0 shadow-xl">
            <div className="text-center space-y-0.5">
              <p className="text-[10px] text-[#9AA0AE] font-bold uppercase">Fan Score</p>
              <p className="text-lg font-black text-[#0098EA]">
                {userProfile.fanEngagementScore || 420} pts
              </p>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-center space-y-0.5">
              <p className="text-[10px] text-[#9AA0AE] font-bold uppercase">Fan Tier</p>
              <p className="text-lg font-black text-amber-400 flex items-center gap-1 justify-center">
                <Crown className="w-4 h-4 fill-amber-400" />
                {userProfile.collectorTier || "Gold"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0A113A] overflow-x-auto scrollbar-none shadow-lg">
        {[
          { id: "vip_chat", label: "VIP Lounges & Forums", icon: MessageSquare },
          { id: "vault", label: "Token-Gated Vault", icon: KeyRound },
          { id: "tipping_leaderboard", label: "Tipping & Leaderboard", icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? "bg-[#0098EA] text-white shadow-lg shadow-[#0098EA]/25"
                  : "text-[#9AA0AE] hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      <div className="transition-all duration-300">
        {activeTab === "vip_chat" && (
          <VIPArtistChat onOpenTipModal={(artist) => setSelectedTipArtist(artist)} />
        )}

        {activeTab === "vault" && (
          <TokenGatedVault />
        )}

        {activeTab === "tipping_leaderboard" && (
          <div className="space-y-6">
            {/* Direct Artist Tip Grid */}
            <div className="p-5 rounded-2xl bg-[#0A113A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white">Direct Artist Tipping</h2>
                  <p className="text-xs text-[#9AA0AE]">Send TON or JAM tips directly to artist wallets</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeArtists.map((artist) => (
                  <div
                    key={artist.uid}
                    className="p-4 rounded-xl bg-[#050A24] flex items-center justify-between gap-3 hover:bg-[#0A1242] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 ring-2 ring-[#0098EA]/30"
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-white truncate">{artist.name}</h3>
                        <p className="text-[10px] text-[#9AA0AE]">{artist.genre || "Electronic Artist"}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTipArtist(artist)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-black text-xs shrink-0 flex items-center gap-1 shadow-md"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      Tip
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Supporter Leaderboard */}
            <div className="p-5 rounded-2xl bg-[#0A113A] space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white">Top Supporter Leaderboard</h2>
              </div>

              <div className="space-y-2">
                {topSupporters.map((sup) => (
                  <div
                    key={sup.rank}
                    className="p-3.5 rounded-xl bg-[#050A24] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center text-xs font-black ${
                        sup.rank === 1 ? "text-amber-400" : sup.rank === 2 ? "text-slate-300" : "text-amber-700"
                      }`}>
                        #{sup.rank}
                      </span>
                      <img src={sup.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-bold text-white">{sup.name}</p>
                        <span className="text-[10px] text-[#0098EA] font-semibold">{sup.badge}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400">+{sup.tippedTon} TON</span>
                      <p className="text-[9px] text-[#9AA0AE]">Total Tipped</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal dialog */}
      <ArtistTippingModal
        artist={selectedTipArtist}
        isOpen={!!selectedTipArtist}
        onClose={() => setSelectedTipArtist(null)}
      />
    </div>
  );
};

export default FanEngagement;

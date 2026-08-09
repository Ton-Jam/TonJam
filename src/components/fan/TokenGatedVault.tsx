import React, { useState } from "react";
import { 
  Lock, 
  Unlock, 
  Play, 
  Pause, 
  Download, 
  Video, 
  Music, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  KeyRound,
  Eye,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/contexts/AudioContext";
import { Track, NFTItem } from "@/types";
import { MOCK_ARTISTS, TON_LOGO, TJ_COIN_ICON } from "@/constants";
import { toast } from "sonner";

export interface VaultItem {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  title: string;
  type: "unreleased_track" | "audio_stems" | "behind_the_scenes" | "acoustic_session";
  description: string;
  coverUrl: string;
  audioUrl?: string;
  videoUrl?: string;
  downloadUrl?: string;
  requiredNftId?: string;
  requiredNftTitle: string;
  requiredMinJam?: number;
  releaseDate: string;
  duration?: string;
}

const MOCK_VAULT_ITEMS: VaultItem[] = [
  {
    id: "vault-01",
    artistId: "artist-cyber-beats",
    artistName: "Cyber Beats",
    artistAvatar: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20producer%20avatar?width=200&height=200&nologo=true",
    title: "Solar Pulse (Unreleased Acoustic VIP Cut)",
    type: "unreleased_track",
    description: "Stripped-down analog acoustic session recorded live in Berlin studio.",
    coverUrl: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse?width=400&height=400&nologo=true",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    requiredNftId: "nft-solar-01",
    requiredNftTitle: "Solar Pulse Genesis NFT",
    releaseDate: "2026-08-01",
    duration: "3:45"
  },
  {
    id: "vault-02",
    artistId: "artist-cyber-beats",
    artistName: "Cyber Beats",
    artistAvatar: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20producer%20avatar?width=200&height=200&nologo=true",
    title: "Solar Pulse Multitrack Stems (Vocals, Bass, Drums, Synth)",
    type: "audio_stems",
    description: "44.1kHz / 24-bit WAV stems for official remix contest.",
    coverUrl: "https://image.pollinations.ai/prompt/audio%20waveform%20neon%20cyan%20stems?width=400&height=400&nologo=true",
    downloadUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    requiredNftId: "nft-solar-01",
    requiredNftTitle: "Solar Pulse Genesis NFT",
    releaseDate: "2026-08-03",
  },
  {
    id: "vault-03",
    artistId: "artist-aura-sound",
    artistName: "Aura Sound",
    artistAvatar: "https://image.pollinations.ai/prompt/ethereal%20female%20musician%20avatar%20neon?width=200&height=200&nologo=true",
    title: "Aura Beat Backstage Studio Making-Of",
    type: "behind_the_scenes",
    description: "Exclusive 12-minute 4K documentary footage of sound design process.",
    coverUrl: "https://image.pollinations.ai/prompt/glowing%20aesthetic%20crystal%20sound%20waves?width=400&height=400&nologo=true",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    requiredNftId: "nft-aura-01",
    requiredNftTitle: "Aura Beat Legendary NFT",
    releaseDate: "2026-07-28",
    duration: "12:10"
  },
  {
    id: "vault-04",
    artistId: "artist-dj-krupy",
    artistName: "DJ Krupy AI",
    artistAvatar: "https://image.pollinations.ai/prompt/ai%20dj%20robot%20futuristic%20hologram?width=200&height=200&nologo=true",
    title: "Neural Vibe Experiment #09 (Lossless Master)",
    type: "acoustic_session",
    description: "Generative AI synth improvisation performed live in Spatial Room.",
    coverUrl: "https://image.pollinations.ai/prompt/holographic%20dj%20booth%20cyberpunk%20stage?width=400&height=400&nologo=true",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a815e3.mp3",
    requiredMinJam: 100,
    requiredNftTitle: "100+ JAM Holder Tier",
    releaseDate: "2026-08-05",
    duration: "4:20"
  }
];

export const TokenGatedVault: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay, userNFTs, userProfile } = useAudio();
  
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [simulatedNfts, setSimulatedNfts] = useState<string[]>(["nft-solar-01"]); // Mock initial ownership for demo
  const [activeVideoModal, setActiveVideoModal] = useState<VaultItem | null>(null);

  // Check if item is unlocked
  const isItemUnlocked = (item: VaultItem) => {
    // 1. Check if user owns required NFT in context userNFTs OR simulatedNfts
    if (item.requiredNftId) {
      const ownsInContext = userNFTs.some(n => n.id === item.requiredNftId);
      const ownsInSimulated = simulatedNfts.includes(item.requiredNftId);
      if (ownsInContext || ownsInSimulated) return true;
    }
    // 2. Check token threshold
    if (item.requiredMinJam) {
      const userJam = userProfile.jamBalance || 200;
      if (userJam >= item.requiredMinJam) return true;
    }
    return false;
  };

  const toggleSimulateOwnership = (nftId: string) => {
    setSimulatedNfts(prev => {
      const exists = prev.includes(nftId);
      if (exists) {
        toast.info("Simulated NFT removed from wallet");
        return prev.filter(id => id !== nftId);
      } else {
        toast.success("Simulated NFT added to wallet! Vault unlocked");
        return [...prev, nftId];
      }
    });
  };

  const filteredItems = MOCK_VAULT_ITEMS.filter(item => {
    if (selectedFilter === "all") return true;
    return item.type === selectedFilter;
  });

  const handlePlayVaultAudio = (item: VaultItem) => {
    if (!isItemUnlocked(item)) {
      toast.error(`Locked! ${item.requiredNftTitle} required to listen`);
      return;
    }
    if (!item.audioUrl) return;

    // Convert VaultItem to Track format
    const track: Track = {
      id: item.id,
      songId: item.id,
      title: item.title,
      artist: item.artistName,
      artistId: item.artistId,
      artistAvatar: item.artistAvatar,
      coverUrl: item.coverUrl,
      audioUrl: item.audioUrl,
      duration: 220,
      genre: "Exclusive Vault",
      isNFT: true,
      createdAt: item.releaseDate,
      isExclusive: true,
    };

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
      toast.success(`Playing exclusive track: ${item.title}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vault Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A113A] via-[#0F1A5C] to-[#120B44] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0098EA]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0098EA]/20 text-[#0098EA] text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            Token-Gated Artist Vault
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Exclusive Tracks, Stems & Behind-The-Scenes
          </h2>
          <p className="text-xs text-[#9AA0AE] leading-relaxed">
            Hold specific artist NFTs or JAM tokens to unlock unreleased audio cuts, multitrack stems, and studio session footage.
          </p>

          {/* Quick Simulation Bar for Testing */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#9AA0AE]">Demo Wallet NFTs:</span>
            <button
              onClick={() => toggleSimulateOwnership("nft-solar-01")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                simulatedNfts.includes("nft-solar-01")
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-[#9AA0AE] hover:bg-white/10"
              }`}
            >
              {simulatedNfts.includes("nft-solar-01") ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              Solar Pulse Genesis
            </button>
            <button
              onClick={() => toggleSimulateOwnership("nft-aura-01")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                simulatedNfts.includes("nft-aura-01")
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-[#9AA0AE] hover:bg-white/10"
              }`}
            >
              {simulatedNfts.includes("nft-aura-01") ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              Aura Beat Legendary
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All Items", icon: Sparkles },
          { id: "unreleased_track", label: "Unreleased Tracks", icon: Music },
          { id: "audio_stems", label: "Audio Stems", icon: Layers },
          { id: "behind_the_scenes", label: "Behind The Scenes", icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#0098EA] text-white shadow-lg shadow-[#0098EA]/20"
                  : "bg-[#0A113A] text-[#9AA0AE] hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Vault Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const unlocked = isItemUnlocked(item);
          const isCurrentAudio = currentTrack?.id === item.id;
          const isCurrentPlaying = isCurrentAudio && isPlaying;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl transition-all relative group ${
                unlocked
                  ? "bg-[#0A113A] hover:bg-[#0F1A5C]/80 shadow-xl"
                  : "bg-[#070C28]/80 opacity-90"
              }`}
            >
              <div className="flex gap-4">
                {/* Artwork Thumbnail */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-black/40">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      !unlocked ? "filter blur-xs grayscale" : "group-hover:scale-105"
                    }`}
                  />
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-amber-400">
                      <Lock className="w-6 h-6" />
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/60 text-white">
                    {item.type === "behind_the_scenes" ? (
                      <Video className="w-3 h-3 text-[#0098EA]" />
                    ) : item.type === "audio_stems" ? (
                      <Layers className="w-3 h-3 text-purple-400" />
                    ) : (
                      <Music className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <img
                        src={item.artistAvatar}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-bold text-[#9AA0AE] truncate">
                        {item.artistName}
                      </span>
                    </div>

                    {/* Lock Status Badge */}
                    {unlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-extrabold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Gated
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white truncate leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#9AA0AE] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-[#9AA0AE]">
                    <span>Req: <strong className="text-white">{item.requiredNftTitle}</strong></span>
                    {item.duration && <span>{item.duration}</span>}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-3 pt-3 flex items-center justify-between">
                {unlocked ? (
                  <div className="flex items-center gap-2 w-full">
                    {item.audioUrl && (
                      <button
                        onClick={() => handlePlayVaultAudio(item)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          isCurrentPlaying
                            ? "bg-amber-500 text-black shadow-lg"
                            : "bg-[#0098EA] text-white hover:bg-[#0098EA]/90"
                        }`}
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-black" />
                            Pause Audio
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            Stream Track
                          </>
                        )}
                      </button>
                    )}

                    {item.videoUrl && (
                      <button
                        onClick={() => setActiveVideoModal(item)}
                        className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Watch Video
                      </button>
                    )}

                    {item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        download
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        Stems
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 rounded-xl bg-white/5">
                    <span className="text-[11px] font-medium text-[#9AA0AE]">
                      Buy or hold NFT to unlock this vault content
                    </span>
                    <button
                      onClick={() => item.requiredNftId && toggleSimulateOwnership(item.requiredNftId)}
                      className="px-2.5 py-1 rounded-lg bg-[#0098EA]/20 hover:bg-[#0098EA]/30 text-[#0098EA] text-[11px] font-extrabold transition-all"
                    >
                      Simulate NFT
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0A113A] rounded-2xl p-5 space-y-4 text-white relative shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">{activeVideoModal.title}</h3>
                  <p className="text-xs text-[#9AA0AE]">{activeVideoModal.artistName} Behind-the-Scenes</p>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  Close
                </button>
              </div>

              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative">
                <video
                  src={activeVideoModal.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenGatedVault;

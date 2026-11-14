import React, { useState, useMemo } from "react";
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
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/contexts/AudioContext";
import { useNFT } from "@/contexts/NFTContext";
import { Track } from "@/types";
import { toast } from "sonner";

export interface VaultItem {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar?: string;
  title: string;
  type: "unreleased_track" | "audio_stems" | "behind_the_scenes" | "acoustic_session";
  description: string;
  coverUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  downloadUrl?: string;
  requiredNftId?: string;
  requiredNftTitle: string;
  requiredMinJam?: number;
  releaseDate?: string;
  duration?: string;
}

export const TokenGatedVault: React.FC = () => {
  const { allTracks, artists, playTrack, currentTrack, isPlaying, togglePlay, userNFTs, userProfile } = useAudio();
  const { nfts } = useNFT();
  
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [activeVideoModal, setActiveVideoModal] = useState<VaultItem | null>(null);

  const vaultItems: VaultItem[] = useMemo(() => {
    const exclusiveTracks = allTracks.filter((t) => t.isExclusive);
    return exclusiveTracks.map((t) => {
      const artist = artists.find((a) => a.uid === t.artistId || a.name === t.artist);
      const linkedNft = nfts.find((n) => n.trackId === t.id || n.artistId === t.artistId || n.creatorId === t.artistId);
      const secs = Number(t.duration || 0);
      const durationStr = secs > 0 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : undefined;
      return {
        id: t.id,
        artistId: t.artistId || artist?.uid || '',
        artistName: t.artist || artist?.name || 'Artist',
        artistAvatar: t.artistAvatar || artist?.avatarUrl,
        title: t.title,
        type: "unreleased_track",
        description: t.description || `Token-gated exclusive track by ${t.artist || 'Artist'}.`,
        coverUrl: t.coverUrl,
        audioUrl: t.audioUrl,
        requiredNftId: linkedNft?.id,
        requiredNftTitle: linkedNft?.title || `${t.artist || 'Artist'} NFT`,
        releaseDate: t.createdAt !== undefined && t.createdAt !== null ? String(t.createdAt) : undefined,
        duration: durationStr,
      };
    });
  }, [allTracks, artists, nfts]);

  const isItemUnlocked = (item: VaultItem) => {
    const combinedUserNfts = userNFTs || [];
    if (item.requiredNftId) {
      if (combinedUserNfts.some((n) => n.id === item.requiredNftId || n.trackId === item.id)) {
        return true;
      }
    }
    if (item.artistId && combinedUserNfts.some((n) => n.artistId === item.artistId || n.creatorId === item.artistId)) {
      return true;
    }
    if (item.requiredMinJam) {
      const userJam = Number(userProfile?.jamBalance || 0);
      if (userJam >= item.requiredMinJam) return true;
    }
    return false;
  };

  const filteredItems = vaultItems.filter((item) => {
    if (selectedFilter === "all") return true;
    return item.type === selectedFilter;
  });

  const handlePlayVaultAudio = (item: VaultItem) => {
    if (!isItemUnlocked(item)) {
      toast.error(`Locked! ${item.requiredNftTitle} required to listen`);
      return;
    }
    if (!item.audioUrl) {
      toast.error("Audio stream unavailable for this vault item");
      return;
    }

    const track: Track = {
      id: item.id,
      songId: item.id,
      title: item.title,
      artist: item.artistName,
      artistId: item.artistId,
      artistAvatar: item.artistAvatar,
      coverUrl: item.coverUrl || "",
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
      {filteredItems.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0A113A]/60 text-center space-y-2">
          <Lock className="w-8 h-8 text-[#9AA0AE] mx-auto opacity-50" />
          <p className="text-sm font-bold text-white">No token-gated vault content published yet</p>
          <p className="text-xs text-[#9AA0AE]">Exclusive artist tracks and NFT-gated releases will appear here once published.</p>
        </div>
      ) : (
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
                    {item.coverUrl && (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          !unlocked ? "filter blur-xs grayscale" : "group-hover:scale-105"
                        }`}
                      />
                    )}
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
                        {item.artistAvatar && (
                          <img
                            src={item.artistAvatar}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        )}
                        <span className="text-[11px] font-bold text-[#9AA0AE] truncate">
                          {item.artistName}
                        </span>
                      </div>

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
                        Collect {item.requiredNftTitle} to unlock this vault item
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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

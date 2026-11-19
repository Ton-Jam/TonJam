import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, increment, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { sendTransactionSafe } from "@/services/tonService";
import {
  Play,
  Pause,
  Zap,
  Verified,
  Share2,
  Heart,
  MoreHorizontal,
  ShoppingCart,
  Music2,
  Disc,
  Clock,
  Activity,
  ExternalLink,
  Users,
  Coins,
  PlusCircle,
  Sparkles,
  Lock,
  Unlock,
  Volume2,
  Video,
  Image as ImageIcon,
  DownloadCloud,
  FileText,
  Loader2,
  Gift,
  Check,
  Copy,
  Send,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { TJ_COIN_ICON, TON_LOGO } from "@/constants";
import { useAudio } from "@/contexts/AudioContext";
import { useTonPrice } from "@/contexts/TonPriceContext";
import { getPlaceholderImage, cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import TokenGate from "@/components/TokenGate";
import { useTokenGating } from "@/hooks/useTokenGating";
import CommentsSection from "@/components/CommentsSection";
import ReactionsSection from "@/components/ReactionsSection";
import AudioVisualizer from "@/components/AudioVisualizer";
import { PageHeader } from "@/components/layout/PageHeader";

const TrackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    playTrack,
    currentTrack,
    isPlaying,
    jamTrack,
    mintNFT,
    allTracks,
    allNFTs,
    artists,
    likedTrackIds,
    toggleLikeTrack,
    addNotification,
    setTrackToAddToPlaylist,
    setOptionsTrack,
    setFullPlayerOpen,
    userProfile,
    setUserProfile,
    isTrackCached,
    downloadTrackForOffline,
    deleteCachedTrack,
    toggleFollowUser,
    followedUserIds,
  } = useAudio();
  const { price: tonUsdRate } = useTonPrice();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const [isTipping, setIsTipping] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "lyrics" | "details" | "history" | "nfts" | "exclusive"
  >("lyrics");
  const [isCached, setIsCached] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [livePlayCount, setLivePlayCount] = useState<number | null>(null);
  const [sharedPlatforms, setSharedPlatforms] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null);

  const track = useMemo(() => allTracks.find((t) => t.id === id), [id, allTracks]);
  const artist = useMemo(
    () =>
      artists.find(
        (a) =>
          a.uid === track?.artistId ||
          (track?.artist && a.name?.toLowerCase() === track.artist.toLowerCase())
      ),
    [artists, track]
  );
  const associatedNFTs = useMemo(
    () => allNFTs.filter((n) => n.trackId === id),
    [id, allNFTs]
  );

  const isArtistVerified = Boolean(
    track?.artistVerified || artist?.verified || artist?.isVerifiedArtist
  );

  const artistTargetUid = artist?.uid || track?.artistId;
  const isFollowingArtist = Boolean(
    artistTargetUid && followedUserIds?.includes(artistTargetUid)
  );

  const isOwner = useMemo(() => {
    if (!track) return false;
    const currentWallet = userAddress || userProfile?.walletAddress;
    return (
      track.artistId === userProfile?.uid ||
      associatedNFTs.some(
        (n) => n.owner === currentWallet || n.owner === userProfile?.uid
      )
    );
  }, [track, associatedNFTs, userAddress, userProfile]);

  const gatingConfig = useMemo(() => {
    if (track?.tokenGating?.enabled) {
      return track.tokenGating;
    }
    const assocNFT = associatedNFTs[0];
    if (assocNFT) {
      return {
        enabled: true,
        tokenAddress: assocNFT.contractAddress || assocNFT.id,
        minAmount: "1",
        tokenSymbol: "NFT",
        tokenType: "nft" as const,
      };
    }
    return undefined;
  }, [track?.tokenGating, associatedNFTs]);

  const { hasAccess } = useTokenGating(gatingConfig);

  useEffect(() => {
    if (!track?.id) return;
    const trackDocRef = doc(db, "tracks", track.id);
    const unsubscribe = onSnapshot(
      trackDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.playCount === "number") {
            setLivePlayCount(data.playCount);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `tracks/${track.id}`);
      }
    );
    return () => unsubscribe();
  }, [track?.id]);

  useEffect(() => {
    let active = true;
    const checkCache = async () => {
      if (track) {
        const cached = await isTrackCached(track.id);
        if (active) setIsCached(cached);
      }
    };
    checkCache();
    return () => {
      active = false;
    };
  }, [track?.id, isTrackCached]);

  const handleToggleCache = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!track) return;

    if (isCached) {
      try {
        await deleteCachedTrack(track.id);
        setIsCached(false);
        addNotification("Removed track from offline library.", "info");
      } catch {
        addNotification("Failed to remove offline copy.", "error");
      }
    } else {
      setIsCaching(true);
      try {
        await downloadTrackForOffline(track);
        setIsCached(true);
        addNotification("Track saved for offline playback.", "success");
      } catch {
        addNotification("Failed to download track for offline playback.", "error");
      } finally {
        setIsCaching(false);
      }
    }
  };

  const handleShareEarn = async (platform: string) => {
    if (!track) return;
    if (!userProfile?.uid) {
      addNotification("Sign in to earn JAM rewards for sharing.", "warning");
      return;
    }
    if (sharedPlatforms.includes(platform)) {
      addNotification(
        `Reward already claimed for ${platform.toUpperCase()} share.`,
        "info"
      );
      return;
    }

    setSharingPlatform(platform);
    setIsSharing(true);

    const shareText = `Listen to "${track.title}" by ${track.artist} on TonJam!`;
    const shareUrl = window.location.href;
    const openExternalLink = (href: string) => {
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    };

    if (platform === "telegram") {
      openExternalLink(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
      );
    } else if (platform === "twitter") {
      openExternalLink(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
      );
    } else if (platform === "facebook") {
      openExternalLink(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
      );
    } else if (platform === "copylink") {
      try {
        await navigator.clipboard.writeText(shareUrl);
        addNotification("Track link copied to clipboard.", "success");
      } catch (err) {
        console.warn("Clipboard copy failed:", err);
      }
    }

    const rewardAmount = platform === "copylink" ? 2 : 5;

    try {
      const userRef = doc(db, "users", userProfile.uid);
      try {
        await updateDoc(userRef, {
          jamBalance: increment(rewardAmount),
          tjBalance: increment(rewardAmount),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.uid}`);
      }

      const txId = `tx-share-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newTx = {
        id: txId,
        type: "claim_rewards" as const,
        amount: rewardAmount,
        platformFee: 0,
        artistShare: 0,
        recipientAddress: userProfile.walletAddress || "USER_WALLET",
        userId: userProfile.uid,
        trackId: track.id,
        trackTitle: `Shared "${track.title}" on ${platform.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        status: "pending" as const,
        txHash: txId,
        participants: [userProfile.uid].filter(Boolean),
      };

      try {
        await setDoc(doc(db, "transactions", txId), newTx);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `transactions/${txId}`);
      }

      setUserProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          jamBalance: (prev.jamBalance || 0) + rewardAmount,
          tjBalance: (prev.tjBalance || 0) + rewardAmount,
        };
      });

      setSharedPlatforms((prev) => [...prev, platform]);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#0088cc", "#38bdf8", "#8b5cf6", "#e0f2fe"],
      });

      addNotification(`Earned +${rewardAmount} JAM for sharing!`, "success");
    } catch (error) {
      console.error(error);
      addNotification("Could not record share reward right now.", "error");
    } finally {
      setIsSharing(false);
      setSharingPlatform(null);
    }
  };

  const isActive = currentTrack?.id === track?.id;
  const isLiked = track ? likedTrackIds.includes(track.id) : false;

  if (!track) {
    return (
      <div className="min-h-screen bg-[var(--tj-color-bg-primary,#091220)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] flex items-center justify-center mb-4">
          <Disc className="h-8 w-8 text-[var(--tj-color-brand-primary,#00B4D8)] opacity-70" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Track Not Found</h2>
        <p className="text-sm text-[var(--tj-color-text-secondary,#C2C7CD)] mb-6">
          This release may have been removed or the link is incorrect.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-sm font-semibold text-white flex items-center gap-2 transition-colors border-0 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  const handlePlay = () => {
    if (track.tokenGating?.enabled && !hasAccess) {
      addNotification(
        `This release requires ${track.tokenGating.tokenSymbol} access.`,
        "warning"
      );
      return;
    }
    playTrack(track);
    setFullPlayerOpen(true);
  };

  const handleTip = async (amount: number) => {
    setIsTipping(false);

    if (!tonConnectUI.connected) {
      tonConnectUI.openModal();
      return;
    }

    if (!artist?.walletAddress) {
      addNotification("Artist has not connected a TON wallet yet.", "warning");
      return;
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 90,
        messages: [
          {
            address: artist.walletAddress,
            amount: BigInt(Math.round(amount * 1e9)).toString(),
          },
        ],
      };

      await sendTransactionSafe(tonConnectUI, transaction);
      addNotification(`Tipped ${amount} TON to ${track.artist}!`, "success");
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.8 },
        colors: ["#0088cc", "#ffffff", "#38bdf8"],
      });
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("User rejected")) {
        addNotification("Tip transaction cancelled.", "warning");
      } else {
        addNotification(
          "Tip failed. Please verify your TON wallet balance.",
          "error"
        );
      }
    }
  };

  const handleJam = () => {
    jamTrack(track.id);
    confetti({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.6 },
      colors: ["#0088cc", "#38bdf8", "#8b5cf6"],
    });
  };

  const nftPriceNum = parseFloat(String(track.price ?? "2.5")) || 2.5;
  const usdEstimate = (nftPriceNum * (tonUsdRate ?? 7.5)).toFixed(2);
  const displayStreams = livePlayCount !== null ? livePlayCount : track.playCount || 0;
  const durationLabel = `${Math.floor((track.duration || 0) / 60)}:${String(
    (track.duration || 0) % 60
  ).padStart(2, "0")}`;

  const coverSrc =
    track.coverUrl || getPlaceholderImage(`track-${track.id}`, 800, 800);
  const artistAvatarSrc =
    artist?.avatarUrl || getPlaceholderImage(`artist-${track.artistId}`, 200, 200);

  const hasExclusivePerks =
    associatedNFTs.some((n) => n.exclusiveContent && n.exclusiveContent.length > 0) ||
    track.isExclusive;

  return (
    <div className="relative min-h-screen bg-[var(--tj-color-bg-primary,#091220)] pb-24 overflow-hidden text-white">
      {/* Subtle Ambient Atmospheric Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute -top-32 left-1/4 w-[680px] h-[520px] rounded-full blur-[150px] opacity-12"
          style={{ background: "radial-gradient(circle, #00B4D8 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[520px] h-[440px] rounded-full blur-[160px] opacity-10"
          style={{ background: "radial-gradient(circle, #0088CC 0%, transparent 70%)" }}
        />
      </div>

      <PageHeader
        title="Track Details"
        showBack={true}
        rightContent={
          <button
            onClick={() => setOptionsTrack(track)}
            className="p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0 outline-none"
            aria-label="Track Options"
            title="Track Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        }
      />

      <div className="relative z-10 w-full max-w-full px-2 pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Artwork, Playback Controls, Visualizer, Mint Card */}
          <div className="lg:col-span-5 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square rounded-[var(--tj-radius-lg,10px)] overflow-hidden bg-[var(--tj-color-surface-default,#0D1628)] shadow-lg group"
            >
              <img
                src={coverSrc}
                alt={track.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = getPlaceholderImage(`track-${track.id}`, 800, 800);
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70 pointer-events-none" />

              {track.isNFT && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--tj-color-bg-primary,#091220)]/80 backdrop-blur-md rounded-full flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[var(--tj-color-brand-primary,#00B4D8)] fill-[var(--tj-color-brand-primary,#00B4D8)]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Music NFT
                  </span>
                </div>
              )}

              {track.tokenGating?.enabled && !hasAccess && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-brand-primary,#00B4D8)] flex items-center justify-center mb-3 shadow-sm">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Holder Exclusive</h3>
                  <p className="text-xs text-slate-300">
                    Hold {track.tokenGating.minAmount} {track.tokenGating.tokenSymbol} to unlock full playback
                  </p>
                </div>
              )}
            </motion.div>

            {/* Transport & Quick Action Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlay}
                className="flex-1 min-w-[140px] h-12 px-5 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white rounded-[var(--tj-radius-md,8px)] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-0 cursor-pointer"
                aria-label={isActive && isPlaying ? "Pause Track" : "Play Track"}
              >
                {isActive && isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Play Track</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={() => toggleLikeTrack(track.id)}
                className={cn(
                  "h-12 w-12 rounded-[var(--tj-radius-md,8px)] flex items-center justify-center transition-all active:scale-95 border-0 cursor-pointer",
                  isLiked
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-elevated,#111F36)] text-slate-300 hover:text-white"
                )}
                aria-label={isLiked ? "Unlike Track" : "Like Track"}
                title={isLiked ? "Unlike" : "Like"}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </button>

              <button
                onClick={handleToggleCache}
                disabled={isCaching}
                className={cn(
                  "h-12 w-12 rounded-[var(--tj-radius-md,8px)] flex items-center justify-center transition-all active:scale-95 border-0 cursor-pointer",
                  isCached
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)]/20 text-[var(--tj-color-brand-primary,#00B4D8)]"
                    : "bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-elevated,#111F36)] text-slate-300 hover:text-white"
                )}
                title={
                  isCached
                    ? "Remove from Offline Library"
                    : "Download for Offline Listening"
                }
                aria-label="Toggle offline cache"
              >
                {isCaching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--tj-color-brand-primary,#00B4D8)]" />
                ) : (
                  <DownloadCloud className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={() => setTrackToAddToPlaylist(track)}
                className="h-12 w-12 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-elevated,#111F36)] text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 border-0 cursor-pointer"
                aria-label="Add to playlist"
                title="Add to playlist"
              >
                <PlusCircle className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsTipping((prev) => !prev)}
                  className={cn(
                    "h-12 w-12 rounded-[var(--tj-radius-md,8px)] flex items-center justify-center transition-all active:scale-95 border-0 cursor-pointer",
                    isTipping
                      ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                      : "bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-elevated,#111F36)] text-slate-300 hover:text-white"
                  )}
                  aria-label="Tip artist"
                  title="Tip Artist in TON"
                >
                  <Coins className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {isTipping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute bottom-full right-0 mb-3 p-3 bg-[var(--tj-color-surface-default,#0D1628)] rounded-[var(--tj-radius-md,8px)] shadow-xl z-50 flex flex-col gap-1.5 min-w-[168px]"
                    >
                      <p className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider px-2.5 py-1">
                        Tip Artist (TON)
                      </p>
                      {[0.1, 0.5, 1, 5].map((amount) => (
                        <button
                          key={`tip-${amount}`}
                          onClick={() => handleTip(amount)}
                          className="px-3 py-2 bg-[var(--tj-color-surface-elevated,#111F36)]/70 hover:bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-sm,6px)] text-xs font-bold text-white transition-all flex items-center justify-between border-0 cursor-pointer"
                        >
                          <span className="flex items-center gap-2 font-mono tabular-nums">
                            <img
                              src={TON_LOGO}
                              className="w-4 h-4 rounded-full"
                              alt="TON"
                            />
                            {amount}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--tj-color-brand-primary,#00B4D8)] uppercase">
                            TON
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Live Audio Spectrum */}
            <AudioVisualizer className="w-full h-[200px]" />

            {/* NFT Collector Card */}
            {track.isNFT && (
              <div className="p-5 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider mb-1">
                      Collector Edition Price
                    </p>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl font-black font-mono tabular-nums text-white">
                        {nftPriceNum} TON
                      </span>
                      <span className="text-xs font-mono tabular-nums text-[var(--tj-color-text-secondary,#C2C7CD)]">
                        ≈ ${usdEstimate}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider mb-1">
                      Minted Supply
                    </p>
                    <p className="text-sm font-bold font-mono tabular-nums text-[var(--tj-color-brand-primary,#00B4D8)]">
                      {track.minted || 0} / {track.editions || "∞"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => mintNFT(track.id, tonConnectUI)}
                    className="py-3 px-4 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white rounded-[var(--tj-radius-sm,6px)] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-0 cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Collect NFT
                  </button>
                  <button
                    onClick={handleJam}
                    className="py-3 px-4 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white rounded-[var(--tj-radius-sm,6px)] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-0 cursor-pointer"
                  >
                    <Zap className="h-4 w-4 text-[var(--tj-color-brand-primary,#00B4D8)] fill-[var(--tj-color-brand-primary,#00B4D8)]" />
                    Jam Track
                  </button>
                </div>

                <p className="text-[10px] text-center text-slate-500 font-medium tracking-wide">
                  Verified on TON Blockchain · Instant creator royalty settlement
                </p>
              </div>
            )}

            {/* Share to Earn */}
            <div className="p-5 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                    Rewards Active
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Share to Earn
                  </h3>
                  <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] mt-1 leading-relaxed">
                    Share {track.isNFT ? "this music NFT" : "this track"} with your audience to earn JAM tokens.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--tj-color-surface-elevated,#111F36)] px-3 py-2 rounded-[var(--tj-radius-sm,6px)] shrink-0">
                  <img src={TJ_COIN_ICON} className="w-4 h-4" alt="JAM" />
                  <span className="text-xs font-black font-mono text-amber-400">
                    +5 JAM
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: "telegram",
                    name: "Telegram",
                    icon: Send,
                    reward: 5,
                    tint: "text-[#38BDF8]",
                  },
                  {
                    id: "twitter",
                    name: "X / Twitter",
                    icon: Share2,
                    reward: 5,
                    tint: "text-white",
                  },
                  {
                    id: "facebook",
                    name: "Facebook",
                    icon: Share2,
                    reward: 5,
                    tint: "text-blue-400",
                  },
                  {
                    id: "copylink",
                    name: "Copy Link",
                    icon: Copy,
                    reward: 2,
                    tint: "text-slate-300",
                  },
                ].map((plat) => {
                  const Icon = plat.icon;
                  const isClaimed = sharedPlatforms.includes(plat.id);
                  const isCurrent = sharingPlatform === plat.id;

                  return (
                    <button
                      key={plat.id}
                      onClick={() => handleShareEarn(plat.id)}
                      disabled={isSharing || isClaimed}
                      className={cn(
                        "flex flex-col p-3 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] transition-all text-left border-0 cursor-pointer",
                        isClaimed && "opacity-45 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className={cn("flex items-center gap-2", plat.tint)}>
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold text-white">
                            {plat.name}
                          </span>
                        </div>
                        {isClaimed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="flex items-center justify-between w-full mt-1">
                        <span className="text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)]">Reward</span>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-amber-400">
                            Claiming...
                          </span>
                        ) : isClaimed ? (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Claimed
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold font-mono text-amber-400">
                            +{plat.reward} JAM
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-elevated,#111F36)]/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                  <span className="text-xs text-slate-300 font-medium">
                    Earned on this track
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-white">
                  {sharedPlatforms.reduce(
                    (sum, current) => sum + (current === "copylink" ? 2 : 5),
                    0
                  )}{" "}
                  JAM
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Artist Header, Metadata Strip, Tabs, Comments */}
          <div className="lg:col-span-7 space-y-6">
            <header className="space-y-4">
              {/* Compact Artist Bar */}
              <div className="flex items-center justify-between gap-3 bg-[var(--tj-color-surface-default,#0D1628)] p-3.5 rounded-[var(--tj-radius-md,8px)]">
                <div
                  className="flex items-center gap-3 cursor-pointer group min-w-0"
                  onClick={() => navigate(`/artist/${track.artistId}`)}
                >
                  <div className="relative shrink-0">
                    <img
                      src={artistAvatarSrc}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage(
                          `artist-${track.artistId}`,
                          200,
                          200
                        );
                      }}
                      className="w-11 h-11 rounded-full object-cover"
                      alt={track.artist}
                    />
                    {isArtistVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-[var(--tj-color-bg-primary,#091220)] rounded-full p-0.5">
                        <Verified className="h-3.5 w-3.5 text-[var(--tj-color-brand-primary,#00B4D8)] fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                      {track.artist}
                    </p>
                    <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)] font-medium">
                      {isArtistVerified ? "Verified Artist" : "Independent Artist"}
                    </p>
                  </div>
                </div>

                {artistTargetUid && artistTargetUid !== userProfile?.uid && (
                  <button
                    onClick={() => toggleFollowUser(artistTargetUid)}
                    className={cn(
                      "px-4 py-2 rounded-[var(--tj-radius-sm,6px)] text-xs font-bold transition-all border-0 cursor-pointer shrink-0",
                      isFollowingArtist
                        ? "bg-[var(--tj-color-surface-elevated,#111F36)] text-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-surface-hover,#132B49)]"
                        : "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white hover:bg-[var(--tj-color-brand-hover,#21C2E8)]"
                    )}
                  >
                    {isFollowingArtist ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              {/* Track Title & Status */}
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  {track.isExplicit && (
                    <span className="bg-rose-500/15 text-rose-400 px-2.5 py-0.5 rounded-[var(--tj-radius-xs,4px)] text-[10px] font-bold uppercase tracking-wider">
                      Explicit
                    </span>
                  )}
                  {isCached && (
                    <span className="bg-[var(--tj-color-brand-primary,#00B4D8)]/15 text-[var(--tj-color-brand-primary,#00B4D8)] px-2.5 py-0.5 rounded-[var(--tj-radius-xs,4px)] text-[10px] font-bold uppercase tracking-wider">
                      Offline Ready
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {track.title}
                </h1>

                {/* Clean Unified Typographic Metadata Line */}
                <p className="text-xs sm:text-sm text-[var(--tj-color-text-secondary,#C2C7CD)] font-medium mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono tabular-nums">
                  <span className="text-[var(--tj-color-brand-primary,#00B4D8)] font-semibold">
                    {displayStreams.toLocaleString()} streams
                  </span>
                  <span>·</span>
                  <span>{durationLabel}</span>
                  {track.genre && (
                    <>
                      <span>·</span>
                      <span className="text-slate-200 font-sans">{track.genre}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{track.bpm || 120} BPM</span>
                  <span>·</span>
                  <span>{track.key || "C# min"}</span>
                  <span>·</span>
                  <span className="text-emerald-400">{track.bitrate || "FLAC"}</span>
                  {track.mood && (
                    <>
                      <span>·</span>
                      <span className="font-sans text-slate-300">{track.mood}</span>
                    </>
                  )}
                </p>
              </div>

              <ReactionsSection targetId={track.id} targetType="track" />
            </header>

            {/* Tonal Tab Navigation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1.5 bg-[var(--tj-color-surface-default,#0D1628)] rounded-[var(--tj-radius-md,8px)] overflow-x-auto no-scrollbar">
                {(["lyrics", "details", "history", "nfts", "exclusive"] as const).map(
                  (tab) => {
                    if (tab === "exclusive" && !hasExclusivePerks) return null;
                    const label =
                      tab === "exclusive"
                        ? "Holder Perks"
                        : tab === "nfts"
                        ? `Editions (${associatedNFTs.length})`
                        : tab.charAt(0).toUpperCase() + tab.slice(1);

                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-4 py-2 rounded-[var(--tj-radius-sm,6px)] text-xs font-bold whitespace-nowrap transition-all border-0 cursor-pointer",
                          activeTab === tab
                            ? "bg-[var(--tj-color-surface-elevated,#111F36)] text-white shadow-sm"
                            : "bg-transparent text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white"
                        )}
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="min-h-[260px]">
                <TokenGate gating={track.tokenGating}>
                  {activeTab === "lyrics" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)]"
                    >
                      {track.lyrics ? (
                        <div className="whitespace-pre-line text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
                          {track.lyrics}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-[var(--tj-color-text-secondary,#C2C7CD)]">
                          <Music2 className="h-9 w-9 mb-3 opacity-30" />
                          <p className="text-xs font-semibold uppercase tracking-wider">
                            No lyrics uploaded for this track
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "details" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="p-5 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--tj-color-text-secondary,#C2C7CD)]">
                          Audio Specifications
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <DetailItem label="BPM" value={track.bpm?.toString() || "120"} />
                          <DetailItem label="Musical Key" value={track.key || "C# Minor"} />
                          <DetailItem label="Format" value={track.bitrate || "FLAC"} />
                          <DetailItem
                            label="Mood"
                            value={track.mood || "Not specified"}
                          />
                          <DetailItem
                            label="Rating"
                            value={track.isExplicit ? "Explicit (18+)" : "Clean"}
                          />
                          <DetailItem label="Genre" value={track.genre || "Electronic"} />
                        </div>
                      </div>

                      <div className="p-5 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--tj-color-text-secondary,#C2C7CD)]">
                          Release & Verification
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <DetailItem
                            label="Release Date"
                            value={track.releaseDate || "—"}
                          />
                          <DetailItem
                            label="IPFS Content ID"
                            value={track.cid || "Not pinned"}
                            isMono
                          />
                          {track.isDrmProtected && (
                            <>
                              <DetailItem
                                label="Watermark Protection"
                                value="Acoustic Watermark Enabled"
                              />
                              <DetailItem
                                label="Signature"
                                value={track.watermarkText || "TONJAM-SIG"}
                                isMono
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </TokenGate>

                {activeTab === "history" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {associatedNFTs.some((n) => n.history && n.history.length > 0) ? (
                      associatedNFTs
                        .flatMap((n) => n.history || [])
                        .map((event, idx) => (
                          <div
                            key={`history-${idx}`}
                            className="flex items-center justify-between p-4 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] flex items-center justify-center shrink-0">
                                <Activity className="h-4 w-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white uppercase tracking-wider">
                                  {event.event}
                                </p>
                                <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono truncate">
                                  {event.from} → {event.to}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-xs font-bold font-mono text-[var(--tj-color-brand-primary,#00B4D8)]">
                                {event.price ? `${event.price} TON` : "—"}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {event.date}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] text-[var(--tj-color-text-secondary,#C2C7CD)]">
                        <Activity className="h-9 w-9 mb-3 opacity-30" />
                        <p className="text-xs font-semibold uppercase tracking-wider">
                          No on-chain activity recorded yet
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "nfts" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {associatedNFTs.length > 0 ? (
                      associatedNFTs.map((nft) => (
                        <motion.div
                          key={nft.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          className="p-4 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-elevated,#111F36)] transition-colors cursor-pointer group/nft"
                          onClick={() => navigate(`/nft/${nft.id}`)}
                        >
                          <div className="flex items-center gap-3.5 mb-4">
                            <img
                              src={
                                nft.imageUrl ||
                                getPlaceholderImage(`nft-${nft.id}`, 200, 200)
                              }
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = getPlaceholderImage(
                                  `nft-${nft.id}`,
                                  200,
                                  200
                                );
                              }}
                              className="w-14 h-14 rounded-[var(--tj-radius-sm,6px)] object-cover shrink-0"
                              alt={nft.title}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">
                                {nft.title}
                              </p>
                              <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono">
                                Edition #{nft.edition || 1}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={TON_LOGO} className="w-4 h-4" alt="TON" />
                              <span className="text-sm font-bold font-mono text-white">
                                {nft.price} TON
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--tj-color-brand-primary,#00B4D8)] group-hover/nft:translate-x-0.5 transition-transform">
                              View NFT <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] text-[var(--tj-color-text-secondary,#C2C7CD)]">
                        <Zap className="h-9 w-9 mb-3 opacity-30" />
                        <p className="text-xs font-semibold uppercase tracking-wider">
                          No NFT editions minted for this track yet
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "exclusive" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {hasExclusivePerks ? (
                      (() => {
                        const allExclusives: any[] = associatedNFTs.flatMap(
                          (n) => n.exclusiveContent || []
                        );

                        if (hasAccess || isOwner) {
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-[var(--tj-radius-md,8px)]">
                                <Unlock className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                    Holder Perks Unlocked
                                  </p>
                                  <p className="text-xs text-slate-300 mt-0.5">
                                    You have verified collector access to these files.
                                  </p>
                                </div>
                              </div>

                              {allExclusives.map((item) => {
                                let IconComponent = FileText;
                                if (item.type === "video") IconComponent = Video;
                                if (item.type === "track") IconComponent = Volume2;
                                if (item.type === "image") IconComponent = ImageIcon;

                                return (
                                  <div
                                    key={item.id}
                                    className="p-4 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                  >
                                    <div className="flex items-start gap-3.5">
                                      <div className="w-11 h-11 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] flex items-center justify-center shrink-0">
                                        <IconComponent className="w-5 h-5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                                      </div>
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--tj-color-brand-primary,#00B4D8)] bg-[var(--tj-color-surface-elevated,#111F36)] px-2 py-0.5 rounded-[var(--tj-radius-xs,4px)]">
                                          {item.type}
                                        </span>
                                        <h4 className="text-sm font-bold text-white">
                                          {item.title}
                                        </h4>
                                        {item.description && (
                                          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)]">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2.5 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white font-bold text-xs uppercase tracking-wider rounded-[var(--tj-radius-sm,6px)] transition-all flex items-center justify-center gap-2 shrink-0"
                                    >
                                      <DownloadCloud className="w-4 h-4" />
                                      Download
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col items-center justify-center p-8 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] text-center">
                            <div className="w-14 h-14 bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-md,8px)] flex items-center justify-center mb-4">
                              <Lock className="w-6 h-6 text-rose-400" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-1">
                              Locked Holder Perks
                            </h3>
                            <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] mb-6 max-w-sm leading-relaxed">
                              Collect an NFT edition for this release to unlock stems, lossless downloads, and bonus files.
                            </p>
                            {allExclusives.length > 0 && (
                              <div className="grid grid-cols-1 gap-2 w-full max-w-sm text-left mb-6">
                                {allExclusives.map((item, idx) => (
                                  <div
                                    key={`locked-${idx}`}
                                    className="flex items-center justify-between px-4 py-2.5 bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-sm,6px)] opacity-75"
                                  >
                                    <span className="text-xs font-medium text-slate-300">
                                      {item.title}
                                    </span>
                                    <span className="text-[10px] text-rose-400 font-bold uppercase">
                                      Locked
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() => navigate("/marketplace")}
                              className="px-5 py-2.5 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold uppercase tracking-wider rounded-[var(--tj-radius-sm,6px)] transition-colors border-0 cursor-pointer"
                            >
                              Browse NFT Editions
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] text-[var(--tj-color-text-secondary,#C2C7CD)]">
                        <Sparkles className="h-9 w-9 mb-3 opacity-30" />
                        <p className="text-xs font-semibold uppercase tracking-wider">
                          No bonus files attached to this release
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* About the Artist Card (Zero Top Border Line) */}
            <div className="p-5 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div
                  className="flex items-center gap-3.5 cursor-pointer group/artist min-w-0"
                  onClick={() => navigate(`/artist/${track.artistId}`)}
                >
                  <div className="relative shrink-0">
                    <img
                      src={artistAvatarSrc}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage(
                          `artist-${track.artistId}`,
                          200,
                          200
                        );
                      }}
                      className="w-14 h-14 rounded-full object-cover transition-transform group-hover/artist:scale-105"
                      alt={track.artist}
                    />
                    {isArtistVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-[var(--tj-color-surface-default,#0D1628)] rounded-full p-0.5">
                        <Verified className="h-4 w-4 text-[var(--tj-color-brand-primary,#00B4D8)] fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white truncate group-hover/artist:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                      {track.artist}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono tabular-nums mt-0.5">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {(artist?.followers || 0).toLocaleString()} followers
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" />
                        {(artist?.monthlyListeners || 0).toLocaleString()} monthly
                      </span>
                    </div>
                  </div>
                </div>

                {artistTargetUid && artistTargetUid !== userProfile?.uid && (
                  <button
                    onClick={() => toggleFollowUser(artistTargetUid)}
                    className={cn(
                      "px-4 py-2 rounded-[var(--tj-radius-sm,6px)] text-xs font-bold transition-colors border-0 cursor-pointer shrink-0",
                      isFollowingArtist
                        ? "bg-[var(--tj-color-surface-elevated,#111F36)] text-[var(--tj-color-brand-primary,#00B4D8)]"
                        : "bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    )}
                  >
                    {isFollowingArtist ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              <p className="text-sm text-[var(--tj-color-text-secondary,#C2C7CD)] leading-relaxed">
                {artist?.bio ||
                  `${track.artist} publishes tracks and collectible music editions on TonJam.`}
              </p>

              <button
                onClick={() => navigate(`/artist/${track.artistId}`)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-white transition-colors bg-transparent border-0 p-0 cursor-pointer"
              >
                View Full Artist Profile <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Comments Section */}
            <CommentsSection
              targetId={track.id}
              targetType="track"
              itemOwnerAddress={track.artist}
              creatorAddress={track.artistId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  isMono,
}: {
  label: string;
  value: string;
  isMono?: boolean;
}) => (
  <div className="p-3.5 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-elevated,#111F36)]/80">
    <p className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider mb-1">
      {label}
    </p>
    <p
      className={cn(
        "text-sm font-bold text-white",
        isMono && "font-mono text-xs break-all text-slate-300"
      )}
    >
      {value}
    </p>
  </div>
);

export default TrackDetail;

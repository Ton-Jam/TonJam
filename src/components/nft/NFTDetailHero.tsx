import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Check,
  ExternalLink,
  Activity,
  Music as MusicIcon,
  Zap,
  Award,
  Copy,
  Layers,
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useOptionalWallet } from "@/contexts/WalletContext";
import { NFTItem, Track } from "@/types";
import { getPlaceholderImage, cn } from "@/lib/utils";
import { getTonScanUrl, TON_NETWORK_MODE } from "@/services/tonService";
import ReactionsSection from "@/components/ReactionsSection";
import NFTAudioPreviewPlayer from "@/components/NFTAudioPreviewPlayer";
import { CollectionSummaryCards } from "@/components/marketplace/CollectionSummaryCards";
import { Interactive3DViewer } from "@/components/Interactive3DViewer";
import VerifiedArtistBadge from "@/components/common/VerifiedArtistBadge";

interface NFTDetailHeroProps {
  nft: NFTItem;
  associatedTrack: Track | null;
  isAuction: boolean;
  highestOfferPrice: number;
  onShare?: () => void;
  isOwner: boolean;
}

const formatShortAddress = (addr?: string) => {
  if (!addr) return "Unassigned";
  return addr.length > 14 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
};

export const NFTDetailHero: React.FC<NFTDetailHeroProps> = ({
  nft,
  associatedTrack,
  isOwner,
}) => {
  const navigate = useNavigate();
  const wallet = useOptionalWallet();
  const [copiedOwner, setCopiedOwner] = useState(false);

  const {
    allNFTs,
    artists,
    collections,
    transactions,
    userProfile,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
  } = useAudio();

  const activeNetwork = wallet?.network || TON_NETWORK_MODE;
  const networkLabel = activeNetwork === "testnet" ? "TON Testnet" : "TON Mainnet";

  const isCurrentTrack = Boolean(associatedTrack && currentTrack?.id === associatedTrack.id);
  const isTrackPlaying = Boolean(isCurrentTrack && isPlaying);

  const handlePlayClick = () => {
    if (associatedTrack) {
      if (isCurrentTrack) {
        togglePlay();
      } else {
        playTrack(associatedTrack);
      }
    } else if (nft.audioUrl) {
      playTrack({
        id: nft.trackId || nft.id,
        title: nft.title,
        artist: nft.creator || nft.artist || "Artist",
        artistId: nft.artistId || nft.creatorId || "",
        coverUrl: nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`),
        audioUrl: nft.audioUrl,
        duration: 180,
        genre: (nft as any).genre || "Electronic",
        isNFT: true,
      } as Track);
    }
  };

  const matchedCreator = artists.find(
    (a) =>
      a.name.toLowerCase() === (nft.creator || "").toLowerCase() ||
      a.uid === nft.creator ||
      a.uid === nft.creatorId ||
      a.uid === nft.artistId
  );

  const matchedOwner = artists.find(
    (a) =>
      (nft.owner && a.walletAddress === nft.owner) ||
      (nft.owner && a.name === nft.owner) ||
      (nft.ownerId && a.uid === nft.ownerId)
  );

  const matchedCollection = collections.find(
    (c) =>
      c.id === (nft as any).collectionId ||
      (Array.isArray(c.nftIds) && c.nftIds.includes(nft.id))
  );

  const isCreatorVerified = Boolean(
    matchedCreator?.verified || matchedCreator?.isVerifiedArtist || nft.artistVerified
  );

  const computedRank = React.useMemo(() => {
    if (!allNFTs || allNFTs.length === 0) return "—";
    const sorted = [...allNFTs].sort((a, b) => (b.views || 0) - (a.views || 0));
    const idx = sorted.findIndex((item) => item.id === nft.id);
    return idx >= 0 ? `#${idx + 1}` : "—";
  }, [allNFTs, nft.id]);

  const handleCreatorClick = () => {
    const targetId =
      matchedCreator?.uid ||
      nft.artistId ||
      nft.creatorId ||
      nft.creator?.toLowerCase().replace(/\s+/g, "-");
    if (targetId) {
      navigate(`/artist/${targetId}`);
    }
  };

  const handleOwnerClick = () => {
    if ((userProfile?.walletAddress && nft.owner === userProfile.walletAddress) || isOwner) {
      navigate("/profile");
    } else if (matchedOwner) {
      navigate(`/artist/${matchedOwner.uid}`);
    } else if (nft.owner) {
      navigate(`/user/${nft.owner}`);
    }
  };

  const handleCopyOwner = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nft.owner) return;
    navigator.clipboard.writeText(nft.owner);
    setCopiedOwner(true);
    setTimeout(() => setCopiedOwner(false), 1800);
  };

  const displayArtwork =
    nft.imageUrl || (nft as any).image || getPlaceholderImage(`nft-${nft.id}`);

  const editionParts = String(nft.edition || "1/1").split("/");
  const editionNumber = (nft as any).editionNumber || editionParts[0] || "1";
  const totalEditions = nft.supply || (nft as any).totalEditions || editionParts[1] || "1";

  const tonScanTarget = nft.contractAddress || nft.owner || "";

  return (
    <div className="space-y-5">
      {/* Top Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
        {/* Left Column: Square Artwork & Audio Specs */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-surface-default,#0D1628)] border-0">
            <Interactive3DViewer
              imageUrl={displayArtwork}
              title={nft.title}
              isActive={isCurrentTrack}
              isPlaying={isTrackPlaying}
              handlePlayClick={handlePlayClick}
              edition={nft.edition}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                label: "BPM",
                val: associatedTrack?.bpm || "—",
                icon: Activity,
                color: "text-[var(--tj-color-brand-primary,#00B4D8)]",
              },
              {
                label: "KEY",
                val: associatedTrack?.key || "—",
                icon: MusicIcon,
                color: "text-purple-400",
              },
              {
                label: "EDITION",
                val: `#${editionNumber} / ${totalEditions}`,
                icon: Zap,
                color: "text-emerald-400",
              },
              {
                label: "RANK",
                val: computedRank,
                icon: Award,
                color: "text-amber-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-3 rounded-[var(--tj-radius-sm,6px)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white font-mono tabular-nums truncate">
                  {stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Creator/Owner, Title, Collection, TonScan, Audio Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-4 text-left">
          {/* Creator & Current Owner Row (borderless split surfaces) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] border-0">
            <div
              onClick={handleCreatorClick}
              className="flex items-center gap-3 cursor-pointer group min-w-0"
              title="View Artist Profile"
            >
              <div className="relative w-10 h-10 rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-surface-elevated,#111F36)] shrink-0">
                <img
                  src={matchedCreator?.avatarUrl || getPlaceholderImage(`artist-${nft.creator || nft.id}`)}
                  className="w-full h-full object-cover"
                  alt={nft.creator || "Creator"}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(`artist-${nft.id}`);
                  }}
                />
                {isCreatorVerified && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--tj-color-brand-primary,#00B4D8)] flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
                  Creator
                </span>
                <span className="text-xs font-bold text-white group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors flex items-center gap-1 truncate">
                  <span className="truncate">{nft.creator || nft.artist || "Artist"}</span>
                  <VerifiedArtistBadge
                    artistName={nft.creator}
                    isVerified={isCreatorVerified}
                    size="sm"
                  />
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 min-w-0 sm:pl-3">
              <div
                onClick={handleOwnerClick}
                className="flex items-center gap-3 cursor-pointer group min-w-0"
                title="View Collector Profile"
              >
                <div className="relative w-10 h-10 rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-surface-elevated,#111F36)] flex items-center justify-center shrink-0">
                  {matchedOwner?.avatarUrl ? (
                    <img
                      src={matchedOwner.avatarUrl}
                      className="w-full h-full object-cover"
                      alt={matchedOwner.name || "Owner"}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-4 w-4 text-[var(--tj-color-text-secondary,#C2C7CD)]" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
                    Owner
                  </span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                    {isOwner ? (
                      "You"
                    ) : nft.owner ? (
                      <span className="font-mono text-[var(--tj-color-brand-primary,#00B4D8)]">
                        {formatShortAddress(nft.owner)}
                      </span>
                    ) : (
                      "Unassigned"
                    )}
                  </span>
                </div>
              </div>

              {nft.owner && (
                <button
                  type="button"
                  onClick={handleCopyOwner}
                  aria-label="Copy owner address"
                  className="p-2 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white border-0 cursor-pointer shrink-0 transition-colors"
                  title="Copy Owner Address"
                >
                  {copiedOwner ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Collection, Network & TonScan Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                matchedCollection
                  ? navigate(`/collections/${matchedCollection.id}`)
                  : undefined
              }
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-default,#0D1628)] border-0 text-[11px] font-semibold transition-colors",
                matchedCollection
                  ? "text-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-surface-hover,#132B49)] hover:text-white cursor-pointer"
                  : "text-[var(--tj-color-text-secondary,#C2C7CD)] cursor-default"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {matchedCollection?.name ||
                  (nft as any).collectionName ||
                  "Single Release"}
              </span>
            </button>

            <span className="px-2.5 py-1.5 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-default,#0D1628)] border-0 text-[11px] font-mono text-[var(--tj-color-text-secondary,#C2C7CD)]">
              {networkLabel}
            </span>

            {tonScanTarget && (
              <a
                href={getTonScanUrl(tonScanTarget, false, activeNetwork)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-white transition-colors bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border-0 px-2.5 py-1.5 rounded-[var(--tj-radius-xs,4px)]"
              >
                <span>View on TonScan</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Title & Metadata Line */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {nft.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono tabular-nums">
              <span>ID {nft.id.slice(0, 10).toUpperCase()}</span>
              <span>·</span>
              <span className="text-[var(--tj-color-brand-primary,#00B4D8)] font-semibold">
                Edition #{editionNumber} of {totalEditions}
              </span>
              {nft.views !== undefined && (
                <>
                  <span>·</span>
                  <span>{nft.views.toLocaleString()} views</span>
                </>
              )}
            </div>

            <div className="pt-1">
              <ReactionsSection targetId={nft.id} targetType="nft" />
            </div>
          </div>

          <CollectionSummaryCards
            nft={nft}
            allNFTs={allNFTs}
            collections={collections}
            transactions={transactions}
          />

          <NFTAudioPreviewPlayer
            nft={nft}
            variant="full"
            title={nft.title}
            artist={nft.artist || nft.creator}
          />
        </div>
      </div>
    </div>
  );
};

export default NFTDetailHero;

import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Check, ExternalLink, Share2, Activity, 
  Music as MusicIcon, Zap, Award 
} from "lucide-react";
import { MOCK_ARTISTS } from "@/constants";
import { useAudio } from "@/contexts/AudioContext";
import { NFTItem, Track } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";
import ReactionsSection from "@/components/ReactionsSection";
import NFTAudioPreviewPlayer from "@/components/NFTAudioPreviewPlayer";
import { CollectionSummaryCards } from "@/components/marketplace/CollectionSummaryCards";
import { Interactive3DViewer } from "@/components/Interactive3DViewer";
import NFTCard from "@/components/NFTCard";

interface NFTDetailHeroProps {
  nft: NFTItem;
  associatedTrack: Track | null;
  isAuction: boolean;
  highestOfferPrice: number;
  onShare: () => void;
  isOwner: boolean;
}

export const NFTDetailHero: React.FC<NFTDetailHeroProps> = ({
  nft,
  associatedTrack,
  isAuction,
  highestOfferPrice,
  onShare,
  isOwner,
}) => {
  const navigate = useNavigate();
  const { allNFTs, collections, transactions, userProfile, currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  const isCurrentTrack = associatedTrack && currentTrack?.id === associatedTrack.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;
  const handlePlayClick = () => {
    if (associatedTrack) {
      if (isCurrentTrack) {
        togglePlay();
      } else {
        playTrack(associatedTrack);
      }
    }
  };

  const matchedCreator = MOCK_ARTISTS.find(
    (a) => a.name.toLowerCase() === nft.creator?.toLowerCase() || a.uid === nft.creator
  );

  const matchedOwner = MOCK_ARTISTS.find(
    (a) => a.walletAddress === nft.owner || a.name === nft.owner || a.uid === nft.ownerId
  );

  const handleCreatorClick = () => {
    const targetId = matchedCreator?.uid || nft.creator?.toLowerCase().replace(/\s+/g, '-');
    if (targetId) {
      navigate(`/artist/${targetId}`);
    }
  };

  const handleOwnerClick = () => {
    if (nft.owner === userProfile?.walletAddress || isOwner) {
      navigate("/profile");
    } else if (matchedOwner) {
      navigate(`/artist/${matchedOwner.uid}`);
    } else if (nft.owner) {
      navigate(`/user/${nft.owner}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Media & Visual Hero Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Artwork Showcase & Hardware Specs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
            <Interactive3DViewer
              imageUrl={nft.imageUrl || (nft as any).image || getPlaceholderImage(`nft-${nft.id}`)}
              title={nft.title}
              isActive={Boolean(isCurrentTrack)}
              isPlaying={Boolean(isTrackPlaying)}
              handlePlayClick={handlePlayClick}
              edition={nft.edition}
            />
          </div>

          {/* Hardware-style Audio Profile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                label: "BPM",
                val: associatedTrack?.bpm || "128",
                icon: Activity,
                color: "text-blue-400",
              },
              {
                label: "KEY",
                val: associatedTrack?.key || "C#m",
                icon: MusicIcon,
                color: "text-purple-400",
              },
              {
                label: "BIT",
                val: associatedTrack?.bitrate || "FLAC",
                icon: Zap,
                color: "text-emerald-400",
              },
              {
                label: "RANK",
                val: "#12",
                icon: Award,
                color: "text-amber-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/[0.03] hover:bg-white/[0.06] p-3 rounded-xl transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <stat.icon className={`h-3 w-3 ${stat.color} opacity-70`} />
                </div>
                <p className="text-sm font-bold text-white font-mono tracking-tight">
                  {stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Identities, Titles, Audio Preview & Collections */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Creator & Owner Identity Pills */}
          <div className="flex flex-wrap items-center gap-6 p-3 rounded-2xl bg-white/[0.02]">
            {/* Creator profile */}
            <div
              onClick={handleCreatorClick}
              className="flex items-center gap-3 cursor-pointer group transition-opacity hover:opacity-90"
              title="View Public Artist Profile"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-900 ring-2 ring-[#0052FF]/30">
                <img
                  src={matchedCreator?.avatarUrl || getPlaceholderImage(`artist-${nft.creator}`)}
                  className="w-full h-full object-cover"
                  alt={nft.creator}
                />
                {(matchedCreator?.verified || true) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0052FF] rounded-full flex items-center justify-center">
                    <Check className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Original Creator
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-[#0098EA] transition-colors flex items-center gap-1">
                  {nft.creator}
                </span>
              </div>
            </div>

            {/* Current Owner profile */}
            <div
              onClick={handleOwnerClick}
              className="flex items-center gap-3 cursor-pointer group transition-opacity hover:opacity-90"
              title="View Owner Profile"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                {matchedOwner?.avatarUrl ? (
                  <img
                    src={matchedOwner.avatarUrl}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <User className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Current Owner
                </span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-tight group-hover:text-white transition-colors">
                  {isOwner ? (
                    "You (Connected Wallet)"
                  ) : nft.owner ? (
                    <span className="font-mono text-[#0098EA]">
                      {nft.owner.length > 12 ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}` : nft.owner}
                    </span>
                  ) : (
                    "Vault"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Title and Reactions */}
          <div className="space-y-2 pt-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              {nft.title}
            </h1>

            <ReactionsSection targetId={nft.id} targetType="nft" />
          </div>

          {/* Metadata Row: Protocol ID, Views & Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Protocol ID:
              </span>
              <span className="text-[10px] font-mono text-[#0098EA] uppercase font-bold">
                {nft.id.toUpperCase()}
              </span>

              {nft.views !== undefined && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                    {nft.views.toLocaleString()} Protocol Accesses
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {nft.contractAddress && (
                <a
                  href={`https://tonviewer.com/${nft.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Explorer <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
              >
                Share <Share2 className="h-3.5 w-3.5 text-[#0098EA]" />
              </button>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <CollectionSummaryCards
            nft={nft}
            allNFTs={allNFTs}
            collections={collections}
            transactions={transactions}
          />

          {/* 30-Second Audio Snippet Preview */}
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

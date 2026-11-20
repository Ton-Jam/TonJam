import React, { useMemo } from "react";
import { Gem, ArrowUpRight, Coins, Layers, Percent, Tag } from "lucide-react";
import { Track, NFTItem } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";

interface NFTCardProps {
  track: Track | null;
  nftDetails?: NFTItem | null;
  onClosePlayer?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = React.memo(({
  track,
  nftDetails,
  onClosePlayer,
}) => {
  const navigate = useNavigate();
  const { allNFTs = [] } = useAudio();

  const matchedNFT = useMemo(() => {
    if (nftDetails) return nftDetails;
    if (!track) return null;
    return (
      allNFTs.find(
        (n) =>
          (track.nftId && n.id === track.nftId) ||
          n.trackId === track.id
      ) || null
    );
  }, [nftDetails, allNFTs, track]);

  if (!track) return null;

  const isNFT = Boolean(track.isNFT || matchedNFT);
  const rawPrice = matchedNFT?.price || track.nftPrice || track.price;
  const priceDisplay = rawPrice
    ? String(rawPrice).toUpperCase().includes("TON")
      ? String(rawPrice)
      : `${rawPrice} TON`
    : "Not Listed";
  const collectionName =
    matchedNFT?.nftCollection || track.nftCollection || track.album || `${track.artist} Releases`;
  const editionDisplay = matchedNFT?.edition
    ? matchedNFT.edition
    : matchedNFT?.supply || track.editions
    ? `${track.minted ?? 1}/${matchedNFT?.supply || track.editions}`
    : "—";
  const royaltyPct = matchedNFT?.royalty ? `${matchedNFT.royalty}%` : "—";
  const listingStatus = matchedNFT?.isAuction
    ? "Live Auction"
    : matchedNFT
    ? "Listed"
    : isNFT
    ? "Minted"
    : "Track Only";

  const handleOpenDetails = () => {
    if (onClosePlayer) onClosePlayer();
    if (matchedNFT?.id || track.nftId) {
      navigate(`/nft/${matchedNFT?.id || track.nftId}`);
    } else if (isNFT) {
      navigate("/marketplace");
    } else {
      navigate(`/track/${track.id}`);
    }
  };

  return (
    <div className="w-full bg-[#0A113A] rounded-[var(--tj-radius-md,10px)] p-4 text-[#F2F4F8] select-none space-y-4 border-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F2F4F8]">
            Music NFT Collectible
          </h4>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-[var(--tj-radius-compact,5px)] text-[10px] font-black uppercase tracking-wider ${
            isNFT
              ? "bg-emerald-950/40 text-emerald-400"
              : "bg-[#050A24] text-[#9AA0AE]"
          }`}
        >
          {isNFT ? "Minted On TON" : "Standard Track"}
        </span>
      </div>

      {/* Collection Info & Navigation */}
      <div className="flex items-center justify-between bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-3 gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9AA0AE] font-semibold">Collection</span>
          <span className="text-xs font-bold text-[#F2F4F8] truncate">{collectionName}</span>
        </div>
        <button
          type="button"
          onClick={handleOpenDetails}
          className="flex items-center gap-1 px-3 py-1.5 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all active:scale-95 shrink-0 border-none cursor-pointer"
        >
          <span>{matchedNFT || track.nftId ? "View NFT" : isNFT ? "Marketplace" : "Track Details"}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Coins className="w-3 h-3 text-[var(--tj-color-brand-primary,#00B4D8)]" /> Price
          </span>
          <span className="text-xs font-bold text-emerald-400 truncate block">{priceDisplay}</span>
        </div>

        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Tag className="w-3 h-3 text-amber-400" /> Status
          </span>
          <span className="text-xs font-bold text-[#F2F4F8] truncate block">{listingStatus}</span>
        </div>

        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Edition
          </span>
          <span className="text-xs font-bold text-[#F2F4F8] truncate block">{editionDisplay}</span>
        </div>

        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Percent className="w-3 h-3 text-white" /> Royalty
          </span>
          <span className="text-xs font-bold text-[#F2F4F8] truncate block">{royaltyPct}</span>
        </div>
      </div>
    </div>
  );
});

NFTCard.displayName = "NFTCard";

export default NFTCard;

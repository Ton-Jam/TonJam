import React, { useState } from "react";
import { Gem, ArrowUpRight, Send, Coins, Users, Percent, Tag, ExternalLink } from "lucide-react";
import { Track, NFTItem } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NFTCardProps {
  track: Track | null;
  nftDetails?: NFTItem | null;
  onClosePlayer?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  track,
  nftDetails,
  onClosePlayer
}) => {
  const navigate = useNavigate();
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferAddress, setTransferAddress] = useState<string>("");

  if (!track) return null;

  const isNFT = track.isNFT || Boolean(nftDetails);
  const floorPrice = track.nftPrice || nftDetails?.price || "2.5";
  const collectionName = track.nftCollection || "TonJam Genesis Audio";
  const royaltyPct = "7.5%";
  const ownersCount = "142";
  const highestBid = "3.1 TON";

  const handleOpenMarketplace = () => {
    if (onClosePlayer) onClosePlayer();
    if (nftDetails?.id || track.nftId) {
      navigate(`/nft/${nftDetails?.id || track.nftId || track.id}`);
    } else {
      navigate("/marketplace");
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAddress || transferAddress.length < 5) {
      toast.error("Please enter a valid TON wallet address");
      return;
    }
    toast.success(`NFT transfer initiated to ${transferAddress.slice(0, 6)}...${transferAddress.slice(-4)}`);
    setShowTransferModal(false);
    setTransferAddress("");
  };

  return (
    <div className="w-full bg-[#0A113A] border border-[#16244F] rounded-[18px] p-4 text-[#F2F4F8] select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#16244F]/60">
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-[#0098EA]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F2F4F8]">
            Web3 Music NFT Collectible
          </h4>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider border ${
            isNFT
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
              : "bg-[#050A24] border-[#16244F] text-[#9AA0AE]"
          }`}
        >
          {isNFT ? "Minted On TON" : "Available to Mint"}
        </span>
      </div>

      {/* Collection Info */}
      <div className="flex items-center justify-between bg-[#050A24] border border-[#16244F] rounded-[12px] p-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#9AA0AE] font-semibold">Collection</span>
          <span className="text-xs font-bold text-[#F2F4F8]">{collectionName}</span>
        </div>
        <button
          onClick={handleOpenMarketplace}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#0098EA] hover:bg-[#0098EA]/90 text-white rounded-[10px] text-xs font-bold transition-all active:scale-95"
        >
          <span>Marketplace</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Coins className="w-3 h-3 text-[#0098EA]" /> Floor Price
          </span>
          <span className="text-xs font-bold text-emerald-400">{floorPrice} TON</span>
        </div>

        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Tag className="w-3 h-3 text-amber-400" /> Top Bid
          </span>
          <span className="text-xs font-bold text-[#F2F4F8]">{highestBid}</span>
        </div>

        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Users className="w-3 h-3 text-cyan-400" /> Unique Owners
          </span>
          <span className="text-xs font-bold text-[#F2F4F8]">{ownersCount}</span>
        </div>

        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5">
          <span className="text-[10px] text-[#9AA0AE] flex items-center gap-1 mb-1">
            <Percent className="w-3 h-3 text-white" /> Creator Royalty
          </span>
          <span className="text-xs font-bold text-[#F2F4F8]">{royaltyPct}</span>
        </div>
      </div>

      {/* Transfer NFT Section */}
      {isNFT && (
        <div className="pt-2 border-t border-[#16244F]/40 flex items-center justify-between">
          <span className="text-[11px] text-[#9AA0AE]">Direct On-Chain Transfer</span>
          <button
            onClick={() => setShowTransferModal(!showTransferModal)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#050A24] border border-[#16244F] hover:border-[#0098EA] text-[#F2F4F8] rounded-[10px] text-xs font-semibold transition-all"
          >
            <Send className="w-3 h-3 text-[#0098EA]" />
            <span>Transfer NFT</span>
          </button>
        </div>
      )}

      {/* Transfer Modal Form inline */}
      {showTransferModal && (
        <form onSubmit={handleTransfer} className="p-3 bg-[#050A24] border border-[#0098EA]/40 rounded-[12px] space-y-2 mt-2">
          <label className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider block">
            Recipient TON Address
          </label>
          <input
            type="text"
            placeholder="EQA... or user.ton"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            className="w-full bg-[#0A113A] border border-[#16244F] rounded-[10px] px-3 py-2 text-xs text-[#F2F4F8] focus:outline-none focus:border-[#0098EA]"
          />
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowTransferModal(false)}
              className="px-3 py-1 bg-[#0A113A] text-[#9AA0AE] rounded-[8px] text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-[#0098EA] text-white rounded-[8px] text-xs font-bold"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NFTCard;

import React, { useState } from "react";
import { 
  Wand2, ArrowRightLeft, Handshake, Gavel, 
  ExternalLink, Copy, Check, QrCode 
} from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { QRCodeSVG } from "qrcode.react";
import { NFTItem } from "@/types";
import { NFTChart } from "@/components/NFTChart";
import { RecentBidsList } from "@/components/RecentBidsList";

interface NFTActivityProps {
  nft: NFTItem;
  salesData: { date: string; value: number }[];
  isAuction: boolean;
  highestOfferPrice: number;
}

export const NFTActivity: React.FC<NFTActivityProps> = ({
  nft,
  salesData,
  isAuction,
  highestOfferPrice,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    if (nft.contractAddress) {
      navigator.clipboard.writeText(nft.contractAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const sortedHistory = [...(nft.history || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* 1. Sales Volume / Floor Trend Chart */}
      <div className="bg-white/[0.03] p-5 sm:p-7 rounded-2xl shadow-xl">
        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
          Market Activity & Volume Trend
        </h3>
        <NFTChart data={salesData} />
      </div>

      {/* 2. Provenance & Contract Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] p-5 rounded-2xl flex flex-col justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            Mint & Standard
          </h4>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Standard</span>
              <span className="font-mono font-bold text-[#0098EA]">TON NFT-v2 (Music)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Consensus Layer</span>
              <span className="font-bold text-white">Global TON Workchain</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mint Date</span>
              <span className="font-mono text-slate-200">{nft.history?.[0]?.date || "Genesis 2026"}</span>
            </div>
          </div>
        </div>

        {nft.contractAddress && (
          <div className="col-span-1 md:col-span-2 bg-white/[0.03] p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5">
            <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0">
              <QRCodeSVG
                value={`https://tonviewer.com/${nft.contractAddress}`}
                size={96}
                bgColor="#ffffff"
                fgColor="#050A24"
                level="M"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Smart Contract Identifier
              </span>
              <div className="flex items-center justify-between bg-white/[0.04] px-3 py-2 rounded-xl text-xs font-mono text-slate-300">
                <span className="truncate mr-2">{nft.contractAddress}</span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy contract address"
                >
                  {copiedAddress ? (
                    <span className="text-emerald-400 font-bold text-[10px]">Copied</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <a
                href={`https://tonviewer.com/${nft.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider pt-1"
              >
                Inspect On TonViewer <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. Active Bids (If in Auction mode) */}
      {isAuction && (
        <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" /> Active Bids Stream
            </h4>
            <span className="text-xs font-mono text-[#0098EA] font-bold">
              Leading: {highestOfferPrice} TON
            </span>
          </div>
          <RecentBidsList offers={nft.offers} highestOfferPrice={highestOfferPrice} />
        </div>
      )}

      {/* 4. Complete Ledger History Timeline */}
      <div className="bg-white/[0.03] p-5 sm:p-7 rounded-2xl space-y-4">
        <h4 className="text-sm font-black uppercase tracking-wider text-white">
          On-Chain Provenance & History
        </h4>

        <div className="h-[420px] overflow-hidden">
          {sortedHistory.length > 0 ? (
            <Virtuoso
              style={{ height: "100%", width: "100%" }}
              data={sortedHistory}
              itemContent={(idx, item) => (
                <div className="pb-3" key={(item as any).id || idx}>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          item.event === "Minted"
                            ? "bg-blue-500/20 text-[#0098EA]"
                            : item.event === "Sold"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.event === "Bid"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {item.event === "Minted" ? (
                          <Wand2 className="w-4 h-4" />
                        ) : item.event === "Sold" ? (
                          <Handshake className="w-4 h-4" />
                        ) : item.event === "Bid" ? (
                          <Gavel className="w-4 h-4" />
                        ) : (
                          <ArrowRightLeft className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-white">
                            {item.event}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.date}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          From <strong className="text-slate-200">{item.from?.slice(0, 8)}...</strong> to{" "}
                          <strong className="text-slate-200">{item.to?.slice(0, 8)}...</strong>
                        </div>
                      </div>
                    </div>

                    {item.price && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black font-mono text-emerald-400">
                          {item.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-slate-400 text-xs">
              No previous ledger transactions recorded for this asset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTActivity;

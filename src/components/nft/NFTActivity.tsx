import React from "react";
import {
  Wand2,
  ArrowRightLeft,
  Handshake,
  Gavel,
} from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { NFTItem } from "@/types";
import { NFTChart } from "@/components/NFTChart";
import { RecentBidsList } from "@/components/RecentBidsList";
import { TON_NETWORK_MODE } from "@/services/tonService";

interface NFTActivityProps {
  nft: NFTItem;
  salesData: { date: string; value: number }[];
  isAuction: boolean;
  highestOfferPrice: number;
}

const formatShortParty = (val?: string) => {
  if (!val) return "Unknown";
  return val.length > 14 ? `${val.slice(0, 6)}...${val.slice(-4)}` : val;
};

export const NFTActivity: React.FC<NFTActivityProps> = ({
  nft,
  salesData,
  isAuction,
  highestOfferPrice,
}) => {
  const networkLabel =
    TON_NETWORK_MODE === "testnet" ? "TON Testnet" : "TON Mainnet";

  const sortedHistory = [...(nft.history || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-4 sm:p-5 rounded-[var(--tj-radius-md,8px)]">
        <NFTChart data={salesData} />
      </div>

      <div className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-4 sm:p-5 rounded-[var(--tj-radius-md,8px)]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--tj-color-text-secondary,#C2C7CD)] mb-3">
          Mint & Standard
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)]">
            <span className="text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider block mb-1">
              Standard
            </span>
            <span className="font-mono font-bold text-[var(--tj-color-brand-primary,#00B4D8)]">
              TEP-62 Music NFT
            </span>
          </div>
          <div className="p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)]">
            <span className="text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider block mb-1">
              Network
            </span>
            <span className="font-bold text-white">{networkLabel}</span>
          </div>
          <div className="p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)]">
            <span className="text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider block mb-1">
              Mint Date
            </span>
            <span className="font-mono text-slate-200">
              {nft.history?.[0]?.date ||
                (nft.createdAt ? new Date(nft.createdAt).toLocaleDateString() : "Unavailable")}
            </span>
          </div>
        </div>
      </div>

      {isAuction && (
        <div className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-4 sm:p-5 rounded-[var(--tj-radius-md,8px)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" /> Bid History
            </h4>
            <span className="text-xs font-mono text-[var(--tj-color-brand-primary,#00B4D8)] font-bold tabular-nums">
              Highest: {highestOfferPrice} TON
            </span>
          </div>
          <RecentBidsList offers={nft.offers} highestOfferPrice={highestOfferPrice} />
        </div>
      )}

      <div className="bg-[var(--tj-color-surface-default,#0D1628)] border-0 p-4 sm:p-5 rounded-[var(--tj-radius-md,8px)] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Transaction History
        </h4>

        <div className="h-[340px] overflow-hidden">
          {sortedHistory.length > 0 ? (
            <Virtuoso
              style={{ height: "100%", width: "100%" }}
              data={sortedHistory}
              itemContent={(idx, item) => (
                <div className="pb-2.5" key={(item as any).id || idx}>
                  <div className="flex items-center justify-between p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border-0 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-[var(--tj-radius-xs,4px)] flex items-center justify-center shrink-0 ${
                          item.event === "Minted"
                            ? "bg-blue-500/20 text-[var(--tj-color-brand-primary,#00B4D8)]"
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
                          <span className="text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono">
                            {item.date}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono truncate">
                          From{" "}
                          <strong className="text-slate-200">
                            {formatShortParty(item.from)}
                          </strong>{" "}
                          to{" "}
                          <strong className="text-slate-200">
                            {formatShortParty(item.to)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {item.price && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black font-mono tabular-nums text-emerald-400">
                          {item.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 text-[var(--tj-color-text-secondary,#C2C7CD)] text-xs">
              No transaction history recorded for this NFT yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTActivity;

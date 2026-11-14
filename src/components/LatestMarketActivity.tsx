import React, { useState, useEffect } from "react";
import { Check, Copy, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { getPlaceholderImage } from "@/lib/utils";
import confetti from "canvas-confetti";

export interface NFTTransaction {
  id: string;
  itemTitle: string;
  itemImage: string;
  buyerAddress: string;
  buyerName?: string;
  salePrice: string;
  priceCurrency: string;
  timestamp: string;
  type: "SALE" | "MINT" | "BID";
  txHash: string;
}

const formatRelativeTimestamp = (ts: any): string => {
  if (!ts) return "Recently";
  const ms = typeof ts?.toMillis === "function"
    ? ts.toMillis()
    : typeof ts?.seconds === "number"
      ? ts.seconds * 1000
      : typeof ts === "number"
        ? ts
        : Date.parse(String(ts));
  if (!ms || isNaN(ms)) return "Recently";
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const LatestMarketActivity: React.FC = () => {
  const [transactions, setTransactions] = useState<NFTTransaction[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "nftSales"), orderBy("timestamp", "desc"), limit(15));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows: NFTTransaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const buyerRaw = String(data.buyerAddress || data.buyerWallet || data.buyerId || "Unknown");
          const shortAddr = buyerRaw.length > 10
            ? `${buyerRaw.slice(0, 4)}...${buyerRaw.slice(-4)}`
            : buyerRaw;
          const typeRaw = String(data.type || "SALE").toUpperCase();
          const type: "SALE" | "MINT" | "BID" =
            typeRaw === "MINT" ? "MINT" : typeRaw === "BID" ? "BID" : "SALE";

          rows.push({
            id: docSnap.id,
            itemTitle: data.title || data.nftTitle || data.itemTitle || "Music NFT",
            itemImage: data.imageUrl || data.coverUrl || data.itemImage || getPlaceholderImage(`nft-${docSnap.id}`),
            buyerAddress: buyerRaw,
            buyerName: data.buyerName || shortAddr,
            salePrice: String(data.salePrice ?? data.price ?? "0"),
            priceCurrency: data.currency || "TON",
            timestamp: formatRelativeTimestamp(data.timestamp || data.createdAt),
            type,
            txHash: String(data.txHash || docSnap.id),
          });
        });
        setTransactions(rows);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "nftSales");
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCopyAddress = (e: React.MouseEvent, address: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-lg font-black text-white">Latest Market Activity</h2>
          <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-500/10 text-emerald-400 rounded-full uppercase tracking-wider">
            Live Feed
          </span>
        </div>
        <span className="text-[10px] text-[#9AA0AE] font-semibold">
          TON Blockchain
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-[#0A113A]/50 p-3.5">
        {transactions.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
            <Activity className="w-5 h-5 text-[#9AA0AE]/60" />
            <p className="text-xs text-[#9AA0AE]">No on-chain market activity recorded yet.</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 scroll-smooth">
            <AnimatePresence initial={false}>
              {transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, scale: 0.9, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-[240px] shrink-0 rounded-xl bg-[#050A24] p-3 flex flex-col justify-between space-y-2.5 hover:bg-[#101A3B] transition-colors cursor-pointer group relative"
                  onClick={() => confetti({ particleCount: 15, spread: 30 })}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-white/5">
                      <img
                        src={tx.itemImage}
                        alt={tx.itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          tx.type === "MINT"
                            ? "bg-purple-500/20 text-purple-300"
                            : tx.type === "BID"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {tx.type}
                        </span>
                        <span className="text-[9px] text-[#9AA0AE] ml-auto shrink-0 font-medium">
                          {tx.timestamp}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white truncate group-hover:text-[#0098EA] transition-colors">
                        {tx.itemTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-[#9AA0AE] shrink-0 font-semibold">Buyer:</span>
                      <button
                        onClick={(e) => handleCopyAddress(e, tx.buyerAddress, tx.id)}
                        className="relative min-h-[44px] min-w-[44px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-slate-200 text-[10px] font-mono transition-all border-none cursor-pointer"
                        title="Click to copy buyer address"
                      >
                        <span className="truncate max-w-[90px]">{tx.buyerName || tx.buyerAddress}</span>
                        {copiedId === tx.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-[#9AA0AE] opacity-60" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-xs font-black text-emerald-400">
                        {tx.salePrice}
                      </span>
                      <span className="text-[9px] font-bold text-[#0098EA]">
                        {tx.priceCurrency}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestMarketActivity;

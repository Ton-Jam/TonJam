import React, { useState, useEffect } from "react";
import { ShoppingBag, ArrowUpRight, Copy, Check, Sparkles, ExternalLink, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TON_LOGO } from "@/constants";
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

const INITIAL_TRANSACTIONS: NFTTransaction[] = [
  {
    id: "tx-1",
    itemTitle: "Solar Pulse Genesis #04",
    itemImage: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=200&height=200&nologo=true",
    buyerAddress: "EQB8...f91a",
    buyerName: "Alex.ton",
    salePrice: "12.5",
    priceCurrency: "TON",
    timestamp: "Just now",
    type: "SALE",
    txHash: "0x89f2...a12c"
  },
  {
    id: "tx-2",
    itemTitle: "Aura Beat Legendary #02",
    itemImage: "https://image.pollinations.ai/prompt/glowing%20aesthetic%20crystal%20sound%20waves%20artwork?width=200&height=200&nologo=true",
    buyerAddress: "EQD1...904b",
    buyerName: "VibesCollector",
    salePrice: "25.0",
    priceCurrency: "TON",
    timestamp: "2m ago",
    type: "SALE",
    txHash: "0x34c1...e901"
  },
  {
    id: "tx-3",
    itemTitle: "Neon Nights Dubstep #88",
    itemImage: "https://image.pollinations.ai/prompt/dubstep%20music%20album%20cover%20neon%20green%20laser%20retro?width=200&height=200&nologo=true",
    buyerAddress: "EQC4...2291",
    salePrice: "4.8",
    priceCurrency: "TON",
    timestamp: "5m ago",
    type: "MINT",
    txHash: "0x7a80...1b4d"
  },
  {
    id: "tx-4",
    itemTitle: "Cyber Punk Rap Vault #03",
    itemImage: "https://image.pollinations.ai/prompt/cyberpunk%20rapper%20gold%20teeth%20hologram%20neon%20art?width=200&height=200&nologo=true",
    buyerAddress: "EQA2...441e",
    buyerName: "WhaleRider.ton",
    salePrice: "24.0",
    priceCurrency: "TON",
    timestamp: "8m ago",
    type: "BID",
    txHash: "0x1d99...6e32"
  },
  {
    id: "tx-5",
    itemTitle: "Deep Abyssal Audio #15",
    itemImage: "https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20ocean%20album%20art?width=200&height=200&nologo=true",
    buyerAddress: "EQB0...338c",
    salePrice: "8.0",
    priceCurrency: "TON",
    timestamp: "12m ago",
    type: "SALE",
    txHash: "0x91ef...228f"
  },
  {
    id: "tx-6",
    itemTitle: "Dreamweaver Velvet #09",
    itemImage: "https://image.pollinations.ai/prompt/dreamy%20pink%20clouds%20golden%20moon%20synthesizer%20art?width=200&height=200&nologo=true",
    buyerAddress: "EQE7...112a",
    buyerName: "LunaFan99",
    salePrice: "15.0",
    priceCurrency: "TON",
    timestamp: "18m ago",
    type: "SALE",
    txHash: "0x55d0...41bc"
  }
];

const NEW_TRANSACTION_POOL: Omit<NFTTransaction, "id" | "timestamp">[] = [
  {
    itemTitle: "Decentralized Amapiano #07",
    itemImage: "https://image.pollinations.ai/prompt/african%20tribal%20future%20amapiano%20gold%20pattern%20cover?width=200&height=200&nologo=true",
    buyerAddress: "EQF5...881c",
    buyerName: "MajorBeats.ton",
    salePrice: "9.5",
    priceCurrency: "TON",
    type: "SALE",
    txHash: "0x66a1...99e1"
  },
  {
    itemTitle: "Interstellar Anthem #01",
    itemImage: "https://image.pollinations.ai/prompt/galaxy%20retro%20organ%20scifi%20music%20album%20art?width=200&height=200&nologo=true",
    buyerAddress: "EQC9...302f",
    salePrice: "18.5",
    priceCurrency: "TON",
    type: "MINT",
    txHash: "0x82b3...11d4"
  },
  {
    itemTitle: "Golden Horizon Lofi #10",
    itemImage: "https://image.pollinations.ai/prompt/golden%20hour%20sunrise%20retro%20car%20lofi%20beats%20cover?width=200&height=200&nologo=true",
    buyerAddress: "EQA1...009d",
    buyerName: "ChillCollector",
    salePrice: "2.9",
    priceCurrency: "TON",
    type: "SALE",
    txHash: "0x11c2...77f0"
  }
];

export const LatestMarketActivity: React.FC = () => {
  const [transactions, setTransactions] = useState<NFTTransaction[]>(INITIAL_TRANSACTIONS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);

  // Simulate new live sales periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const randomPoolItem = NEW_TRANSACTION_POOL[Math.floor(Math.random() * NEW_TRANSACTION_POOL.length)];
        const newTx: NFTTransaction = {
          ...randomPoolItem,
          id: `tx-live-${Date.now()}`,
          timestamp: "Just now"
        };
        setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyAddress = (e: React.MouseEvent, address: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Header section without border lines */}
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

      {/* Main scrolling horizontal feed container */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-[#0A113A]/50 p-3.5"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
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
                {/* Top Row: Thumbnail + Title & Type */}
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

                {/* Bottom Row: Buyer & Sale Price */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  {/* Buyer details */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-[#9AA0AE] shrink-0 font-semibold">Buyer:</span>
                    <button
                      onClick={(e) => handleCopyAddress(e, tx.buyerAddress, tx.id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] font-mono transition-colors border-none"
                      title="Click to copy buyer address"
                    >
                      <span>{tx.buyerName || tx.buyerAddress}</span>
                      {copiedId === tx.id ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-[#9AA0AE] opacity-60" />
                      )}
                    </button>
                  </div>

                  {/* Sale Price */}
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
      </div>
    </div>
  );
};

export default LatestMarketActivity;

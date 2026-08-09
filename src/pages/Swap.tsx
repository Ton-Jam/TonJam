import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowDownUp, 
  RefreshCw, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Music, 
  Coins, 
  Info, 
  Search, 
  X, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  BarChart2, 
  Flame,
  Layers,
  ArrowUpRight,
  Plus,
  Filter,
  Shuffle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/contexts/AudioContext";
import { useNFT } from "@/contexts/NFTContext";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { TON_LOGO, TJ_COIN_ICON, MOCK_NFTS } from "@/constants";
import { NFTItem } from "@/types";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export interface CryptoToken {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  priceUsd: number;
  decimals: number;
  color: string;
}

const SUPPORTED_TOKENS: CryptoToken[] = [
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    icon: TON_LOGO,
    balance: 14.85,
    priceUsd: 5.30,
    decimals: 9,
    color: "#0098EA"
  },
  {
    id: "jam",
    symbol: "JAM",
    name: "TonJam Token",
    icon: TJ_COIN_ICON,
    balance: 1250,
    priceUsd: 0.12,
    decimals: 6,
    color: "#5B6BFF"
  },
  {
    id: "not",
    symbol: "NOT",
    name: "Notcoin",
    icon: "https://assets.coingecko.com/coins/images/33566/standard/NOT.png",
    balance: 45000,
    priceUsd: 0.0095,
    decimals: 9,
    color: "#E2B714"
  },
  {
    id: "dogs",
    symbol: "DOGS",
    name: "DOGS Token",
    icon: "https://assets.coingecko.com/coins/images/38600/standard/DOGS.png",
    balance: 120000,
    priceUsd: 0.00065,
    decimals: 9,
    color: "#000000"
  },
  {
    id: "revt",
    symbol: "REVT",
    name: "Royalty Share Token",
    icon: TJ_COIN_ICON,
    balance: 85,
    priceUsd: 1.45,
    decimals: 6,
    color: "#10B981"
  }
];

export interface P2POffer {
  id: string;
  offererAddress: string;
  offererName?: string;
  offeredNFT: NFTItem;
  offeredTokenBonus?: { amount: string; symbol: string };
  requestedNFTTitle: string;
  requestedNFTId?: string;
  requestedTokenPrice?: { amount: string; symbol: string };
  createdAt: string;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
}

const INITIAL_P2P_OFFERS: P2POffer[] = [
  {
    id: "offer-1",
    offererAddress: "EQB8...f91a",
    offererName: "Alex.ton",
    offeredNFT: MOCK_NFTS[0] || {
      id: "nft-solar-04",
      trackId: "track-solar-04",
      title: "Solar Pulse Genesis #04",
      artist: "Cyber Beats",
      creator: "Cyber Beats",
      imageUrl: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse?width=300&height=300&nologo=true",
      coverUrl: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse?width=300&height=300&nologo=true",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
      price: "12.5",
      rarity: "Legendary",
      owner: "Alex.ton",
      edition: "1/1"
    },
    offeredTokenBonus: { amount: "2.5", symbol: "TON" },
    requestedNFTTitle: "Aura Beat Legendary #02",
    createdAt: "10 mins ago",
    status: "OPEN"
  },
  {
    id: "offer-2",
    offererAddress: "EQD1...904b",
    offererName: "VibesCollector",
    offeredNFT: MOCK_NFTS[1] || {
      id: "nft-aura-02",
      trackId: "track-aura-02",
      title: "Aura Beat Legendary #02",
      artist: "Aura Sound",
      creator: "Aura Sound",
      imageUrl: "https://image.pollinations.ai/prompt/glowing%20aesthetic%20crystal%20sound%20waves?width=300&height=300&nologo=true",
      coverUrl: "https://image.pollinations.ai/prompt/glowing%20aesthetic%20crystal%20sound%20waves?width=300&height=300&nologo=true",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a815e3.mp3",
      price: "25.0",
      rarity: "Rare",
      owner: "VibesCollector",
      edition: "1/5"
    },
    requestedNFTTitle: "Any Epic Dubstep Track",
    requestedTokenPrice: { amount: "10.0", symbol: "TON" },
    createdAt: "35 mins ago",
    status: "OPEN"
  }
];

export const Swap: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialNftId = searchParams.get("nftId");

  const { userNFTs } = useAudio();
  const { nfts: allNFTs, setNfts } = useNFT();
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Combine user's owned NFTs with fallback sample NFTs if user has none
  const availableUserNFTs = useMemo(() => {
    if (userNFTs && userNFTs.length > 0) return userNFTs;
    return allNFTs.slice(0, 4);
  }, [userNFTs, allNFTs]);

  // Selected Assets State
  const [fromType, setFromType] = useState<"NFT" | "TOKEN">("NFT");
  const [toType, setToType] = useState<"NFT" | "TOKEN">("TOKEN");

  const [selectedFromNFT, setSelectedFromNFT] = useState<NFTItem | null>(() => {
    if (initialNftId) {
      const match = allNFTs.find(n => n.id === initialNftId);
      if (match) return match;
    }
    return availableUserNFTs[0] || allNFTs[0] || null;
  });

  const [selectedFromToken, setSelectedFromToken] = useState<CryptoToken>(SUPPORTED_TOKENS[0]);
  const [fromTokenAmount, setFromTokenAmount] = useState<string>("10");

  const [selectedToNFT, setSelectedToNFT] = useState<NFTItem | null>(allNFTs[1] || null);
  const [selectedToToken, setSelectedToToken] = useState<CryptoToken>(SUPPORTED_TOKENS[1]); // JAM

  // DEX Settings
  const [slippage, setSlippage] = useState<number>(0.5);
  const [customSlippage, setCustomSlippage] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Asset Picker Drawer/Modal
  const [pickerTarget, setPickerTarget] = useState<"from" | "to" | null>(null);
  const [pickerTab, setPickerTab] = useState<"NFT" | "TOKEN">("NFT");
  const [pickerSearch, setPickerSearch] = useState<string>("");

  // Swap Processing state
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapStepIndex, setSwapStepIndex] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | null>(null);

  // P2P Offers Board state
  const [p2pOffers, setP2POffers] = useState<P2POffer[]>(INITIAL_P2P_OFFERS);
  const [activeTab, setActiveTab] = useState<"DEX_SWAP" | "P2P_BARTER" | "POOL_STATS">("DEX_SWAP");

  // Calculated Outputs
  const calculatedOutput = useMemo(() => {
    if (fromType === "NFT" && toType === "TOKEN") {
      const nftValueTon = parseFloat(selectedFromNFT?.price || "12.5");
      if (selectedToToken.symbol === "TON") {
        return {
          amount: nftValueTon.toFixed(2),
          amountUsd: (nftValueTon * SUPPORTED_TOKENS[0].priceUsd).toFixed(2),
          rateStr: `1 NFT ≈ ${nftValueTon} TON`
        };
      } else if (selectedToToken.symbol === "JAM") {
        const jamAmount = (nftValueTon * SUPPORTED_TOKENS[0].priceUsd) / selectedToToken.priceUsd;
        return {
          amount: Math.round(jamAmount).toString(),
          amountUsd: (nftValueTon * SUPPORTED_TOKENS[0].priceUsd).toFixed(2),
          rateStr: `1 NFT ≈ ${Math.round(jamAmount)} JAM`
        };
      } else {
        const amount = (nftValueTon * SUPPORTED_TOKENS[0].priceUsd) / selectedToToken.priceUsd;
        return {
          amount: amount.toFixed(1),
          amountUsd: (nftValueTon * SUPPORTED_TOKENS[0].priceUsd).toFixed(2),
          rateStr: `1 NFT ≈ ${amount.toFixed(1)} ${selectedToToken.symbol}`
        };
      }
    }

    if (fromType === "TOKEN" && toType === "NFT") {
      const targetNftValueTon = parseFloat(selectedToNFT?.price || "10.0");
      const targetNftValueUsd = targetNftValueTon * SUPPORTED_TOKENS[0].priceUsd;
      const requiredTokens = targetNftValueUsd / selectedFromToken.priceUsd;

      return {
        amount: "1",
        requiredFromTokens: requiredTokens.toFixed(2),
        amountUsd: targetNftValueUsd.toFixed(2),
        rateStr: `1 NFT ≈ ${requiredTokens.toFixed(1)} ${selectedFromToken.symbol}`
      };
    }

    if (fromType === "TOKEN" && toType === "TOKEN") {
      const inputVal = parseFloat(fromTokenAmount) || 0;
      const totalUsd = inputVal * selectedFromToken.priceUsd;
      const outputVal = totalUsd / selectedToToken.priceUsd;

      return {
        amount: outputVal > 10 ? Math.round(outputVal).toString() : outputVal.toFixed(3),
        amountUsd: totalUsd.toFixed(2),
        rateStr: `1 ${selectedFromToken.symbol} ≈ ${(selectedFromToken.priceUsd / selectedToToken.priceUsd).toFixed(4)} ${selectedToToken.symbol}`
      };
    }

    if (fromType === "NFT" && toType === "NFT") {
      const fromVal = parseFloat(selectedFromNFT?.price || "10.0");
      const toVal = parseFloat(selectedToNFT?.price || "12.0");
      const diffTon = (toVal - fromVal).toFixed(2);

      return {
        amount: "1",
        diffTon: parseFloat(diffTon) > 0 ? diffTon : "0.00",
        amountUsd: (toVal * SUPPORTED_TOKENS[0].priceUsd).toFixed(2),
        rateStr: `1 : 1 Direct Music NFT Barter`
      };
    }

    return { amount: "0.00", amountUsd: "0.00", rateStr: "" };
  }, [fromType, toType, selectedFromNFT, selectedFromToken, fromTokenAmount, selectedToNFT, selectedToToken]);

  // Flip From and To
  const handleFlipAssets = () => {
    const tempType = fromType;
    setFromType(toType);
    setToType(tempType);

    const tempNft = selectedFromNFT;
    setSelectedFromNFT(selectedToNFT);
    setSelectedToNFT(tempNft);

    const tempTok = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(tempTok);
  };

  // Perform Swap Execution
  const handleExecuteSwap = async () => {
    if (!userAddress && !tonConnectUI.connected) {
      toast.warning("Please connect your TON wallet to execute decentralised swaps");
      tonConnectUI.openModal();
      return;
    }

    setIsSwapping(true);
    setSwapStepIndex(0);

    const steps = [
      "Securing TON Blockchain Atomic Escrow Router...",
      "Signing Transaction Payload in TON Wallet...",
      "Routing Liquidity through STON.fi / DeDust Pools...",
      "Transferring NFT ownership & dispatching tokens..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setSwapStepIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    // Generate simulated tx hash
    const generatedHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setTxHash(generatedHash);
    setIsSwapping(false);

    // Confetti effect
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    toast.success("TON Swap Executed Successfully!", {
      description: `Tx: ${generatedHash.substring(0, 10)}...`
    });

    // Update local inventory state if user swapped an NFT
    if (fromType === "NFT" && selectedFromNFT) {
      setNfts(prev => prev.map(item => item.id === selectedFromNFT.id ? { ...item, owner: "TON DEX Liquidity Pool" } : item));
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#07091E] text-white p-3 sm:p-6 lg:p-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#0098EA]/20 to-[#5B6BFF]/20 text-[#0098EA]">
                <ArrowDownUp className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Music NFT Swap & DEX
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#0098EA]/15 text-[#0098EA] rounded-md uppercase tracking-wider">
                    TON Network
                  </span>
                </h1>
                <p className="text-xs text-[#9AA0AE] font-semibold">
                  Instantly trade Music NFTs for TON/JAM tokens or barter directly with artists
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-[#050A24] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("DEX_SWAP")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === "DEX_SWAP"
                  ? "bg-[#0098EA] text-white shadow-md"
                  : "text-[#9AA0AE] hover:text-white"
              }`}
            >
              Instant Swap
            </button>
            <button
              onClick={() => setActiveTab("P2P_BARTER")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "P2P_BARTER"
                  ? "bg-[#0098EA] text-white shadow-md"
                  : "text-[#9AA0AE] hover:text-white"
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              P2P Barter
            </button>
            <button
              onClick={() => setActiveTab("POOL_STATS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "POOL_STATS"
                  ? "bg-[#0098EA] text-white shadow-md"
                  : "text-[#9AA0AE] hover:text-white"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Pools
            </button>
          </div>
        </div>

        {/* MAIN SWAP INTERFACE CARD */}
        {activeTab === "DEX_SWAP" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left/Main Column: Swap Box */}
            <div className="lg:col-span-7 bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 space-y-4">
              
              {/* Swap Card Top Settings Bar */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-[#9AA0AE] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Auto Smart Router (STON.fi + DeDust)
                </span>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9AA0AE] hover:text-white transition-colors"
                  title="Swap Settings"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Drawer if toggled */}
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#050A24] rounded-xl p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Slippage Tolerance</span>
                      <span className="text-[10px] text-[#0098EA] font-semibold">
                        Current: {customSlippage ? `${customSlippage}%` : `${slippage}%`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[0.1, 0.5, 1.0].map((val) => (
                        <button
                          key={val}
                          onClick={() => {
                            setSlippage(val);
                            setCustomSlippage("");
                          }}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                            slippage === val && !customSlippage
                              ? "bg-[#0098EA] text-white"
                              : "bg-white/5 text-[#9AA0AE] hover:bg-white/10"
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                      <input
                        type="number"
                        placeholder="Custom"
                        value={customSlippage}
                        onChange={(e) => setCustomSlippage(e.target.value)}
                        className="w-20 px-2 py-1 rounded-lg bg-white/5 text-xs text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* FROM (PAY) BOX */}
              <div className="bg-[#050A24] rounded-xl p-3.5 space-y-2 hover:bg-[#070D30] transition-colors">
                <div className="flex items-center justify-between text-xs text-[#9AA0AE]">
                  <span className="font-bold">You Pay / Trade</span>
                  {fromType === "TOKEN" && (
                    <span className="font-semibold">
                      Balance: {selectedFromToken.balance} {selectedFromToken.symbol}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Selected Asset Display */}
                  <button
                    onClick={() => {
                      setPickerTarget("from");
                      setPickerTab(fromType);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all max-w-[210px] sm:max-w-[260px] truncate"
                  >
                    {fromType === "NFT" && selectedFromNFT ? (
                      <>
                        <img 
                          src={selectedFromNFT.coverUrl || selectedFromNFT.imageUrl} 
                          alt="" 
                          className="w-9 h-9 rounded-lg object-cover shrink-0" 
                        />
                        <div className="text-left min-w-0 truncate">
                          <p className="text-xs font-bold truncate">{selectedFromNFT.title}</p>
                          <p className="text-[10px] text-[#0098EA] font-semibold">{selectedFromNFT.price || "12.5"} TON</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={selectedFromToken.icon} alt="" className="w-8 h-8 rounded-full object-contain shrink-0" />
                        <div className="text-left">
                          <p className="text-xs font-black">{selectedFromToken.symbol}</p>
                          <p className="text-[10px] text-[#9AA0AE]">{selectedFromToken.name}</p>
                        </div>
                      </>
                    )}
                    <ChevronDown className="w-4 h-4 text-[#9AA0AE] shrink-0 ml-1" />
                  </button>

                  {/* Input / Quantity */}
                  <div className="text-right flex-1">
                    {fromType === "TOKEN" ? (
                      <input
                        type="number"
                        value={fromTokenAmount}
                        onChange={(e) => setFromTokenAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full text-right text-lg sm:text-2xl font-black bg-transparent text-white focus:outline-none"
                      />
                    ) : (
                      <span className="text-lg sm:text-2xl font-black text-white">1 NFT</span>
                    )}
                    <p className="text-[10px] text-[#9AA0AE] font-semibold mt-0.5">
                      ≈ ${fromType === "NFT" ? (parseFloat(selectedFromNFT?.price || "12.5") * SUPPORTED_TOKENS[0].priceUsd).toFixed(2) : (parseFloat(fromTokenAmount || "0") * selectedFromToken.priceUsd).toFixed(2)} USD
                    </p>
                  </div>
                </div>
              </div>

              {/* CENTER FLIP BUTTON */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={handleFlipAssets}
                  className="p-2.5 rounded-full bg-[#0098EA] text-white hover:scale-110 active:scale-90 transition-all shadow-lg hover:bg-[#0098EA]/90"
                  title="Swap Pay and Receive"
                >
                  <ArrowDownUp className="w-4 h-4" />
                </button>
              </div>

              {/* TO (RECEIVE) BOX */}
              <div className="bg-[#050A24] rounded-xl p-3.5 space-y-2 hover:bg-[#070D30] transition-colors">
                <div className="flex items-center justify-between text-xs text-[#9AA0AE]">
                  <span className="font-bold">You Receive (Estimated)</span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Best Route
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Selected Asset Display */}
                  <button
                    onClick={() => {
                      setPickerTarget("to");
                      setPickerTab(toType);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all max-w-[210px] sm:max-w-[260px] truncate"
                  >
                    {toType === "NFT" && selectedToNFT ? (
                      <>
                        <img 
                          src={selectedToNFT.coverUrl || selectedToNFT.imageUrl} 
                          alt="" 
                          className="w-9 h-9 rounded-lg object-cover shrink-0" 
                        />
                        <div className="text-left min-w-0 truncate">
                          <p className="text-xs font-bold truncate">{selectedToNFT.title}</p>
                          <p className="text-[10px] text-[#0098EA] font-semibold">{selectedToNFT.price || "10.0"} TON</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={selectedToToken.icon} alt="" className="w-8 h-8 rounded-full object-contain shrink-0" />
                        <div className="text-left">
                          <p className="text-xs font-black">{selectedToToken.symbol}</p>
                          <p className="text-[10px] text-[#9AA0AE]">{selectedToToken.name}</p>
                        </div>
                      </>
                    )}
                    <ChevronDown className="w-4 h-4 text-[#9AA0AE] shrink-0 ml-1" />
                  </button>

                  {/* Calculated Receive Value */}
                  <div className="text-right flex-1">
                    <p className="text-lg sm:text-2xl font-black text-emerald-400">
                      {calculatedOutput.amount} {toType === "TOKEN" ? selectedToToken.symbol : "NFT"}
                    </p>
                    <p className="text-[10px] text-[#9AA0AE] font-semibold mt-0.5">
                      ≈ ${calculatedOutput.amountUsd} USD
                    </p>
                  </div>
                </div>
              </div>

              {/* QUOTE DETAILS ACCORDION */}
              <div className="bg-[#050A24]/60 rounded-xl p-3 space-y-2 text-xs text-[#9AA0AE]">
                <div className="flex items-center justify-between">
                  <span>Exchange Rate</span>
                  <span className="font-mono text-white font-semibold">{calculatedOutput.rateStr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network Fee (TON)</span>
                  <span className="font-mono text-slate-300">~0.04 TON</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Slippage Tolerance</span>
                  <span className="font-mono text-[#0098EA] font-bold">
                    {customSlippage ? `${customSlippage}%` : `${slippage}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Price Impact</span>
                  <span className="font-mono text-emerald-400 font-bold">&lt; 0.08%</span>
                </div>
              </div>

              {/* EXECUTE SWAP ACTION BUTTON */}
              <button
                onClick={handleExecuteSwap}
                disabled={isSwapping}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0098EA] via-[#3B82F6] to-[#5B6BFF] text-white font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#0098EA]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSwapping ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Executing TON Swap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Swap Assets Now
                  </>
                )}
              </button>

            </div>

            {/* Right Column: Active Market Pairs & Recent Swaps */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Liquidity Overview Card */}
              <div className="bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  TonJam Liquidity Pool Stats
                </h3>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-[#050A24] p-2.5 rounded-xl">
                    <p className="text-[10px] text-[#9AA0AE] font-bold">Total Liquidity</p>
                    <p className="text-sm font-black text-white mt-0.5">$1.48M USD</p>
                  </div>
                  <div className="bg-[#050A24] p-2.5 rounded-xl">
                    <p className="text-[10px] text-[#9AA0AE] font-bold">24h Trading Vol</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">$324,190</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#050A24] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <img src={TON_LOGO} alt="" className="w-4 h-4 object-contain" />
                      TON / JAM Pool
                    </span>
                    <span className="text-emerald-400 font-extrabold">+18.4% APY</span>
                  </div>
                  <p className="text-[10px] text-[#9AA0AE]">
                    Earn trading fees and reward shares on every DEX swap executed across TON.
                  </p>
                </div>
              </div>

              {/* Recent Live Swaps Feed */}
              <div className="bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#0098EA]" />
                    Live DEX Activity
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
                  {[
                    { user: "EQB8...f91a", action: "Swapped 'Solar Pulse #04' for 12.5 TON", time: "2m ago", hash: "0x89...a12" },
                    { user: "EQD1...904b", action: "Traded 500 JAM for 0.85 TON", time: "5m ago", hash: "0x34...e90" },
                    { user: "EQC4...2291", action: "Bartered 'Aura Beat' for 'Neon Nights'", time: "9m ago", hash: "0x7a...1b4" },
                    { user: "EQA2...441e", action: "Swapped 100 TON for 8,500 JAM", time: "14m ago", hash: "0x1d...6e3" }
                  ].map((swap, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#050A24] text-xs flex items-center justify-between hover:bg-[#070D30] transition-colors">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-white text-[11px] truncate">{swap.action}</p>
                        <p className="text-[9px] text-[#9AA0AE] font-mono mt-0.5">{swap.user} • {swap.time}</p>
                      </div>
                      <a 
                        href={`https://tonscan.org/tx/${swap.hash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 text-[#9AA0AE] hover:text-[#0098EA] shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* P2P BARTER BOARD */}
        {activeTab === "P2P_BARTER" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Peer-to-Peer Music NFT Barter Board</h2>
                <p className="text-xs text-[#9AA0AE]">
                  Directly trade Music NFTs with other collectors without liquidity slippage
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p2pOffers.map((offer) => (
                <div key={offer.id} className="bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0098EA] flex items-center gap-1">
                      Offered by {offer.offererName || offer.offererAddress}
                    </span>
                    <span className="text-[10px] text-[#9AA0AE]">{offer.createdAt}</span>
                  </div>

                  {/* Offered Item */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#050A24]">
                    <img 
                      src={offer.offeredNFT.coverUrl || offer.offeredNFT.imageUrl} 
                      alt="" 
                      className="w-12 h-12 rounded-lg object-cover" 
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Offering</span>
                      <h4 className="text-xs font-black text-white truncate">{offer.offeredNFT.title}</h4>
                      <p className="text-[10px] text-[#9AA0AE]">{offer.offeredNFT.artist}</p>
                    </div>
                    {offer.offeredTokenBonus && (
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        +{offer.offeredTokenBonus.amount} {offer.offeredTokenBonus.symbol}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center -my-1">
                    <ArrowDownUp className="w-4 h-4 text-[#9AA0AE]" />
                  </div>

                  {/* Requested Item */}
                  <div className="p-2.5 rounded-xl bg-[#050A24] text-xs space-y-1">
                    <span className="text-[9px] font-black text-[#0098EA] uppercase tracking-wider">Requesting</span>
                    <p className="font-bold text-white">{offer.requestedNFTTitle}</p>
                  </div>

                  <button
                    onClick={() => {
                      toast.success(`Barter Proposal Accepted for ${offer.offeredNFT.title}!`);
                      confetti({ particleCount: 80 });
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0098EA] text-white font-black text-xs uppercase tracking-wider hover:bg-[#0098EA]/90 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    Accept Trade Offer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POOLS STATS */}
        {activeTab === "POOL_STATS" && (
          <div className="bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-white">TON Music NFT DEX Pools</h2>
            <div className="space-y-3">
              {[
                { pair: "TON / JAM Pool", tvl: "$840,200", apr: "22.4%", vol24: "$145,000" },
                { pair: "Genesis Music NFT Vault", tvl: "$420,100", apr: "18.1%", vol24: "$98,400" },
                { pair: "TON / NOT Pool", tvl: "$220,000", apr: "14.5%", vol24: "$45,200" }
              ].map((p, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#050A24] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-black text-white text-sm">{p.pair}</h4>
                    <p className="text-[10px] text-[#9AA0AE]">TVL: {p.tvl}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-sm">{p.apr} APR</span>
                    <p className="text-[10px] text-[#9AA0AE]">24h Vol: {p.vol24}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ASSET PICKER DRAWER / MODAL */}
      <AnimatePresence>
        {pickerTarget && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0A113A] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">
                  Select {pickerTarget === "from" ? "Pay / Trade" : "Receive"} Asset
                </h3>
                <button
                  onClick={() => setPickerTarget(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9AA0AE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Picker Tab Switcher */}
              <div className="flex bg-[#050A24] p-1 rounded-xl">
                <button
                  onClick={() => setPickerTab("NFT")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pickerTab === "NFT" ? "bg-[#0098EA] text-white" : "text-[#9AA0AE]"
                  }`}
                >
                  Music NFTs
                </button>
                <button
                  onClick={() => setPickerTab("TOKEN")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pickerTab === "TOKEN" ? "bg-[#0098EA] text-white" : "text-[#9AA0AE]"
                  }`}
                >
                  Crypto Tokens
                </button>
              </div>

              {/* Items List */}
              <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                {pickerTab === "NFT" ? (
                  availableUserNFTs.map((nft) => (
                    <div
                      key={nft.id}
                      onClick={() => {
                        if (pickerTarget === "from") {
                          setFromType("NFT");
                          setSelectedFromNFT(nft);
                        } else {
                          setToType("NFT");
                          setSelectedToNFT(nft);
                        }
                        setPickerTarget(null);
                      }}
                      className="p-3 rounded-xl bg-[#050A24] hover:bg-[#101A3B] transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img src={nft.coverUrl || nft.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-bold text-white">{nft.title}</p>
                          <p className="text-[10px] text-[#9AA0AE]">{nft.artist}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#0098EA]">{nft.price || "12.5"} TON</span>
                    </div>
                  ))
                ) : (
                  SUPPORTED_TOKENS.map((token) => (
                    <div
                      key={token.id}
                      onClick={() => {
                        if (pickerTarget === "from") {
                          setFromType("TOKEN");
                          setSelectedFromToken(token);
                        } else {
                          setToType("TOKEN");
                          setSelectedToToken(token);
                        }
                        setPickerTarget(null);
                      }}
                      className="p-3 rounded-xl bg-[#050A24] hover:bg-[#101A3B] transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img src={token.icon} alt="" className="w-8 h-8 rounded-full object-contain" />
                        <div>
                          <p className="text-xs font-black text-white">{token.symbol}</p>
                          <p className="text-[10px] text-[#9AA0AE]">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white">{token.balance} {token.symbol}</p>
                        <p className="text-[10px] text-[#9AA0AE]">${token.priceUsd} USD</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SWAP PROGRESS MODAL OVERLAY */}
      <AnimatePresence>
        {isSwapping && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#0A113A] rounded-2xl p-6 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#0098EA]/20 text-[#0098EA] mx-auto flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Swapping on TON Blockchain</h3>
                <p className="text-xs text-[#0098EA] font-semibold mt-1">
                  Step {swapStepIndex + 1} of 4
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2 text-left text-xs bg-[#050A24] p-3.5 rounded-xl">
                {[
                  "Securing TON Blockchain Atomic Escrow Router...",
                  "Signing Transaction Payload in TON Wallet...",
                  "Routing Liquidity through STON.fi / DeDust Pools...",
                  "Transferring NFT ownership & dispatching tokens..."
                ].map((stepMsg, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {idx < swapStepIndex ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : idx === swapStepIndex ? (
                      <RefreshCw className="w-4 h-4 text-[#0098EA] animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                    )}
                    <span className={idx <= swapStepIndex ? "text-white font-medium" : "text-white/40"}>
                      {stepMsg}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Swap;

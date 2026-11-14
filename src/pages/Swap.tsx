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
import { TON_LOGO, TJ_COIN_ICON } from "@/constants";
import { NFTItem } from "@/types";
import { toast } from "sonner";

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
    balance: 0,
    priceUsd: 0,
    decimals: 9,
    color: "#0098EA"
  },
  {
    id: "jam",
    symbol: "JAM",
    name: "TonJam Token",
    icon: TJ_COIN_ICON,
    balance: 0,
    priceUsd: 0,
    decimals: 6,
    color: "#5B6BFF"
  },
  {
    id: "not",
    symbol: "NOT",
    name: "Notcoin",
    icon: "https://assets.coingecko.com/coins/images/33566/standard/NOT.png",
    balance: 0,
    priceUsd: 0,
    decimals: 9,
    color: "#E2B714"
  },
  {
    id: "dogs",
    symbol: "DOGS",
    name: "DOGS Token",
    icon: "https://assets.coingecko.com/coins/images/38600/standard/DOGS.png",
    balance: 0,
    priceUsd: 0,
    decimals: 9,
    color: "#000000"
  },
  {
    id: "revt",
    symbol: "REVT",
    name: "Royalty Share Token",
    icon: TJ_COIN_ICON,
    balance: 0,
    priceUsd: 0,
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

export const Swap: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialNftId = searchParams.get("nftId");

  const { userNFTs, userProfile, transactions } = useAudio();
  const { nfts: allNFTs } = useNFT();
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Only show real NFTs available in inventory/catalog
  const availableUserNFTs = useMemo(() => {
    if (userNFTs && userNFTs.length > 0) return userNFTs;
    return allNFTs;
  }, [userNFTs, allNFTs]);

  const tokensWithRealBalances = useMemo(() => {
    return SUPPORTED_TOKENS.map(t => {
      if (t.symbol === "JAM") {
        return { ...t, balance: userProfile.tjBalance || 0 };
      }
      return t;
    });
  }, [userProfile.tjBalance]);

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

  const [selectedFromToken, setSelectedFromToken] = useState<CryptoToken>(tokensWithRealBalances[0]);
  const [fromTokenAmount, setFromTokenAmount] = useState<string>("0");

  const [selectedToNFT, setSelectedToNFT] = useState<NFTItem | null>(allNFTs[1] || null);
  const [selectedToToken, setSelectedToToken] = useState<CryptoToken>(tokensWithRealBalances[1]); // JAM

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

  // P2P Offers Board state (backed by real marketplace offers when available)
  const p2pOffers: P2POffer[] = [];
  const [activeTab, setActiveTab] = useState<"DEX_SWAP" | "P2P_BARTER" | "POOL_STATS">("DEX_SWAP");

  const swapTransactions = useMemo(
    () => transactions.filter((tx: any) => tx.type === "swap" || tx.category === "swap"),
    [transactions]
  );

  // Calculated Outputs
  const calculatedOutput = useMemo(() => {
    if (fromType === "NFT" && toType === "TOKEN") {
      const nftValueTon = parseFloat(selectedFromNFT?.price || "0");
      if (selectedToToken.symbol === "TON" || selectedToToken.priceUsd <= 0 || tokensWithRealBalances[0].priceUsd <= 0) {
        return {
          amount: nftValueTon.toFixed(2),
          amountUsd: (nftValueTon * tokensWithRealBalances[0].priceUsd).toFixed(2),
          rateStr: selectedFromNFT ? `1 NFT ≈ ${nftValueTon} TON` : "No NFT selected"
        };
      }
      const amount = (nftValueTon * tokensWithRealBalances[0].priceUsd) / selectedToToken.priceUsd;
      return {
        amount: amount.toFixed(2),
        amountUsd: (nftValueTon * tokensWithRealBalances[0].priceUsd).toFixed(2),
        rateStr: `1 NFT ≈ ${amount.toFixed(2)} ${selectedToToken.symbol}`
      };
    }

    if (fromType === "TOKEN" && toType === "NFT") {
      const targetNftValueTon = parseFloat(selectedToNFT?.price || "0");
      return {
        amount: selectedToNFT ? "1" : "0",
        amountUsd: (targetNftValueTon * tokensWithRealBalances[0].priceUsd).toFixed(2),
        rateStr: selectedToNFT ? `1 NFT ≈ ${targetNftValueTon} TON` : "No NFT selected"
      };
    }

    if (fromType === "TOKEN" && toType === "TOKEN") {
      const inputVal = parseFloat(fromTokenAmount) || 0;
      return {
        amount: inputVal > 0 && selectedToToken.priceUsd > 0 && selectedFromToken.priceUsd > 0
          ? ((inputVal * selectedFromToken.priceUsd) / selectedToToken.priceUsd).toFixed(3)
          : "0.00",
        amountUsd: (inputVal * selectedFromToken.priceUsd).toFixed(2),
        rateStr: "On-chain quote pending live DEX router"
      };
    }

    if (fromType === "NFT" && toType === "NFT") {
      return {
        amount: selectedFromNFT && selectedToNFT ? "1" : "0",
        amountUsd: "0.00",
        rateStr: `1 : 1 Direct Music NFT Barter`
      };
    }

    return { amount: "0.00", amountUsd: "0.00", rateStr: "" };
  }, [fromType, toType, selectedFromNFT, selectedFromToken, fromTokenAmount, selectedToNFT, selectedToToken, tokensWithRealBalances]);

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

    toast.error("On-chain DEX swap router contract is not configured for this network yet.");
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
                    <p className="text-sm font-black text-white mt-0.5">$0.00 USD</p>
                  </div>
                  <div className="bg-[#050A24] p-2.5 rounded-xl">
                    <p className="text-[10px] text-[#9AA0AE] font-bold">24h Trading Vol</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">$0.00</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#050A24] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <img src={TON_LOGO} alt="" className="w-4 h-4 object-contain" />
                      TON / JAM Pool
                    </span>
                    <span className="text-[#9AA0AE] font-extrabold">-- APY</span>
                  </div>
                  <p className="text-[10px] text-[#9AA0AE]">
                    Connect your wallet and deploy/link a live DEX pool contract to track real-time pool APR.
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

                {swapTransactions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#050A24] text-center text-xs text-[#9AA0AE]">
                    No on-chain swap transactions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
                    {swapTransactions.slice(0, 10).map((swap: any) => (
                      <div key={swap.id} className="p-2.5 rounded-xl bg-[#050A24] text-xs flex items-center justify-between hover:bg-[#070D30] transition-colors">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-white text-[11px] truncate">{swap.description || swap.title || 'Swap transaction'}</p>
                          <p className="text-[9px] text-[#9AA0AE] font-mono mt-0.5">{swap.amount} {swap.currency || 'TON'}</p>
                        </div>
                        {swap.txHash && (
                          <a 
                            href={`https://tonviewer.com/transaction/${swap.txHash}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 text-[#9AA0AE] hover:text-[#0098EA] shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

            {p2pOffers.length === 0 ? (
              <div className="bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-8 text-center text-xs text-[#9AA0AE]">
                No open P2P barter proposals available right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {p2pOffers.map((offer) => (
                  <div key={offer.id} className="bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0098EA] flex items-center gap-1">
                        Offered by {offer.offererName || offer.offererAddress}
                      </span>
                      <span className="text-[10px] text-[#9AA0AE]">{offer.createdAt}</span>
                    </div>

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
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#050A24] text-xs space-y-1">
                      <span className="text-[9px] font-black text-[#0098EA] uppercase tracking-wider">Requesting</span>
                      <p className="font-bold text-white">{offer.requestedNFTTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* POOLS STATS */}
        {activeTab === "POOL_STATS" && (
          <div className="bg-[#0A113A]/70 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-white">TON Music NFT DEX Pools</h2>
            <div className="p-6 rounded-xl bg-[#050A24] text-center text-xs text-[#9AA0AE]">
              No active on-chain liquidity pools indexed for this network yet.
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
                  tokensWithRealBalances.map((token) => (
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

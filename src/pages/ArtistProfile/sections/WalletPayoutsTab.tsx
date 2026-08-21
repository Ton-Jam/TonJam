import * as React from "react";
import { Artist, RoyaltySplit } from "@/types";
import { 
  Wallet, ArrowUpRight, Zap, CheckCircle2, ShieldCheck, 
  ExternalLink, Copy, Check, RefreshCw, Sparkles, DollarSign,
  TrendingUp, Radio, Disc, ArrowDownRight, Sliders, Layers,
  Lock, AlertCircle, QrCode
} from "lucide-react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { ArtistWalletQRModal } from "@/components/ArtistWalletQRModal";

interface WalletPayoutsTabProps {
  artist: Artist;
}

interface PayoutTransaction {
  id: string;
  txHash: string;
  type: "streaming_royalty" | "nft_sale" | "nft_resale_royalty" | "fan_tip";
  title: string;
  amountTON: number;
  amountUSD: number;
  timestamp: string;
  destinationWallet: string;
  status: "settled" | "pending";
}

export const WalletPayoutsTab: React.FC<WalletPayoutsTabProps> = ({ artist }) => {
  const { user } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const connectedTonAddress = useTonAddress();
  
  const isOwnProfile = user?.uid === artist.uid;
  const activeWallet = artist.walletAddress || connectedTonAddress || "UQCc_DJ_Krupy_Vibez_x9y1_8888";

  const [copied, setCopied] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = React.useState(true);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [streamingEarnings, setStreamingEarnings] = React.useState(artist.earnings?.streaming || 284.5);
  const [nftEarnings, setNftEarnings] = React.useState(artist.earnings?.nftSales || 1480.0);
  const [pendingBalance, setPendingBalance] = React.useState(14.85);

  // Live Payout Ledger History
  const [payouts, setPayouts] = React.useState<PayoutTransaction[]>([
    {
      id: "tx-101",
      txHash: "0x8f2a...c4e1",
      type: "nft_resale_royalty",
      title: "Resale: Solar Pulse Master #04 (10% Creator Royalty)",
      amountTON: 1.5,
      amountUSD: 7.5,
      timestamp: "12 mins ago",
      destinationWallet: activeWallet,
      status: "settled"
    },
    {
      id: "tx-102",
      txHash: "0x4b7c...9a02",
      type: "streaming_royalty",
      title: "Stream Pool Payout (12,400 on-chain streams)",
      amountTON: 12.4,
      amountUSD: 62.0,
      timestamp: "2 hours ago",
      destinationWallet: activeWallet,
      status: "settled"
    },
    {
      id: "tx-103",
      txHash: "0x1d3e...77f9",
      type: "nft_sale",
      title: "Primary Mint: Quantum Leap Vinyl Drop #12",
      amountTON: 25.0,
      amountUSD: 125.0,
      timestamp: "Yesterday",
      destinationWallet: activeWallet,
      status: "settled"
    },
    {
      id: "tx-104",
      txHash: "0x99a1...bb44",
      type: "fan_tip",
      title: "Community Tip: Fan Leaderboard Reward",
      amountTON: 5.0,
      amountUSD: 25.0,
      timestamp: "3 days ago",
      destinationWallet: activeWallet,
      status: "settled"
    },
    {
      id: "tx-105",
      txHash: "0x33e8...ff11",
      type: "streaming_royalty",
      title: "Stream Pool Micro-settlement (8,500 plays)",
      amountTON: 8.5,
      amountUSD: 42.5,
      timestamp: "5 days ago",
      destinationWallet: activeWallet,
      status: "settled"
    }
  ]);

  const totalEarningsTON = (streamingEarnings + nftEarnings).toFixed(2);
  const totalEarningsUSD = ((streamingEarnings + nftEarnings) * 5.0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(activeWallet);
    setCopied(true);
    toast.success("Wallet address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate Instant Stream Royalty Payout
  const handleSimulateStreamPayout = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const payoutAmount = 0.85;
      const newTx: PayoutTransaction = {
        id: `tx-${Date.now()}`,
        txHash: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
        type: "streaming_royalty",
        title: "Real-Time Micro-Payout (850 on-chain streams)",
        amountTON: payoutAmount,
        amountUSD: payoutAmount * 5.0,
        timestamp: "Just now",
        destinationWallet: activeWallet,
        status: "settled"
      };

      setPayouts(prev => [newTx, ...prev]);
      setStreamingEarnings(prev => Number((prev + payoutAmount).toFixed(3)));
      setIsSimulating(false);
      toast.success(`⚡ Auto-Payout: +${payoutAmount} TON received for real-time streams!`);
    }, 900);
  };

  // Simulate Instant NFT Resale Royalty Payout
  const handleSimulateNFTPayout = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const saleAmount = 20.0;
      const royaltyAmount = saleAmount * 0.10; // 10% creator cut
      const newTx: PayoutTransaction = {
        id: `tx-${Date.now()}`,
        txHash: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
        type: "nft_resale_royalty",
        title: "Secondary Resale Royalty: 10% of 20 TON Sale",
        amountTON: royaltyAmount,
        amountUSD: royaltyAmount * 5.0,
        timestamp: "Just now",
        destinationWallet: activeWallet,
        status: "settled"
      };

      setPayouts(prev => [newTx, ...prev]);
      setNftEarnings(prev => Number((prev + royaltyAmount).toFixed(2)));
      setIsSimulating(false);
      toast.success(`🎉 Auto-Payout: +${royaltyAmount} TON received from NFT Resale Royalty!`);
    }, 900);
  };

  // Claim pending balance immediately
  const handleClaimPending = () => {
    if (pendingBalance <= 0) return;
    const amountToClaim = pendingBalance;
    const newTx: PayoutTransaction = {
      id: `tx-${Date.now()}`,
      txHash: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
      type: "streaming_royalty",
      title: "Manual Stream Pool Settlement Claim",
      amountTON: amountToClaim,
      amountUSD: amountToClaim * 5.0,
      timestamp: "Just now",
      destinationWallet: activeWallet,
      status: "settled"
    };

    setPayouts(prev => [newTx, ...prev]);
    setStreamingEarnings(prev => Number((prev + amountToClaim).toFixed(2)));
    setPendingBalance(0);
    toast.success(`Successfully claimed ${amountToClaim.toFixed(2)} TON to connected wallet!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in" id="tonjam-wallet-payouts-tab">
      
      {/* 1. CONNECTED WALLET & AUTO-PAYOUT STATUS HERO */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Wallet Address & Verification Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2.5 rounded-2xl bg-[#0098EA]/10 text-[#0098EA]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    TON Payout Protocol
                  </h3>
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    Auto-Payout Active
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-medium">
                  Direct smart contract payout routing for NFT primary drops, secondary resales & streaming pools.
                </p>
              </div>
            </div>

            {/* Wallet Address Chip */}
            <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-2 rounded-2xl max-w-xl">
              <span className="text-xs font-mono text-neutral-300 truncate">
                {activeWallet}
              </span>
              <button
                onClick={() => setShowQRModal(true)}
                className="p-1.5 hover:bg-white/[0.08] text-[#0098EA] hover:text-[#38bdf8] rounded-lg transition-colors cursor-pointer shrink-0"
                title="Generate Wallet Tip QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopyWallet}
                className="p-1.5 hover:bg-white/[0.08] text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                title="Copy Wallet Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`https://tonscan.org/address/${activeWallet}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:bg-white/[0.08] text-neutral-400 hover:text-[#0098EA] rounded-lg transition-colors shrink-0"
                title="View on TONScan Explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Auto-Payout Switch & Wallet Connect Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            <div className="bg-white/[0.03] p-3 rounded-2xl flex items-center justify-between sm:justify-start gap-4">
              <div>
                <span className="text-[11px] font-bold text-neutral-300 block uppercase tracking-wider">
                  Instant Auto-Forward
                </span>
                <span className="text-[10px] text-neutral-500">
                  {autoPayoutEnabled ? "Real-time to wallet" : "Accumulate in pool"}
                </span>
              </div>
              <button
                onClick={() => setAutoPayoutEnabled(prev => !prev)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${
                  autoPayoutEnabled ? "bg-[#1DB954]" : "bg-neutral-800"
                }`}
              >
                <span 
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    autoPayoutEnabled ? "right-1" : "left-1"
                  }`} 
                />
              </button>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => tonConnectUI.openModal()}
                className="px-5 py-3 bg-[#0098EA] hover:bg-[#0087d1] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                {connectedTonAddress ? "Manage TON Wallet" : "Connect TON Wallet"}
              </button>
            )}
          </div>
        </div>

        {/* 2. REVENUE METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Card 1: Total Paid Out */}
          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total On-Chain Earnings</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalEarningsTON} <span className="text-sm font-sans font-bold text-[#0098EA]">TON</span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                ≈ ${totalEarningsUSD} USD
              </span>
            </div>
          </div>

          {/* Card 2: Streaming Royalties */}
          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">Streaming Royalties</span>
              <Disc className="w-4 h-4 text-[#1DB954]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {streamingEarnings.toFixed(1)} <span className="text-sm font-sans font-bold text-[#1DB954]">TON</span>
              </div>
              <span className="text-xs text-neutral-400">
                0.001 TON / verified stream
              </span>
            </div>
          </div>

          {/* Card 3: NFT Sales & Resales */}
          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">NFT Sales & Cuts</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {nftEarnings.toFixed(1)} <span className="text-sm font-sans font-bold text-purple-400">TON</span>
              </div>
              <span className="text-xs text-neutral-400">
                10%-20% secondary creator fee
              </span>
            </div>
          </div>

          {/* Card 4: Pending Pool */}
          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Settlement</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {pendingBalance.toFixed(2)} <span className="text-sm font-sans font-bold text-amber-400">TON</span>
              </div>
              <button
                onClick={handleClaimPending}
                disabled={pendingBalance <= 0}
                className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Claim to Wallet
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. AUTOMATIC PAYOUT RULES & SPLITS CONFIGURATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Royalty Splits Structure */}
        <div className="lg:col-span-6 bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Automated Split Configuration
              </h4>
            </div>
            <span className="text-xs text-emerald-400 font-bold">100% Allocated</span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Whenever a track is streamed or an NFT is sold, smart contracts automatically distribute payouts directly to each configured beneficiary:
          </p>

          <div className="space-y-3">
            {/* Lead Artist */}
            <div className="bg-white/[0.02] p-3.5 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-white">Lead Artist ({artist.name})</span>
                <span className="text-[#1DB954] font-mono font-bold">80.0%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#1DB954] rounded-full" style={{ width: "80%" }} />
              </div>
              <span className="text-[10px] text-neutral-500 font-mono truncate block">
                {activeWallet}
              </span>
            </div>

            {/* Co-Producer Split */}
            <div className="bg-white/[0.02] p-3.5 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-white">Producer / Audio Engineer</span>
                <span className="text-blue-400 font-mono font-bold">10.0%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: "10%" }} />
              </div>
              <span className="text-[10px] text-neutral-500 font-mono truncate block">
                UQBg_AudioMaster_EchoPhase_9921
              </span>
            </div>

            {/* DAO & Community Treasury */}
            <div className="bg-white/[0.02] p-3.5 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-white">TonJam Staking & Community Pool</span>
                <span className="text-purple-400 font-mono font-bold">10.0%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: "10%" }} />
              </div>
              <span className="text-[10px] text-neutral-500 font-mono truncate block">
                UQDAO_TonJam_Liquidity_Vault
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Auto-Payout Simulator */}
        <div className="lg:col-span-6 bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Auto-Payout Simulator
              </h4>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Test how on-chain listener events and secondary marketplace sales trigger immediate automatic payouts directly to the artist's TON wallet.
            </p>
          </div>

          <div className="space-y-3 bg-white/[0.02] p-4.5 rounded-2xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Streaming Protocol Micro-Payout</span>
              <span className="text-[#1DB954] font-bold font-mono">+0.85 TON</span>
            </div>
            <button
              onClick={handleSimulateStreamPayout}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
              <span>Simulate 850 Streams Payout</span>
            </button>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-neutral-400">NFT Resale 10% Royalty Split</span>
              <span className="text-purple-400 font-bold font-mono">+2.00 TON</span>
            </div>
            <button
              onClick={handleSimulateNFTPayout}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Simulate 20 TON NFT Resale (10% Royalty)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Executed natively via TON Jetton and NFT smart contract callbacks.</span>
          </div>
        </div>

      </div>

      {/* 4. REAL-TIME PAYOUT LEDGER (Transaction History) */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Automatic Payout Ledger
            </h4>
            <p className="text-xs text-neutral-400">
              Complete on-chain audit trail of all streaming royalties and NFT sales deposited to this artist.
            </p>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {payouts.length} Events
          </span>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {payouts.map((tx) => {
              const isStream = tx.type === "streaming_royalty";
              const isNFT = tx.type.includes("nft");

              return (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key={tx.id}
                  className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isStream 
                        ? "bg-[#1DB954]/10 text-[#1DB954]" 
                        : isNFT 
                        ? "bg-purple-500/10 text-purple-400" 
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {isStream ? <Disc className="w-4 h-4" /> : isNFT ? <Sparkles className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                        {tx.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 flex-wrap">
                        <span className="font-mono text-neutral-500">TX: {tx.txHash}</span>
                        <span>•</span>
                        <span>{tx.timestamp}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Settled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-white font-mono flex items-center sm:justify-end gap-1">
                      <span className="text-[#1DB954]">+{tx.amountTON.toFixed(2)}</span>
                      <span className="text-xs font-bold text-neutral-400">TON</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono block">
                      ≈ ${tx.amountUSD.toFixed(2)} USD
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <ArtistWalletQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        artist={artist}
      />
    </div>
  );
};

export default WalletPayoutsTab;
